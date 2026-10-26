const { withConnection, oracledb } = require('../db/oracle');

async function setStoreEnabled(lojaId, enabled) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      'update sgn_esc_loja set todas_secoes_habilitadas = :enabled where loja = :lojaId',
      { lojaId, enabled: enabled ? 1 : 0 }, { autoCommit: false }
    );
    if (!result.rowsAffected) { await connection.rollback(); return false; }
    await connection.commit();
    return true;
  });
}

async function getStoreEnabled(lojaId) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      'select todas_secoes_habilitadas from sgn_esc_loja where loja = :lojaId',
      { lojaId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return Number(result.rows?.[0]?.TODAS_SECOES_HABILITADAS) === 1;
  });
}

module.exports = { getStoreEnabled, setStoreEnabled };
