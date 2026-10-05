const jwt = require('jsonwebtoken');
const User = require('../models/User');

const cookieName = 'zenwallet_session';

function requireAuth(req, res, next) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    return res.status(503).json({ error: 'Authentification indisponible : configure JWT_SECRET (32 caractères minimum).' });
  }

  const token = req.cookies && req.cookies[cookieName];
  if (!token) {
    return res.status(401).json({ error: 'Connecte-toi pour continuer.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Session expirée ou invalide.' });
  }
}

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(401).json({ error: 'Compte introuvable.' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    return next();
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle administrateur :', error);
    return res.status(500).json({ error: 'Impossible de vérifier les autorisations.' });
  }
}

module.exports = { cookieName, requireAuth, requireAdmin };
