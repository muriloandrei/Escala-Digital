const crypto = require('node:crypto');
const { withConnection, oracledb } = require('../db/oracle');

function createOperationId() {
  return crypto.randomUUID();
}

async function appendEvent(connection, event) {
  const detalhe = JSON.stringify(event.detalhe || {});
  await connection.execute(
    `insert into sgn_esc_evento (
       evento_id, operacao_id, loja, mes_ref, escsecao_id, escfunc_id,
       usuario_id, login, acao, origem, situacao,
       revisao_anterior, revisao_nova, detalhe, dt_hr_incl
     ) values (
       sgn_esc_evento_seq.nextval, :operacaoId, :lojaId,
       to_date(:mesRef, 'YYYY-MM-DD'), :escsecaoId, :escfuncId,
       :usuarioId, :login, :acao, :origem, :situacao,
       :revisaoAnterior, :revisaoNova, :detalhe, sysdate
     )`,
    {
      operacaoId: event.operacaoId,
      lojaId: Number(event.lojaId),
      mesRef: event.mesRef,
      escsecaoId: event.escsecaoId || null,
      escfuncId: event.escfuncId || null,
      usuarioId: event.actor?.sub ? Number(event.actor.sub) : null,
      login: String(event.actor?.login || 'SISTEMA').slice(0, 100),
      acao: event.acao,
      origem: event.origem || 'SISTEMA',
      situacao: event.situacao || 'RASCUNHO',
      revisaoAnterior: event.revisaoAnterior ?? null,
      revisaoNova: event.revisaoNova ?? null,
      detalhe: { val: detalhe, type: oracledb.CLOB }
    },
    { autoCommit: false }
  );
}

async function listEvents({ lojasPermitidas, secoesPermitidas = null, lojaId = null, mesRef = null, escfuncId = null, limit = 100, offset = 0 }) {
  const lojas = [...new Set((lojasPermitidas || []).map(Number).filter(Boolean))];
  if (!lojas.length || (secoesPermitidas && !secoesPermitidas.length)) return [];
  return withConnection(async (connection) => {
    const binds = { limit: Math.min(Math.max(Number(limit) || 100, 1), 500), offset: Math.max(Number(offset) || 0, 0) };
    const lojasSql = lojas.map((loja, index) => {
      binds[`loja${index}`] = loja;
      return `:loja${index}`;
    }).join(', ');
    const filters = [`e.loja in (${lojasSql})`];
    if (secoesPermitidas) {
      const secoesSql = [...new Set(secoesPermitidas.map(Number).filter(Boolean))].map((secao, index) => {
        binds[`secao${index}`] = secao;
        return `:secao${index}`;
      }).join(', ');
      filters.push(`e.escsecao_id in (${secoesSql})`);
    }
    if (lojaId) { filters.push('e.loja = :lojaId'); binds.lojaId = Number(lojaId); }
    if (mesRef) { filters.push("e.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')"); binds.mesRef = mesRef; }
    if (escfuncId) { filters.push('e.escfunc_id = :escfuncId'); binds.escfuncId = Number(escfuncId); }
    const result = await connection.execute(
      `select e.evento_id, e.operacao_id, e.loja, e.mes_ref, e.escsecao_id,
              e.escfunc_id, e.usuario_id, e.login, e.acao, e.origem,
              e.situacao, e.revisao_anterior, e.revisao_nova, e.detalhe, e.dt_hr_incl
         from sgn_esc_evento e
        where ${filters.join(' and ')}
        order by e.dt_hr_incl desc, e.evento_id desc
        offset :offset rows fetch next :limit rows only`,
      binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchInfo: { DETALHE: { type: oracledb.STRING } } }
    );
    return (result.rows || []).map((row) => ({
      ...row,
      MES_REF: row.MES_REF instanceof Date ? row.MES_REF.toISOString().slice(0, 10) : row.MES_REF,
      DT_HR_INCL: row.DT_HR_INCL instanceof Date ? row.DT_HR_INCL.toISOString() : row.DT_HR_INCL,
      DETALHE: row.DETALHE ? JSON.parse(row.DETALHE) : {}
    }));
  });
}

module.exports = { createOperationId, appendEvent, listEvents };
