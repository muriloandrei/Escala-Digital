const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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

async function getTableColumns(connection, tableName) {
  const result = await connection.execute(
    `select column_name
       from user_tab_columns
      where table_name = :tableName`,
    { tableName: String(tableName || '').toUpperCase() },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return new Set(result.rows.map((row) => pick(row, 'COLUMN_NAME', 'column_name')));
}

function isActiveStatus(status) {
  return String(status || '').trim().toUpperCase() === 'A';
}

function isBcryptHash(value) {
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(String(value || ''));
}

function md5Hex(value) {
  return crypto.createHash('md5').update(String(value || ''), 'utf8').digest('hex');
}

function isLegacyMd5Hash(value) {
  return /^[a-f0-9]{32}$/i.test(String(value || '').trim());
}

function isSupportedPasswordHash(value) {
  return isBcryptHash(value) || isLegacyMd5Hash(value);
}

async function verifyPasswordHash(password, senhaHash) {
  if (isBcryptHash(senhaHash)) {
    return bcrypt.compare(password, senhaHash);
  }
  if (isLegacyMd5Hash(senhaHash)) {
    return md5Hex(password) === String(senhaHash || '').trim().toLowerCase();
  }
  return false;
}

async function upgradeLegacyMd5Password(usuarioId, password, previousHash) {
  const senhaHash = await bcrypt.hash(password, 10);
  await withConnection(async (connection) => {
    await connection.execute(
      `update sgn_esc_usuario
          set senha_hash = :senhaHash
        where usuario_id = :usuarioId
          and senha_hash = :previousHash`,
      { usuarioId, senhaHash, previousHash },
      { autoCommit: true }
    );
  });
}

function invalidLoginError() {
  const error = new Error('Usuario ou senha invalidos.');
  error.statusCode = 401;
  return error;
}

async function findUserByLogin(login) {
  return withConnection(async (connection) => {
    const columns = await getTableColumns(connection, 'SGN_ESC_USUARIO');
    const lojaPrincipalSelect = columns.has('LOJA_PRINCIPAL') ? ', u.loja_principal' : ', cast(null as number) as loja_principal';
    const result = await connection.execute(
      `select
          u.usuario_id,
          u.login,
          u.nome,
          u.senha_hash,
          u.perfil,
          u.status
          ${lojaPrincipalSelect}
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
    const columns = await getTableColumns(connection, 'SGN_ESC_USUARIO');
    const lojaPrincipalSelect = columns.has('LOJA_PRINCIPAL') ? ', u.loja_principal' : ', cast(null as number) as loja_principal';
    const result = await connection.execute(
      `select
          u.usuario_id,
          u.login,
          u.nome,
          u.perfil,
          u.status
          ${lojaPrincipalSelect}
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
       where usuario_id = :usuarioId
       order by loja`,
      { usuarioId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map((row) => Number(pick(row, 'LOJA', 'loja')));
  });
}

function resolveLojaPrincipal(user, lojas) {
  const permitidas = (lojas || []).map(Number).filter(Boolean);
  const atual = Number(pick(user, 'LOJA_PRINCIPAL', 'loja_principal') || 0);
  if (atual && permitidas.includes(atual)) return atual;
  return permitidas[0] || null;
}

async function syncLojaPrincipal(usuarioId, lojaPrincipalAtual, lojaPrincipalResolvida) {
  if (!lojaPrincipalResolvida || Number(lojaPrincipalAtual || 0) === Number(lojaPrincipalResolvida)) return;
  await withConnection(async (connection) => {
    const columns = await getTableColumns(connection, 'SGN_ESC_USUARIO');
    if (!columns.has('LOJA_PRINCIPAL')) return;
    await connection.execute(
      `update sgn_esc_usuario
          set loja_principal = :lojaPrincipal
        where usuario_id = :usuarioId`,
      { usuarioId, lojaPrincipal: lojaPrincipalResolvida },
      { autoCommit: true }
    );
  });
}

async function getSessionUserById(usuarioId) {
  const user = await findUserById(usuarioId);
  if (!user || !isActiveStatus(pick(user, 'STATUS', 'status'))) return null;

  const currentUsuarioId = pick(user, 'USUARIO_ID', 'usuario_id');
  const lojas = await findUserStores(currentUsuarioId);
  const lojaPrincipalAtual = pick(user, 'LOJA_PRINCIPAL', 'loja_principal') || null;
  const lojaPrincipal = resolveLojaPrincipal(user, lojas);
  await syncLojaPrincipal(currentUsuarioId, lojaPrincipalAtual, lojaPrincipal);
  const sessionUser = {
    sub: String(currentUsuarioId),
    login: pick(user, 'LOGIN', 'login'),
    nome: pick(user, 'NOME', 'nome'),
    perfil: pick(user, 'PERFIL', 'perfil'),
    lojas,
    lojaPrincipal
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
  if (!isSupportedPasswordHash(senhaHash)) {
    console.warn(`Usuario ${pick(user, 'LOGIN', 'login')} sem SENHA_HASH suportado.`);
    throw invalidLoginError();
  }

  const passwordMatches = await verifyPasswordHash(password, senhaHash);
  if (!passwordMatches) {
    throw invalidLoginError();
  }

  const usuarioId = pick(user, 'USUARIO_ID', 'usuario_id');
  if (isLegacyMd5Hash(senhaHash)) {
    await upgradeLegacyMd5Password(usuarioId, password, senhaHash);
  }

  const lojas = await findUserStores(usuarioId);
  const lojaPrincipalAtual = pick(user, 'LOJA_PRINCIPAL', 'loja_principal') || null;
  const lojaPrincipal = resolveLojaPrincipal(user, lojas);
  await syncLojaPrincipal(usuarioId, lojaPrincipalAtual, lojaPrincipal);
  const { auth } = getEnv();
  const payload = {
    sub: String(usuarioId),
    login: pick(user, 'LOGIN', 'login'),
    nome: pick(user, 'NOME', 'nome'),
    perfil: pick(user, 'PERFIL', 'perfil'),
    lojas,
    lojaPrincipal
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

async function updateLojaPrincipal(usuarioId, lojaPrincipal) {
  return withConnection(async (connection) => {
    const columns = await getTableColumns(connection, 'SGN_ESC_USUARIO');
    if (!columns.has('LOJA_PRINCIPAL')) {
      const error = new Error('Coluna SGN_ESC_USUARIO.LOJA_PRINCIPAL nao encontrada. Rode a migration de loja principal.');
      error.statusCode = 501;
      throw error;
    }

    await connection.execute(
      `update sgn_esc_usuario
          set loja_principal = :lojaPrincipal
        where usuario_id = :usuarioId`,
      { usuarioId, lojaPrincipal },
      { autoCommit: true }
    );

    return getSessionUserById(usuarioId);
  });
}

module.exports = {
  login,
  getSessionUserById,
  updateLojaPrincipal,
  _private: {
    isBcryptHash,
    isLegacyMd5Hash,
    isSupportedPasswordHash,
    md5Hex,
    verifyPasswordHash,
    getTableColumns,
    upgradeLegacyMd5Password,
    resolveLojaPrincipal
  }
};
