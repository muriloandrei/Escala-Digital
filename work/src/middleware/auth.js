const jwt = require('jsonwebtoken');
const { getEnv } = require('../config/env');
const authService = require('../services/authService');

async function requireAuth(req, res, next) {
  const { auth } = getEnv();
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ error: 'Login necessario.' });
  }

  try {
    const decoded = jwt.verify(token, auth.jwtSecret);
    const sessionUser = await authService.getSessionUserById(decoded.sub);
    if (!sessionUser) {
      return res.status(401).json({ error: 'Sessao invalida ou expirada.' });
    }

    req.user = sessionUser;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sessao invalida ou expirada.' });
    }

    return next(error);
  }
}

function requireLojaAccess(req, res, next) {
  const lojaId = Number(req.params.lojaId || req.query.lojaId || req.body.lojaId);
  const lojasPermitidas = req.user?.lojas || [];

  if (!lojaId || lojasPermitidas.includes(lojaId) || req.user?.perfil === 'ADMIN') {
    return next();
  }

  return res.status(403).json({ error: 'Usuario sem permissao para esta loja.' });
}

function requireAdmin(req, res, next) {
  if (req.user?.perfil === 'ADMIN') {
    return next();
  }

  return res.status(403).json({ error: 'Acesso restrito a administradores.' });
}

module.exports = { requireAuth, requireLojaAccess, requireAdmin };
