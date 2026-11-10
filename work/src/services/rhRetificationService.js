const { withConnection, oracledb } = require('../db/oracle');
const { appendEvent, createOperationId } = require('./escalaEventService');

function baseQuery({ lojaId, mesRef, escsecaoId, search }) {
  const binds = { lojaId, mesRef };
  const filters = [
    'e.loja = :lojaId',
    "e.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')",
    "e.situacao = 'POS_OFICIALIZACAO'",
    "e.origem = 'USUARIO'",
    'e.escfunc_id is not null',
    "regexp_like(j.dia, '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')"
  ];
  if (escsecaoId) { filters.push('e.escsecao_id = :escsecaoId'); binds.escsecaoId = escsecaoId; }
  if (search) {
    filters.push('(upper(f.nome) like :search or upper(f.chapa) like :search or upper(e.login) like :search)');
    binds.search = `%${search.toUpperCase()}%`;
  }
  const from = `from sgn_esc_evento e
    cross apply json_table(e.detalhe, '$.alteracoes[*]' columns (
      dia varchar2(10) path '$.data',
      antes_prog varchar2(10) path '$.anterior.programacao',
      novo_prog varchar2(10) path '$.novo.programacao'
    )) j
    join sgn_esc_funcionario f on f.escfunc_id = e.escfunc_id
    left join sgn_esc_secao s on s.escsecao_id = e.escsecao_id
    left join sgn_esc_funcao fun on fun.escfuncao_id = f.escfuncao_id
    left join sgn_esc_rh_visto v on v.evento_id = e.evento_id and v.dia = to_date(j.dia, 'YYYY-MM-DD')
    where ${filters.join(' and ')}`;
  return { from, binds };
}

const dsrChangeSql = `((j.antes_prog in ('F', 'FXF') and nvl(j.novo_prog, '-') not in ('F', 'FXF'))
  or (j.novo_prog in ('F', 'FXF') and nvl(j.antes_prog, '-') not in ('F', 'FXF'))
  or mod(to_date(j.dia, 'YYYY-MM-DD') - date '2026-11-01', 7) = 0)`;

function buildRow(row) {
  const detail = JSON.parse(row.DETALHE || '{}');
  const change = (detail.alteracoes || []).find((item) => item.data === row.DIA) || {};
  return {
    eventoId: row.EVENTO_ID,
    dia: row.DIA,
    loja: row.LOJA,
    mesRef: row.MES_REF,
    escsecaoId: row.ESCSECAO_ID,
    escfuncId: row.ESCFUNC_ID,
    dataModificacao: row.DT_HR_INCL,
    autor: row.LOGIN,
    colaborador: row.FUNCIONARIO_NOME,
    chapa: row.FUNCIONARIO_CHAPA,
    secao: row.SECAO_NOME,
    cargo: row.FUNCAO_NOME,
    anterior: change.anterior || null,
    novo: change.novo || null,
    justificativa: change.justificativa || null,
    status: row.STATUS || 'PENDENTE',
    revisor: row.REVISOR_LOGIN || null,
    vistoEm: row.DT_HR_VISTO || null,
    motivo: row.MOTIVO || null,
    observacao: row.OBSERVACAO || null,
    trocaFolga: ['F', 'FXF'].includes(String(row.ANTES_PROG || '')) !== ['F', 'FXF'].includes(String(row.NOVO_PROG || ''))
  };
}

