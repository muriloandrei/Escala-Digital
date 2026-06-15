const bcrypt = require('bcryptjs');
const { withConnection, oracledb } = require('../db/oracle');

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
}

function normalizeUser(usuario, lojas) {
  return {
    USUARIO_ID: pick(usuario, 'USUARIO_ID', 'usuario_id'),
    LOGIN: pick(usuario, 'LOGIN', 'login'),
    NOME: pick(usuario, 'NOME', 'nome'),
    PERFIL: pick(usuario, 'PERFIL', 'perfil'),
    STATUS: pick(usuario, 'STATUS', 'status'),
    LOJAS: lojas
  };
}

function canSeeUser(requestUser, lojas) {
  if (requestUser?.perfil === 'ADMIN') return true;
  const permitidas = new Set((requestUser?.lojas || []).map(Number));
  return lojas.some((loja) => permitidas.has(Number(loja)));
}

async function listUsuariosAcesso(requestUser) {
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

    return result.rows.map((row) => {
      const lojas = pick(row, 'LOJAS', 'lojas')
        ? String(pick(row, 'LOJAS', 'lojas')).split(',').map((loja) => Number(loja.trim()))
        : [];
      return normalizeUser(row, lojas);
    }).filter((usuario) => canSeeUser(requestUser, usuario.LOJAS));
  });
}

async function updateUsuarioAcesso(usuarioId, updates) {
  const allowed = ['NOME', 'PERFIL', 'STATUS', 'LOJAS'];
  const data = Object.fromEntries(Object.entries(updates || {}).filter(([field]) => allowed.includes(field)));

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
