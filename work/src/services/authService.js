const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { withConnection, oracledb } = require('../db/oracle');
const { readData } = require('../db/mockStore');
const { getEnv } = require('../config/env');

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
  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const data = await readData();
    return data.SGN_ESC_USUARIO.find((user) => user.LOGIN.toUpperCase() === login.toUpperCase()) || null;
  }

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

async function findUserStores(usuarioId) {
  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const data = await readData();
    return data.SGN_ESC_USUARIO_LOJA
      .filter((row) => Number(row.USUARIO_ID) === Number(usuarioId))
      .map((row) => Number(row.LOJA));
  }

  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select loja
       from sgn_esc_usuario_loja
       where usuario_id = :usuarioId`,
      { usuarioId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map((row) => Number(row.LOJA));
  });
}

async function login({ login, password }) {
  const user = await findUserByLogin(login);
  if (!user || !isActiveStatus(user.STATUS)) {
    throw invalidLoginError();
  }

  if (!isBcryptHash(user.SENHA_HASH)) {
    console.warn(`Usuario ${user.LOGIN} sem SENHA_HASH bcrypt valido.`);
    throw invalidLoginError();
  }

  const passwordMatches = await bcrypt.compare(password, user.SENHA_HASH);
  if (!passwordMatches) {
    throw invalidLoginError();
  }

  const lojas = await findUserStores(user.USUARIO_ID);
  const { auth } = getEnv();
  const payload = {
    sub: String(user.USUARIO_ID),
    login: user.LOGIN,
    nome: user.NOME,
    perfil: user.PERFIL,
    lojas
  };

  const token = jwt.sign(payload, auth.jwtSecret, { expiresIn: auth.jwtExpiresIn });
  return { token, user: payload };
}

module.exports = { login };
