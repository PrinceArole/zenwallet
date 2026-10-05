const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const User = require('../models/User');
const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');
const Budget = require('../models/MonthlyBudget');
const { cookieName } = require('../middleware/requireAuth');

const router = express.Router();
const sessionDuration = 7 * 24 * 60 * 60 * 1000;

function serializeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function setSessionCookie(res, userId) {
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: sessionDuration,
    path: '/',
  });
}

router.post('/register', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({ error: 'Le nom doit contenir entre 2 et 80 caractères.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Adresse e-mail invalide.' });
  }
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir entre 8 et 72 caractères.' });
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return res.status(503).json({ error: 'Authentification indisponible : configure JWT_SECRET (32 caractères minimum).' });
  }

  try {
    const user = await sequelize.transaction(async (transaction) => {
      const isFirstUser = (await User.count({ transaction })) === 0;
      const createdUser = await User.create({
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
      }, { transaction });

      if (isFirstUser) {
        const legacyOwnership = { user_id: createdUser.id };
        const unownedRows = { user_id: { [Op.is]: null } };
        await Promise.all([
          Revenue.update(legacyOwnership, { where: unownedRows, transaction }),
          Expense.update(legacyOwnership, { where: unownedRows, transaction }),
          Budget.update(legacyOwnership, { where: unownedRows, transaction }),
        ]);
      }

      return createdUser;
    });

    setSessionCookie(res, user.id);
    return res.status(201).json({ user: serializeUser(user) });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Un compte utilise déjà cette adresse e-mail.' });
    }
    console.error('Erreur lors de la création du compte :', error);
    return res.status(500).json({ error: 'Impossible de créer le compte pour le moment.' });
  }
});

router.post('/login', async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return res.status(503).json({ error: 'Authentification indisponible : configure JWT_SECRET (32 caractères minimum).' });
  }

  try {
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Adresse e-mail ou mot de passe incorrect.' });
    }

    setSessionCookie(res, user.id);
    return res.json({ user: serializeUser(user) });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    return res.status(500).json({ error: 'Impossible de te connecter pour le moment.' });
  }
});

router.get('/me', async (req, res) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return res.status(503).json({ error: 'Authentification indisponible : configure JWT_SECRET (32 caractères minimum).' });
  }

  const token = req.cookies && req.cookies[cookieName];
  if (!token) return res.json({ user: null });

  let userId;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    userId = payload.sub;
  } catch (error) {
    if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
      return res.json({ user: null });
    }
    console.error('Erreur lors de la validation de la session :', error);
    return res.status(500).json({ error: 'Impossible de vérifier la session.' });
  }

  try {
    const user = await User.findByPk(userId);
    return res.json({ user: user ? serializeUser(user) : null });
  } catch (error) {
    console.error('Erreur lors de la récupération du compte :', error);
    return res.status(500).json({ error: 'Impossible de récupérer la session.' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  return res.json({ message: 'Déconnexion effectuée.' });
});

module.exports = router;
