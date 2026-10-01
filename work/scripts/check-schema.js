const { initOraclePool, closeOraclePool, withConnection, oracledb } = require('../src/db/oracle');

const required = {
  SGN_ESC_PROG: ['ESCPROG_ID', 'MES_REF', 'ESCFUNC_ID', 'ESCSECAO_ID', 'REVISAO', 'ATIVA'],
  SGN_ESC_PROG_DIA: ['ESCPROGDIA_ID', 'ESCPROG_ID', 'DT', 'PROGRAMACAO'],
  SGN_ESC_FUNCIONARIO: ['ESCFUNC_ID', 'LOJA', 'DT_DEMISS', 'ESCSUBSECAO_ID'],
  SGN_ESC_AUSENCIA: ['ESCFUNC_ID', 'DT_INIC', 'DT_FIM'],
  SGN_ESC_AUDITORIA: ['ACAO', 'LOJA', 'MES_REF', 'REVISAO', 'DETALHE'],
  SGN_ESC_PENDENCIA_FUNC: ['ESCPEND_ID', 'LOJA', 'ESCFUNC_ID', 'STATUS'],
  SGN_ESC_EVENTO: ['EVENTO_ID', 'OPERACAO_ID', 'LOJA', 'MES_REF', 'ESCFUNC_ID', 'ESCSUBSECAO_ID', 'DETALHE'],
  SGN_ESC_TRANSFER_SUB: ['TRANSF_ID', 'OPERACAO_ID', 'LOJA', 'ESCFUNC_ID', 'ESCSECAO_ID', 'ORIGEM_ID', 'DESTINO_ID', 'DT_VIGENCIA', 'STATUS', 'TENTATIVAS', 'DT_PROXIMA', 'MESES_GERADOS', 'ERRO'],
  SGN_ESC_TREINAMENTO: ['USUARIO_ID', 'VERSAO', 'ETAPA'],
  SGN_ESC_RM_ENVIO: ['ENVIO_ID', 'OPERACAO_ID', 'LOJA', 'MES_REF', 'ESCSECAO_ID', 'ESCFUNC_ID', 'REVISAO', 'STATUS', 'TENTATIVAS'],
  SGN_ESC_MIGRACAO: ['ARQUIVO', 'CHECKSUM_SHA256', 'APLICADO_EM', 'APLICADO_POR']
};
const sequences = ['SGN_ESC_PROG_SEQ', 'SGN_ESC_PROG_DIA_SEQ', 'SGN_ESC_AUDITORIA_SEQ', 'SGN_ESC_PENDENCIA_FUNC_SEQ', 'SGN_ESC_EVENTO_SEQ', 'SGN_ESC_TRANSFER_SUB_SEQ', 'SGN_ESC_RM_ENVIO_SEQ'];
const constraints = ['SGN_ESC_RM_ENVIO_ESCOPO_UK', 'SGN_ESC_TREINAMENTO_ETAPA_CK'];
const indexes = ['SGN_ESC_PEND_FUNC_ABERTA_UK', 'SGN_ESC_TRANSFER_SUB_OP_IX'];

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
      const constraintRows = await connection.execute(
        `select constraint_name, search_condition_vc from user_constraints where constraint_name in (${constraints.map((_, index) => `:constraint${index}`).join(', ')})`,
        Object.fromEntries(constraints.map((name, index) => [`constraint${index}`, name])),
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const availableConstraints = new Set((constraintRows.rows || []).map((row) => row.CONSTRAINT_NAME));
      const trainingConstraint = (constraintRows.rows || []).find((row) => row.CONSTRAINT_NAME === 'SGN_ESC_TREINAMENTO_ETAPA_CK');
      const indexRows = await connection.execute(
        `select index_name from user_indexes where index_name in (${indexes.map((_, index) => `:index${index}`).join(', ')})`,
        Object.fromEntries(indexes.map((name, index) => [`index${index}`, name])),
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const availableIndexes = new Set((indexRows.rows || []).map((row) => row.INDEX_NAME));
      return [
        ...Object.entries(required).flatMap(([table, fields]) => fields
          .map((field) => field.toUpperCase())
          .filter((field) => !columns.get(table)?.has(field))
          .map((field) => `${table}.${field}`)),
        ...sequences.filter((name) => !availableSequences.has(name)),
        ...constraints.filter((name) => !availableConstraints.has(name)),
        ...(trainingConstraint && !/ETAPA\s+BETWEEN\s+0\s+AND\s+12/i.test(String(trainingConstraint.SEARCH_CONDITION_VC || ''))
          ? ['SGN_ESC_TREINAMENTO_ETAPA_CK(0..12)'] : []),
        ...indexes.filter((name) => !availableIndexes.has(name))
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
