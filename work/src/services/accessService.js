const bcrypt = require('bcryptjs');
const { withConnection, oracledb } = require('../db/oracle');
const { readData, writeData, nextId } = require('../db/mockStore');
const { getEnv } = require('../config/env');

function normalizeUser(usuario, lojas) {
  return {
    USUARIO_ID: usuario.USUARIO_ID,
    LOGIN: usuario.LOGIN,
    NOME: usuario.NOME,
    PERFIL: usuario.PERFIL,
    STATUS: usuario.STATUS,
    LOJAS: lojas
  };
}

function canSeeUser(requestUser, lojas) {
  if (requestUser?.perfil === 'ADMIN') return true;
  const permitidas = new Set((requestUser?.lojas || []).map(Number));
  return lojas.some((loja) => permitidas.has(Number(loja)));
}

async function listUsuariosAcesso(requestUser) {
  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const data = await readData();
    return data.SGN_ESC_USUARIO.map((usuario) => {
      const lojas = data.SGN_ESC_USUARIO_LOJA
        .filter((row) => Number(row.USUARIO_ID) === Number(usuario.USUARIO_ID))
        .map((row) => Number(row.LOJA))
        .sort((a, b) => a - b);

      return normalizeUser(usuario, lojas);
    })
      .filter((usuario) => canSeeUser(requestUser, usuario.LOJAS))
      .sort((a, b) => a.LOGIN.localeCompare(b.LOGIN));
  }

  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select
          u.usuario_id,
          u.login,
          u.nome,
          u.perfil,
          u.status,
          listagg(ul.loja, ', ') within group (order by ul.loja) as lojas
       from sgn_esc_usuario u
       left join sgn_esc_usuario_loja ul on ul.usuario_id = u.usuario_id
       group by u.usuario_id, u.login, u.nome, u.perfil, u.status
       order by u.login`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map((row) => ({
      ...row,
      LOJAS: row.LOJAS ? String(row.LOJAS).split(',').map((loja) => Number(loja.trim())) : []
    })).filter((usuario) => canSeeUser(requestUser, usuario.LOJAS));
  });
}

async function replaceUserStoresMock(data, usuarioId, lojas) {
  data.SGN_ESC_USUARIO_LOJA = data.SGN_ESC_USUARIO_LOJA.filter((row) => Number(row.USUARIO_ID) !== Number(usuarioId));
  for (const loja of lojas || []) {
    data.SGN_ESC_USUARIO_LOJA.push({ USUARIO_ID: Number(usuarioId), LOJA: Number(loja) });
  }
}

async function updateUsuarioAcesso(usuarioId, updates) {
  const allowed = ['NOME', 'PERFIL', 'STATUS', 'LOJAS'];
  const data = Object.fromEntries(Object.entries(updates || {}).filter(([field]) => allowed.includes(field)));
  const env = getEnv();

  if (env.dbDriver === 'mock') {
    const mockData = await readData();
    const usuario = mockData.SGN_ESC_USUARIO.find((item) => Number(item.USUARIO_ID) === Number(usuarioId));
    if (!usuario) return null;

    if (data.NOME !== undefined) usuario.NOME = data.NOME;
    if (data.PERFIL !== undefined) usuario.PERFIL = data.PERFIL;
    if (data.STATUS !== undefined) usuario.STATUS = data.STATUS;
    if (data.LOJAS !== undefined) await replaceUserStoresMock(mockData, usuarioId, data.LOJAS);

    await writeData(mockData);
    const lojas = mockData.SGN_ESC_USUARIO_LOJA
      .filter((row) => Number(row.USUARIO_ID) === Number(usuarioId))
      .map((row) => Number(row.LOJA))
      .sort((a, b) => a - b);
    return normalizeUser(usuario, lojas);
  }

  return withConnection(async (connection) => {
    const fields = [];
    const binds = { usuarioId };
    for (const field of ['NOME', 'PERFIL', 'STATUS']) {
      if (data[field] !== undefined) {
        fields.push(`${field.toLowerCase()} = :${field}`);
        binds[field] = data[field];
      }
    }

    if (fields.length > 0) {
      const result = await connection.execute(
        `update sgn_esc_usuario set ${fields.join(', ')} where usuario_id = :usuarioId`,
        binds,
        { autoCommit: false }
      );
      if (result.rowsAffected === 0) {
        await connection.rollback();
        return null;
      }
    }

    if (data.LOJAS !== undefined) {
      await connection.execute('delete from sgn_esc_usuario_loja where usuario_id = :usuarioId', { usuarioId }, { autoCommit: false });
      if (data.LOJAS.length > 0) {
        await connection.executeMany(
          'insert into sgn_esc_usuario_loja (usuario_id, loja) values (:usuarioId, :loja)',
          data.LOJAS.map((loja) => ({ usuarioId, loja })),
          { autoCommit: false }
        );
      }
    }

    await connection.commit();
    const usuarios = await listUsuariosAcesso({ perfil: 'ADMIN' });
    return usuarios.find((usuario) => Number(usuario.USUARIO_ID) === Number(usuarioId)) || null;
  });
}

async function createUsuarioAcesso({ login, nome, password, perfil, status = 'A', lojas = [] }) {
  const senhaHash = await bcrypt.hash(password, 10);
  const env = getEnv();

  if (env.dbDriver === 'mock') {
    const data = await readData();
    if (data.SGN_ESC_USUARIO.some((usuario) => usuario.LOGIN.toUpperCase() === login.toUpperCase())) {
      const error = new Error('Login ja cadastrado.');
      error.statusCode = 409;
      throw error;
    }

    const usuarioId = nextId(data.SGN_ESC_USUARIO, 'USUARIO_ID');
    const usuario = {
      USUARIO_ID: usuarioId,
      LOGIN: login,
      NOME: nome,
      SENHA_HASH: senhaHash,
      PERFIL: perfil,
      STATUS: status,
      DT_HR_INCL: new Date().toISOString()
    };
    data.SGN_ESC_USUARIO.push(usuario);
    await replaceUserStoresMock(data, usuarioId, lojas);
    await writeData(data);
    return normalizeUser(usuario, lojas.map(Number).sort((a, b) => a - b));
  }

  return withConnection(async (connection) => {
    const result = await connection.execute(
      `insert into sgn_esc_usuario (usuario_id, login, nome, senha_hash, perfil, status, dt_hr_incl)
       values (sgn_esc_usuario_seq.nextval, :login, :nome, :senhaHash, :perfil, :status, sysdate)
       returning usuario_id into :usuarioId`,
      {
        login,
        nome,
        senhaHash,
        perfil,
        status,
        usuarioId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: false }
    );
    const usuarioId = result.outBinds.usuarioId[0];

    if (lojas.length > 0) {
      await connection.executeMany(
        'insert into sgn_esc_usuario_loja (usuario_id, loja) values (:usuarioId, :loja)',
        lojas.map((loja) => ({ usuarioId, loja })),
        { autoCommit: false }
      );
    }

    await connection.commit();
    return { USUARIO_ID: usuarioId, LOGIN: login, NOME: nome, PERFIL: perfil, STATUS: status, LOJAS: lojas };
  });
}

module.exports = { listUsuariosAcesso, updateUsuarioAcesso, createUsuarioAcesso };
