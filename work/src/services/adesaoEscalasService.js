const { withConnection, oracledb } = require('../db/oracle');
const accessService = require('./accessService');

const SQL = `with revisoes as (
  select p.escprog_id, p.loja, p.mes_ref, p.escfunc_id, p.escsecao_id,
         p.revisao, p.oficializada,
         row_number() over (
           partition by p.loja, p.mes_ref, p.escfunc_id
           order by p.revisao desc, p.escprog_id desc
         ) as rn
    from sgn_esc_prog p
   where nvl(p.ativa, 1) = 1
     and p.mes_ref >= to_date(:mesInicial, 'YYYY-MM')
     and p.mes_ref < add_months(to_date(:mesFinal, 'YYYY-MM'), 1)
     and (:loja is null or p.loja = :loja)
     /*LOJAS_PERMITIDAS*/
), atuais as (
  select * from revisoes where rn = 1
)
select p.loja,
       to_char(p.mes_ref, 'YYYY-MM') as mes_escala,
       p.escsecao_id,
       s.cod_secao,
       trim(replace(replace(s.descr, chr(13), ''), chr(10), '')) as secao,
       count(distinct p.escfunc_id) as funcionarios,
       count(distinct case when p.oficializada = 1 then p.escfunc_id end) as funcionarios_oficializados,
       count(d.escprogdia_id) as dias_gravados,
       sum(case when p.oficializada = 1 and d.escprogdia_id is not null then 1 else 0 end) as dias_oficializados,
       round(100 * sum(case when p.oficializada = 1 and d.escprogdia_id is not null then 1 else 0 end)
         / nullif(count(d.escprogdia_id), 0), 1) as percentual_dias_oficializados,
       sum(case when d.programacao = 'F' then 1 else 0 end) as folgas_normais,
       max(p.revisao) as maior_revisao,
       case
         when count(d.escprogdia_id) = 0 then 'SEM_DIAS'
         when min(nvl(p.oficializada, 0)) = 1
           and count(distinct case when d.escprogdia_id is not null then p.escfunc_id end)
             = count(distinct p.escfunc_id) then 'OFICIALIZADA'
         when max(nvl(p.oficializada, 0)) = 1 then 'PARCIAL'
         else 'NAO_OFICIALIZADA'
       end as status
  from atuais p
  left join sgn_esc_secao s on s.escsecao_id = p.escsecao_id
  left join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
 where 1 = 1
   /*SECOES_PERMITIDAS*/
 group by p.loja, p.mes_ref, p.escsecao_id, s.cod_secao, s.descr
 order by p.loja, p.mes_ref, s.cod_secao`;

function inClause(field, values, binds, prefix) {
  const unique = [...new Set(values.map(Number).filter(Number.isInteger))];
  if (!unique.length) return 'and 1 = 0';
  return `and ${field} in (${unique.map((value, index) => {
    const key = `${prefix}${index}`;
    binds[key] = value;
    return `:${key}`;
  }).join(', ')})`;
}

function buildQuery({ mes_inicial, mes_final, loja }, requestUser, sectionIds) {
  const binds = { mesInicial: mes_inicial, mesFinal: mes_final, loja: loja ?? null };
  const stores = accessService.isGlobalStoreAccessUser(requestUser) ? null : (requestUser.lojas || []);
  const storeFilter = stores === null ? '' : inClause('p.loja', stores, binds, 'lojaPermitida');
  const sectionFilter = sectionIds === null ? '' : inClause('p.escsecao_id', sectionIds, binds, 'secaoPermitida');
  return {
    sql: SQL.replace('/*LOJAS_PERMITIDAS*/', storeFilter).replace('/*SECOES_PERMITIDAS*/', sectionFilter),
    binds
  };
}

function mapSection(row) {
  return {
    escsecaoId: Number(row.ESCSECAO_ID),
    codSecao: row.COD_SECAO || '',
    secao: row.SECAO || 'Secao nao cadastrada',
    funcionarios: Number(row.FUNCIONARIOS || 0),
    funcionariosOficializados: Number(row.FUNCIONARIOS_OFICIALIZADOS || 0),
    diasGravados: Number(row.DIAS_GRAVADOS || 0),
    diasOficializados: Number(row.DIAS_OFICIALIZADOS || 0),
    percentualDiasOficializados: Number(row.PERCENTUAL_DIAS_OFICIALIZADOS || 0),
    folgasNormais: Number(row.FOLGAS_NORMAIS || 0),
    maiorRevisao: Number(row.MAIOR_REVISAO || 0),
    status: row.STATUS
  };
}

