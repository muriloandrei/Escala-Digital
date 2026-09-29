const { initOraclePool, closeOraclePool, withConnection, oracledb } = require('../src/db/oracle');
const { appendEvent, createOperationId, listEvents } = require('../src/services/escalaEventService');

async function main() {
  await initOraclePool();
  const operacaoId = createOperationId();
  const detalhe = { alteracoes: [{ data: '2026-10-05', anterior: null, novo: { motivo: 'T'.repeat(1500) } }] };
  try {
    await withConnection(async (connection) => {
      try {
        await appendEvent(connection, {
          operacaoId, lojaId: 1, mesRef: '2026-10-01', escfuncId: 1,
          acao: 'TESTE_TRANSACAO', origem: 'SISTEMA', situacao: 'RASCUNHO', detalhe
        });
        const result = await connection.execute(
          'select detalhe from sgn_esc_evento where operacao_id = :operacaoId',
          { operacaoId },
          { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchInfo: { DETALHE: { type: oracledb.STRING } } }
        );
        if (result.rows.length !== 1 || JSON.parse(result.rows[0].DETALHE).alteracoes[0].novo.motivo.length !== 1500) {
          throw new Error('Evento nao foi lido integralmente.');
        }
      } finally {
        await connection.rollback();
      }
    });
    const remaining = await withConnection(async (connection) => connection.execute(
      'select count(*) as total from sgn_esc_evento where operacao_id = :operacaoId',
      { operacaoId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ));
    if (Number(remaining.rows[0].TOTAL) !== 0) throw new Error('Rollback nao removeu o evento de teste.');
    const eventos = await listEvents({ lojasPermitidas: [1], lojaId: 1, mesRef: '2026-10-01', limit: 5 });
    if (!Array.isArray(eventos)) throw new Error('Consulta paginada de eventos falhou.');
    console.log('Evento CLOB lido integralmente e revertido com rollback.');
  } finally {
    await closeOraclePool();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
