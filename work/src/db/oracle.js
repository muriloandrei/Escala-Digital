const oracledb = require('oracledb');
const { getEnv } = require('../config/env');

let pool;

async function initOraclePool() {
  if (pool) return pool;

  const { oracle } = getEnv();
  pool = await oracledb.createPool({
    user: oracle.user,
    password: oracle.password,
    connectString: oracle.connectString,
    poolMin: oracle.poolMin,
    poolMax: oracle.poolMax,
    poolIncrement: oracle.poolIncrement
  });

  return pool;
}

async function closeOraclePool() {
  if (!pool) return;
  await pool.close(10);
  pool = undefined;
}

async function withConnection(work) {
  if (!pool) await initOraclePool();

  let connection;
  try {
    connection = await pool.getConnection();
    return await work(connection);
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  oracledb,
  initOraclePool,
  closeOraclePool,
  withConnection
};
