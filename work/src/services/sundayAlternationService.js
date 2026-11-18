const { withConnection, oracledb } = require('../db/oracle');

async function getStoreEnabled(lojaId) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      'select domingo_1x1_habilitado from sgn_esc_loja where loja = :lojaId',
      { lojaId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return Number(result.rows?.[0]?.DOMINGO_1X1_HABILITADO) === 1;
  });
}

async function setStoreEnabled(lojaId, enabled) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      'update sgn_esc_loja set domingo_1x1_habilitado = :enabled where loja = :lojaId',
      { lojaId, enabled: enabled ? 1 : 0 }, { autoCommit: false }
    );
    if (!result.rowsAffected) { await connection.rollback(); return false; }
    await connection.commit();
    return true;
  });
}

module.exports = { getStoreEnabled, setStoreEnabled };
