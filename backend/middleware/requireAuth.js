const jwt = require('jsonwebtoken');

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

module.exports = { cookieName, requireAuth };
