const jwt = require('jsonwebtoken');
const { getEnv } = require('../config/env');
const authService = require('../services/authService');
const accessService = require('../services/accessService');

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

function getPermissionField(action) {
  const normalized = String(action || 'visualizar').toLowerCase();
  if (['visualizar', 'listar', 'consultar'].includes(normalized)) return 'PODE_VISUALIZAR';
  if (['criar', 'novo', 'cadastrar'].includes(normalized)) return 'PODE_CRIAR';
  if (['oficializar'].includes(normalized)) return 'PODE_OFICIALIZAR';
  if (['reprocessar'].includes(normalized)) return 'PODE_REPROCESSAR';
  if (['excluir', 'inativar'].includes(normalized)) return 'PODE_EXCLUIR';
  if (['administrar'].includes(normalized)) return 'PODE_ADMINISTRAR';
  return 'PODE_EDITAR';
}

function requirePermission(page, action = 'visualizar') {
  return async (req, res, next) => {
    if (req.user?.perfil === 'ADMIN') return next();

    const field = getPermissionField(action);
    try {
      const permission = await accessService.getPermissaoPerfil(req.user?.perfil, page);
      if (Number(permission?.[field] || 0) === 1) return next();
      return res.status(403).json({ error: 'Usuario sem permissao para esta acao.' });
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { requireAuth, requireLojaAccess, requireAdmin, requirePermission };