async function listRetifications({ lojaId, mesRef, escsecaoId = null, status = 'PENDENTE', search = '', trocaFolga = false, conferidasHoje = false, limit = 50, offset = 0 }) {
  const { from, binds } = baseQuery({ lojaId, mesRef, escsecaoId, search });
  return withConnection(async (connection) => {
    const summary = await connection.execute(
      `select count(*) as total,
        nvl(sum(case when v.status is null then 1 else 0 end), 0) as pendentes,
        nvl(sum(case when v.status = 'CONFERIDO' then 1 else 0 end), 0) as conferidas,
        nvl(sum(case when v.status = 'CONTESTADO' then 1 else 0 end), 0) as contestadas,
        nvl(sum(case when v.status = 'CONFERIDO' and trunc(v.dt_hr_visto) = trunc(sysdate) then 1 else 0 end), 0) as conferidas_hoje,
        nvl(sum(case when ${dsrChangeSql} then 1 else 0 end), 0) as trocas_folga
       ${from}`,
      binds, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const statusWhere = status === 'TODOS' ? '' : status === 'PENDENTE' ? 'and v.status is null' : 'and v.status = :status';
    const folgaWhere = trocaFolga ? `and ${dsrChangeSql}` : '';
    const hojeWhere = conferidasHoje ? 'and v.status = \'CONFERIDO\' and trunc(v.dt_hr_visto) = trunc(sysdate)' : '';
    const page = await connection.execute(
      `select e.evento_id, e.loja, to_char(e.mes_ref, 'YYYY-MM-DD') as mes_ref,
        e.escsecao_id, e.escfunc_id, e.login, to_char(e.dt_hr_incl, 'YYYY-MM-DD"T"HH24:MI:SS') as dt_hr_incl,
        e.detalhe, j.dia, j.antes_prog, j.novo_prog,
        f.nome as funcionario_nome, f.chapa as funcionario_chapa,
        s.descr as secao_nome, fun.descr as funcao_nome,
        v.status, v.revisor_login, v.motivo, v.observacao,
        to_char(v.dt_hr_visto, 'YYYY-MM-DD"T"HH24:MI:SS') as dt_hr_visto
       ${from} ${statusWhere} ${folgaWhere} ${hojeWhere}
       order by e.dt_hr_incl desc, e.evento_id desc, j.dia desc
       offset :offset rows fetch next :limit rows only`,
      { ...binds, ...(statusWhere.includes(':status') ? { status } : {}), offset, limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchInfo: { DETALHE: { type: oracledb.STRING } } }
    );
    const counts = summary.rows?.[0] || {};
    return {
      rows: (page.rows || []).map(buildRow),
      summary: Object.fromEntries(['total', 'pendentes', 'conferidas', 'contestadas', 'conferidas_hoje', 'trocas_folga']
        .map((key) => [key, Number(counts[key.toUpperCase()] || 0)]))
    };
  });
}

async function reviewRetifications({ lojaId, items, status, motivo, observacao, actor }) {
  return withConnection(async (connection) => {
    try {
      const ordered = [...items].sort((a, b) => a.eventoId - b.eventoId || a.dia.localeCompare(b.dia));
      for (const item of ordered) {
        const eventResult = await connection.execute(
          `select evento_id, loja, to_char(mes_ref, 'YYYY-MM-DD') as mes_ref, escsecao_id, escfunc_id, detalhe
             from sgn_esc_evento
            where evento_id = :eventoId and loja = :lojaId
              and situacao = 'POS_OFICIALIZACAO' and origem = 'USUARIO'
            for update`,
          { eventoId: item.eventoId, lojaId },
          { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchInfo: { DETALHE: { type: oracledb.STRING } } }
        );
        const event = eventResult.rows?.[0];
        if (!event || !(JSON.parse(event.DETALHE || '{}').alteracoes || []).some((change) => change.data === item.dia)) {
          const error = new Error('Retificacao nao encontrada para esta loja e data.'); error.statusCode = 404; throw error;
        }
        const existing = await connection.execute(
          `select status from sgn_esc_rh_visto where evento_id = :eventoId and dia = to_date(:dia, 'YYYY-MM-DD')`,
          { eventoId: item.eventoId, dia: item.dia }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (existing.rows?.length) {
          const error = new Error('Uma retificacao selecionada ja foi analisada. Atualize a lista.'); error.statusCode = 409; throw error;
        }
        await connection.execute(
          `insert into sgn_esc_rh_visto
           (evento_id, dia, status, revisor_id, revisor_login, motivo, observacao, dt_hr_visto)
           values (:eventoId, to_date(:dia, 'YYYY-MM-DD'), :status, :revisorId, :revisorLogin, :motivo, :observacao, sysdate)`,
          { eventoId: item.eventoId, dia: item.dia, status, revisorId: Number(actor.sub),
            revisorLogin: actor.login, motivo: motivo || null, observacao: observacao || null },
          { autoCommit: false }
        );
        if (status === 'CONTESTADO') {
          await appendEvent(connection, { operacaoId: createOperationId(), lojaId,
            mesRef: event.MES_REF,
            escsecaoId: event.ESCSECAO_ID, escfuncId: event.ESCFUNC_ID,
            actor, acao: 'RETIFICACAO_CONTESTADA_RH', origem: 'RH', situacao: 'POS_OFICIALIZACAO',
            detalhe: { eventoId: item.eventoId, dia: item.dia, motivo, observacao } });
        }
      }
      await connection.commit();
      return { reviewed: ordered.length };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

module.exports = { listRetifications, reviewRetifications, _private: { baseQuery, buildRow } };
