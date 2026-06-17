const { withConnection, oracledb } = require('../db/oracle');
const REQUIRED_TABLES = [
  'SGN_ESC_FUNCIONARIO',
  'SGN_ESC_AUSENCIA',
  'SGN_ESC_LOJA',
  'SGN_ESC_FUNCAO',
  'SGN_ESC_SECAO',
  'SGN_ESC_PROG',
  'ESC_PROG_DIA',
  'SGN_ESC_USUARIO',
  'SGN_ESC_USUARIO_LOJA'
];

const REQUIRED_SEQUENCES = [
  'SGN_ESC_PROG_SEQ',
  'SGN_ESC_PROG_DIA_SEQ'
];

async function checkOracle() {
  return withConnection(async (connection) => {
    const ping = await connection.execute(
      `select sys_context('USERENV', 'CURRENT_SCHEMA') as current_schema from dual`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const tables = await connection.execute(
      `select table_name
       from user_tables
       where table_name in (${REQUIRED_TABLES.map((_, index) => `:table${index}`).join(', ')})`,
      Object.fromEntries(REQUIRED_TABLES.map((table, index) => [`table${index}`, table])),
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const sequences = await connection.execute(
      `select sequence_name
       from user_sequences
       where sequence_name in (${REQUIRED_SEQUENCES.map((_, index) => `:seq${index}`).join(', ')})`,
      Object.fromEntries(REQUIRED_SEQUENCES.map((sequence, index) => [`seq${index}`, sequence])),
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const foundTables = new Set(tables.rows.map((row) => row.TABLE_NAME));
    const foundSequences = new Set(sequences.rows.map((row) => row.SEQUENCE_NAME));
    const missingTables = REQUIRED_TABLES.filter((table) => !foundTables.has(table));
    const missingSequences = REQUIRED_SEQUENCES.filter((sequence) => !foundSequences.has(sequence));

    return {
      driver: 'oracle',
      status: missingTables.length === 0 && missingSequences.length === 0 ? 'ok' : 'warning',
      currentSchema: ping.rows[0]?.CURRENT_SCHEMA || null,
      tables: {
        required: REQUIRED_TABLES,
        missing: missingTables
      },
      sequences: {
        required: REQUIRED_SEQUENCES,
        missing: missingSequences
      }
    };
  });
}

module.exports = {
  checkOracle
};
