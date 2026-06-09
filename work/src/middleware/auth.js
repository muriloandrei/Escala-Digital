const jwt = require('jsonwebtoken');
const { getEnv } = require('../config/env');

function requireAuth(req, res, next) {
  const { auth } = getEnv();
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ error: 'Login necessario.' });
  }

  try {
    req.user = jwt.verify(token, auth.jwtSecret);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Sessao invalida ou expirada.' });
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

module.exports = { requireAuth, requireLojaAccess };
