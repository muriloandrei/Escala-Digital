const { initOraclePool, closeOraclePool, withConnection, oracledb } = require('../src/db/oracle');

const required = {
  SGN_ESC_PROG: ['ESCPROG_ID', 'MES_REF', 'ESCFUNC_ID', 'ESCSECAO_ID', 'REVISAO', 'ATIVA'],
  SGN_ESC_PROG_DIA: ['ESCPROGDIA_ID', 'ESCPROG_ID', 'DT', 'PROGRAMACAO'],
  SGN_ESC_FUNCIONARIO: ['ESCFUNC_ID', 'LOJA', 'DT_DEMISS', 'ESCSUBSECAO_ID'],
  SGN_ESC_AUSENCIA: ['ESCfunc_ID', 'DT_INIC', 'DT_FIM'],
  SGN_ESC_AUDITORIA: ['ACAO', 'LOJA', 'MES_REF', 'REVISAO', 'DETALHE'],
  SGN_ESC_PENDENCIA_FUNC: ['ESCpend_ID', 'LOJA', 'ESCFUNC_ID', 'STATUS']
};
const sequences = ['SGN_ESC_PROG_SEQ', 'SGN_ESC_PROG_DIA_SEQ', 'SGN_ESC_AUDITORIA_SEQ'];

async function main() {
  await initOraclePool();
  try {
    const missing = await withConnection(async (connection) => {
      const tables = await connection.execute(
        `select table_name, column_name from user_tab_columns
         where table_name in (${Object.keys(required).map((_, index) => `:table${index}`).join(', ')})`,
        Object.fromEntries(Object.keys(required).map((name, index) => [`table${index}`, name])),
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const columns = new Map();
      for (const row of tables.rows || []) {
        if (!columns.has(row.TABLE_NAME)) columns.set(row.TABLE_NAME, new Set());
        columns.get(row.TABLE_NAME).add(row.COLUMN_NAME);
      }
      const sequenceRows = await connection.execute(
        `select sequence_name from user_sequences where sequence_name in (${sequences.map((_, index) => `:seq${index}`).join(', ')})`,
        Object.fromEntries(sequences.map((name, index) => [`seq${index}`, name])),
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const availableSequences = new Set((sequenceRows.rows || []).map((row) => row.SEQUENCE_NAME));
      return [
        ...Object.entries(required).flatMap(([table, fields]) => fields
          .map((field) => field.toUpperCase())
          .filter((field) => !columns.get(table)?.has(field))
          .map((field) => `${table}.${field}`)),
        ...sequences.filter((name) => !availableSequences.has(name))
      ];
    });
    if (missing.length) {
      console.error('Contrato Oracle incompleto:');
      for (const item of missing) console.error(`- ${item}`);
      process.exitCode = 1;
    } else {
      console.log('Contrato Oracle essencial presente. Esta checagem nao confirma dados nem execucao de todas as migrations.');
    }
  } finally {
    await closeOraclePool();
  }
}

main().catch((error) => {
  console.error(`Falha na verificacao do schema: ${error.message}`);
  process.exitCode = 1;
});