function aggregateRows(rows) {
  const groups = new Map();
  for (const row of rows) {
    const loja = Number(row.LOJA);
    const mesEscala = row.MES_ESCALA;
    const key = `${loja}:${mesEscala}`;
    if (!groups.has(key)) groups.set(key, { loja, mesEscala, secoes: [] });
    groups.get(key).secoes.push(mapSection(row));
  }

  return [...groups.values()].map((item) => {
    const secoes = item.secoes;
    const funcionarios = secoes.reduce((sum, secao) => sum + secao.funcionarios, 0);
    const funcionariosOficializados = secoes.reduce((sum, secao) => sum + secao.funcionariosOficializados, 0);
    const diasGravados = secoes.reduce((sum, secao) => sum + secao.diasGravados, 0);
    const diasOficializados = secoes.reduce((sum, secao) => sum + secao.diasOficializados, 0);
    const coberturaDias = funcionarios ? Math.min(100, Math.round(10 * diasGravados / (funcionarios * 30) * 100) / 10) : 0;
    const percentualOficializado = diasGravados ? Math.round(1000 * diasOficializados / diasGravados) / 10 : 0;
    const secoesOficializadas = secoes.filter((secao) => secao.status === 'OFICIALIZADA').length;
    const estagio = secoes.length && secoesOficializadas === secoes.length && funcionariosOficializados === funcionarios
      ? 'CONCLUIDA'
      : funcionariosOficializados > 0 ? 'EM_OFICIALIZACAO'
        : coberturaDias >= 30 ? 'EM_PREENCHIMENTO' : 'NAO_INICIADA';
    return {
      ...item, estagio, funcionarios, funcionariosOficializados, diasGravados, diasOficializados,
      folgasNormais: secoes.reduce((sum, secao) => sum + secao.folgasNormais, 0),
      secoesOficializadas, totalSecoes: secoes.length, coberturaDias, percentualOficializado
    };
  });
}

function monthsBetween(first, last) {
  const [firstYear, firstMonth] = first.split('-').map(Number);
  const [lastYear, lastMonth] = last.split('-').map(Number);
  const months = [];
  for (let index = firstYear * 12 + firstMonth; index <= lastYear * 12 + lastMonth; index += 1) {
    months.push(`${Math.floor((index - 1) / 12)}-${String((index - 1) % 12 + 1).padStart(2, '0')}`);
  }
  return months;
}

function withEmptyMonths(aggregated, storeIds, first, last) {
  const byKey = new Map(aggregated.map((item) => [`${item.loja}:${item.mesEscala}`, item]));
  return storeIds.flatMap((loja) => monthsBetween(first, last).map((mesEscala) =>
    byKey.get(`${loja}:${mesEscala}`) || {
      loja, mesEscala, secoes: [], estagio: 'NAO_INICIADA', funcionarios: 0, funcionariosOficializados: 0,
      diasGravados: 0, diasOficializados: 0, folgasNormais: 0, secoesOficializadas: 0, totalSecoes: 0,
      coberturaDias: 0, percentualOficializado: 0
    }
  ));
}

function buildStoreQuery(params, requestUser, sectionIds) {
  const binds = { loja: params.loja ?? null };
  const stores = accessService.isGlobalStoreAccessUser(requestUser) ? null : (requestUser.lojas || []);
  const storeFilter = stores === null ? '' : inClause('l.loja', stores, binds, 'lojaPermitida');
  const sectionFilter = sectionIds === null ? '' : inClause('s.escsecao_id', sectionIds, binds, 'secaoPermitida');
  return {
    sql: `select l.loja from sgn_esc_loja l
           where (:loja is null or l.loja = :loja)
             ${storeFilter}
             ${sectionIds === null ? '' : `and exists (
               select 1 from sgn_esc_secao s
                where s.codfilial = l.loja ${sectionFilter}
             )`}
           order by l.loja`,
    binds
  };
}

async function getAdesaoEscalas(params, requestUser) {
  const sectionIds = await accessService.getSecoesPermitidasUsuario(requestUser, params.loja || null);
  const { sql, binds } = buildQuery(params, requestUser, sectionIds);
  const stores = buildStoreQuery(params, requestUser, sectionIds);
  const { rows, storeIds } = await withConnection(async (connection) => {
    const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const storeResult = await connection.execute(stores.sql, stores.binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return { rows: result.rows, storeIds: storeResult.rows.map((row) => Number(row.LOJA)) };
  });
  return { mesInicial: params.mes_inicial, mesFinal: params.mes_final,
    lojas: withEmptyMonths(aggregateRows(rows), storeIds, params.mes_inicial, params.mes_final) };
}

module.exports = { getAdesaoEscalas, aggregateRows, buildQuery, buildStoreQuery, withEmptyMonths };
