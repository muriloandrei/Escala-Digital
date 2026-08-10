const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { withConnection, oracledb } = require('../db/oracle');
const { getEnv } = require('../config/env');
const accessService = require('./accessService');

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
}

function isActiveStatus(status) {
  return String(status || '').trim().toUpperCase() === 'A';
}

function isBcryptHash(value) {
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(String(value || ''));
}

function invalidLoginError() {
  const error = new Error('Usuario ou senha invalidos.');
  error.statusCode = 401;
  return error;
}

async function findUserByLogin(login) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select
          u.usuario_id,
          u.login,
          u.nome,
          u.senha_hash,
          u.perfil,
          u.status
       from sgn_esc_usuario u
       where upper(u.login) = upper(:login)`,
      { login },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows[0] || null;
  });
}

async function findUserById(usuarioId) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select
          u.usuario_id,
          u.login,
          u.nome,
          u.perfil,
          u.status
       from sgn_esc_usuario u
       where u.usuario_id = :usuarioId`,
      { usuarioId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows[0] || null;
  });
}

async function findUserStores(usuarioId) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select loja
       from sgn_esc_usuario_loja
       where usuario_id = :usuarioId`,
      { usuarioId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map((row) => Number(pick(row, 'LOJA', 'loja')));
  });
}

async function getSessionUserById(usuarioId) {
  const user = await findUserById(usuarioId);
  if (!user || !isActiveStatus(pick(user, 'STATUS', 'status'))) return null;

  const currentUsuarioId = pick(user, 'USUARIO_ID', 'usuario_id');
  const lojas = await findUserStores(currentUsuarioId);
  const sessionUser = {
    sub: String(currentUsuarioId),
    login: pick(user, 'LOGIN', 'login'),
    nome: pick(user, 'NOME', 'nome'),
    perfil: pick(user, 'PERFIL', 'perfil'),
    lojas
  };
  sessionUser.permissoes = await getUserPermissions(sessionUser.perfil);
  return sessionUser;
}

async function login({ login, password }) {
  const user = await findUserByLogin(login);
  if (!user || !isActiveStatus(pick(user, 'STATUS', 'status'))) {
    throw invalidLoginError();
  }

  const senhaHash = pick(user, 'SENHA_HASH', 'senha_hash');
  if (!isBcryptHash(senhaHash)) {
    console.warn(`Usuario ${pick(user, 'LOGIN', 'login')} sem SENHA_HASH bcrypt valido.`);
    throw invalidLoginError();
  }

  const passwordMatches = await bcrypt.compare(password, senhaHash);
  if (!passwordMatches) {
    throw invalidLoginError();
  }

  const usuarioId = pick(user, 'USUARIO_ID', 'usuario_id');
  const lojas = await findUserStores(usuarioId);
  const { auth } = getEnv();
  const payload = {
    sub: String(usuarioId),
    login: pick(user, 'LOGIN', 'login'),
    nome: pick(user, 'NOME', 'nome'),
    perfil: pick(user, 'PERFIL', 'perfil'),
    lojas
  };
  payload.permissoes = await getUserPermissions(payload.perfil);

  const token = jwt.sign(payload, auth.jwtSecret, { expiresIn: auth.jwtExpiresIn });
  return { token, user: payload };
}

async function getUserPermissions(perfil) {
  try {
    return await accessService.getPermissoesPerfil(perfil);
  } catch (error) {
    console.warn(`Permissoes do perfil ${perfil || '-'} indisponiveis: ${error.message}`);
    return [];
  }
}

module.exports = { login, getSessionUserById };
