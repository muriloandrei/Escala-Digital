const { withConnection, oracledb } = require('../db/oracle');
const { readData } = require('../db/mockStore');
const { getEnv } = require('../config/env');

async function listUsuariosAcesso() {
  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const data = await readData();
    return data.SGN_ESC_USUARIO.map((usuario) => {
      const lojas = data.SGN_ESC_USUARIO_LOJA
        .filter((row) => Number(row.USUARIO_ID) === Number(usuario.USUARIO_ID))
        .map((row) => Number(row.LOJA))
        .sort((a, b) => a - b);

      return {
        USUARIO_ID: usuario.USUARIO_ID,
        LOGIN: usuario.LOGIN,
        NOME: usuario.NOME,
        PERFIL: usuario.PERFIL,
        STATUS: usuario.STATUS,
        LOJAS: lojas
      };
    }).sort((a, b) => a.LOGIN.localeCompare(b.LOGIN));
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
    }));
  });
}

module.exports = { listUsuariosAcesso };
