const { randomUUID } = require('node:crypto');
const { initOraclePool, closeOraclePool, withConnection, oracledb } = require('../src/db/oracle');
const { listEnviosRm } = require('../src/services/rmIntegrationService');

async function main() {
  await initOraclePool();
  const operacaoId = randomUUID();
  try {
    await withConnection(async (connection) => {
      try {
        await connection.execute(
          `insert into sgn_esc_rm_envio
            (envio_id, operacao_id, loja, mes_ref, escsecao_id, escfunc_id, revisao,
             status, tentativas, dt_hr_incl, dt_hr_alter)
           values (sgn_esc_rm_envio_seq.nextval, :operacaoId, 999999,
             to_date('2026-10-01', 'YYYY-MM-DD'), 999999, 999999, 0,
             'PENDENTE', 0, sysdate, sysdate)`,
          { operacaoId }, { autoCommit: false }
        );
        const inserted = await connection.execute(
          'select status from sgn_esc_rm_envio where operacao_id = :operacaoId',
          { operacaoId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (inserted.rows?.[0]?.STATUS !== 'PENDENTE') throw new Error('Pendencia nao foi lida na transacao.');
        await connection.execute(
          `select p.escprog_id, p.escfunc_id, p.revisao
             from sgn_esc_prog p
            where p.loja = -1 and p.mes_ref = to_date('2026-10-01', 'YYYY-MM-DD')
              and p.escsecao_id = -1 and nvl(p.oficializada, 0) = 0
              and exists (select 1 from sgn_esc_prog_dia d where d.escprog_id = p.escprog_id)
              and p.revisao = (
                select max(px.revisao) from sgn_esc_prog px
                 where px.loja = p.loja and px.mes_ref = p.mes_ref
                   and px.escfunc_id = p.escfunc_id and nvl(px.ativa, 1) = 1
              )
              and nvl(p.ativa, 1) = 1
            for update of p.oficializada wait 5`,
          {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
      } finally {
        await connection.rollback();
      }
    });
    const remaining = await withConnection(async (connection) => connection.execute(
      'select count(*) as total from sgn_esc_rm_envio where operacao_id = :operacaoId',
      { operacaoId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ));
    if (Number(remaining.rows[0].TOTAL) !== 0) throw new Error('Rollback deixou uma pendencia de teste.');
    const unique = await withConnection(async (connection) => connection.execute(
      `select constraint_name from user_constraints
        where table_name = 'SGN_ESC_RM_ENVIO' and constraint_type = 'U'`,
      {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ));
    if (!(unique.rows || []).some((row) => row.CONSTRAINT_NAME === 'SGN_ESC_RM_ENVIO_ESCOPO_UK')) {
      throw new Error('Migration de unicidade por secao nao aplicada.');
    }
    if (!Array.isArray(await listEnviosRm({ lojaId: 999999 }))) throw new Error('Consulta de pendencias falhou.');
    console.log('Pendencia RM gravada e revertida; consulta operacional validada sem chamar o RM.');
  } finally {
    await closeOraclePool();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
