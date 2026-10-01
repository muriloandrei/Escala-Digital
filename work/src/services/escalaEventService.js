const crypto = require('node:crypto');
const { withConnection, oracledb } = require('../db/oracle');

function createOperationId() {
  return crypto.randomUUID();
}

async function appendEvent(connection, event) {
  const detalhe = JSON.stringify(event.detalhe || {});
  await connection.execute(
    `insert into sgn_esc_evento (
       evento_id, operacao_id, loja, mes_ref, escsecao_id, escsubsecao_id, escfunc_id,
       usuario_id, login, acao, origem, situacao,
       revisao_anterior, revisao_nova, detalhe, dt_hr_incl
     ) values (
       sgn_esc_evento_seq.nextval, :operacaoId, :lojaId,
       to_date(:mesRef, 'YYYY-MM-DD'), :escsecaoId,
       coalesce(cast(:escsubsecaoId as number), (select f.escsubsecao_id from sgn_esc_funcionario f where f.escfunc_id = :escfuncId)), :escfuncId,
       :usuarioId, :login, :acao, :origem, :situacao,
       :revisaoAnterior, :revisaoNova, :detalhe, sysdate
     )`,
    {
      operacaoId: event.operacaoId,
      lojaId: Number(event.lojaId),
      mesRef: event.mesRef,
      escsecaoId: event.escsecaoId || null,
      escsubsecaoId: event.escsubsecaoId || null,
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

function buildEventScope({ lojasPermitidas, secoesPermitidas = null, lojaId = null, mesRef = null, escfuncId = null, escsecaoId = null, escsubsecaoId = null, acao = null, origem = null, situacao = null, login = null, funcionario = null }) {
  const lojas = [...new Set((lojasPermitidas || []).map(Number).filter(Boolean))];
  if (!lojas.length || (secoesPermitidas && !secoesPermitidas.length)) return null;
  const binds = {};
  const lojasSql = lojas.map((loja, index) => {
    binds[`loja${index}`] = loja;
    return `:loja${index}`;
  }).join(', ');
  const filters = [`e.loja in (${lojasSql})`, "e.acao <> 'CONFIRMAR_RASCUNHO'"];
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
  if (escsecaoId) { filters.push('e.escsecao_id = :escsecaoId'); binds.escsecaoId = Number(escsecaoId); }
  if (escsubsecaoId) { filters.push('e.escsubsecao_id = :escsubsecaoId'); binds.escsubsecaoId = Number(escsubsecaoId); }
  if (acao) { filters.push('e.acao = :acao'); binds.acao = acao; }
  if (origem) { filters.push('e.origem = :origem'); binds.origem = origem; }
  if (situacao) { filters.push('e.situacao = :situacao'); binds.situacao = situacao; }
  if (login) { filters.push('upper(e.login) like :login'); binds.login = `%${login.toUpperCase()}%`; }
  if (funcionario) {
    filters.push(`exists (select 1 from sgn_esc_funcionario f_filter
      where f_filter.escfunc_id = e.escfunc_id
        and (upper(f_filter.nome) like :funcionarioNome or upper(f_filter.chapa) like :funcionarioChapa))`);
    binds.funcionarioNome = `%${funcionario.toUpperCase()}%`;
    binds.funcionarioChapa = `%${funcionario.toUpperCase()}%`;
  }
  return { binds, filters };
}

async function listEvents({ limit = 100, offset = 0, ...scope }) {
  const query = buildEventScope(scope);
  if (!query) return [];
  return withConnection(async (connection) => {
    const binds = { ...query.binds, limit: Math.min(Math.max(Number(limit) || 100, 1), 500), offset: Math.max(Number(offset) || 0, 0) };
    const result = await connection.execute(
      `select e.evento_id, e.operacao_id, e.loja, e.mes_ref, e.escsecao_id, e.escsubsecao_id,
              e.escfunc_id, e.usuario_id, e.login, e.acao, e.origem,
              e.situacao, e.revisao_anterior, e.revisao_nova, e.detalhe, e.dt_hr_incl,
              f.nome as funcionario_nome, f.chapa as funcionario_chapa,
              s.descr as secao_nome, sub.descr as subsecao_nome
         from sgn_esc_evento e
         left join sgn_esc_funcionario f on f.escfunc_id = e.escfunc_id
         left join sgn_esc_secao s on s.escsecao_id = e.escsecao_id
         left join sgn_esc_subsecao sub on sub.escsubsecao_id = e.escsubsecao_id
        where ${query.filters.join(' and ')}
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

async function summarizeEvents(scope) {
  const query = buildEventScope(scope);
  if (!query) return { colaboradores: 0, total: 0, manuais: 0, antes: 0, depois: 0 };
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select count(distinct e.escfunc_id) as colaboradores,
              count(*) as total,
              nvl(sum(case when e.origem = 'USUARIO' then 1 else 0 end), 0) as manuais,
              nvl(sum(case when e.situacao in ('CRIACAO', 'RASCUNHO') then 1 else 0 end), 0) as antes,
              nvl(sum(case when e.situacao = 'POS_OFICIALIZACAO' then 1 else 0 end), 0) as depois
         from sgn_esc_evento e
        where ${query.filters.join(' and ')}`,
      query.binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const row = result.rows?.[0] || {};
    return Object.fromEntries(['colaboradores', 'total', 'manuais', 'antes', 'depois']
      .map((key) => [key, Number(row[key.toUpperCase()] || 0)]));
  });
}

module.exports = { createOperationId, appendEvent, listEvents, summarizeEvents };
