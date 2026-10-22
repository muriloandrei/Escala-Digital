const { withConnection, oracledb } = require('../db/oracle');
const catalogService = require('./catalogService');
const escalaService = require('./escalaService');
const { getOperationalPeriodIso } = require('../domain/operationalPeriod');
const { validarCriticasEscopo } = require('../rules/escalaRules');
const { permiteEscala } = require('../domain/employeeStatus');
const { isSecaoEscopoOperacional, isSecaoFiscalRemoto } = require('./monthlyReleaseService');

function datesInPeriod({ inicio, fim }) {
  const dates = [];
  const date = new Date(`${inicio}T00:00:00Z`);
  const end = new Date(`${fim}T00:00:00Z`);
  while (date <= end && dates.length < 42) {
    dates.push(date.toISOString().slice(0, 10));
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return dates;
}

function dateKey(value) {
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
  return String(value || '').slice(0, 10);
}

function buildProgress({ escala, secoes, pessoas = escala.funcionarios || [], suspensoes = [], periodo, lojaId, mesRef,
  includeEmpty = false, includeCritiques = true }) {
  const dates = datesInPeriod(periodo);
  const suspensionByEmployee = new Map();
  for (const suspension of suspensoes) {
    const id = Number(suspension.ESCFUNC_ID);
    if (!suspensionByEmployee.has(id)) suspensionByEmployee.set(id, []);
    suspensionByEmployee.get(id).push({ start: dateKey(suspension.DT_INICIO), end: suspension.DT_FIM ? dateKey(suspension.DT_FIM) : '9999-12-31' });
  }
  const isSuspended = (person, date) => (suspensionByEmployee.get(Number(person.ESCFUNC_ID)) || [])
    .some((suspension) => suspension.start <= date && suspension.end >= date);
  const absencesByEmployee = new Map();
  for (const absence of escala.ausencias || []) {
    const id = Number(absence.ESCFUNC_ID);
    if (!absencesByEmployee.has(id)) absencesByEmployee.set(id, []);
    absencesByEmployee.get(id).push({ start: dateKey(absence.DT_INIC), end: dateKey(absence.DT_FIM || absence.DT_INIC) });
  }
  const diasPorFuncionario = new Map();
  for (const dia of escala.dias || []) {
    const id = Number(dia.ESCFUNC_ID);
    if (!diasPorFuncionario.has(id)) diasPorFuncionario.set(id, new Map());
    diasPorFuncionario.get(id).set(`${Number(dia.ESCSECAO_ID)}|${dateKey(dia.DT)}`, dia);
  }
  const results = secoes.map((secao) => {
    const escsecaoId = Number(secao.ESCSECAO_ID);
    const people = pessoas.filter((person) =>
      Number(person.ESCSECAO_ID) === escsecaoId && permiteEscala(person.STATUS)
      && !dates.every((date) => isSuspended(person, date)
        || (absencesByEmployee.get(Number(person.ESCFUNC_ID)) || [])
          .some((absence) => absence.start <= date && absence.end >= date)));
    let expected = 0;
    let filled = 0;
    let official = 0;
    for (const person of people) {
      const days = diasPorFuncionario.get(Number(person.ESCFUNC_ID)) || new Map();
      for (const date of dates) {
        if ((person.DT_DEMISS && date > dateKey(person.DT_DEMISS)) || isSuspended(person, date)) continue;
        expected += 1;
        const day = days.get(`${escsecaoId}|${date}`);
        if (day && !day.AUSENCIA_PROJETADA) filled += 1;
        if (Number(day?.OFICIALIZADA) === 1) official += 1;
      }
    }
    const funcionarios = people.map((person) => ({
      escfuncId: Number(person.ESCFUNC_ID), nome: person.NOME, chapa: person.CHAPA,
      funcao: person.FUNCAO_DESCR,
      dias: [...(diasPorFuncionario.get(Number(person.ESCFUNC_ID))?.values() || [])]
        .filter((day) => Number(day.ESCSECAO_ID) === escsecaoId)
    }));
    const criticas = includeCritiques && people.length ? validarCriticasEscopo({ lojaId, mesRef, funcionarios }) : [];
    const completa = expected > 0 && filled === expected;
    return {
      escsecaoId, secao: secao.DESCR, codigo: secao.COD_SECAO,
      funcionarios: people.length, previstos: expected, preenchidos: filled,
      percentual: expected ? Math.round(filled / expected * 100) : 0,
      criticas: criticas.length, completa,
      oficializada: completa && official === expected,
      podeOficializar: completa && criticas.length === 0 && official !== expected
    };
  }).filter((section) => includeEmpty || section.funcionarios > 0);
  return { secoes: results, oficializada: results.length > 0 && results.every((section) => section.oficializada) };
}

async function getStoreEnabled(lojaId) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      'select oficializacao_habilitada from sgn_esc_loja where loja = :lojaId',
      { lojaId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!result.rows?.length) return null;
    return Number(result.rows[0].OFICIALIZACAO_HABILITADA) === 1;
  });
}

async function getSuspensions(lojaId, periodo) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select escfunc_id, dt_inicio, dt_fim from sgn_esc_pendencia_func
        where loja = :lojaId and status = 'P'
          and dt_inicio <= to_date(:fim, 'YYYY-MM-DD')
          and (dt_fim is null or dt_fim >= to_date(:inicio, 'YYYY-MM-DD'))`,
      { lojaId, inicio: periodo.inicio, fim: periodo.fim },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows || [];
  });
}

async function setStoreEnabled(lojaId, enabled) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      'update sgn_esc_loja set oficializacao_habilitada = :enabled where loja = :lojaId',
      { lojaId, enabled: enabled ? 1 : 0 }, { autoCommit: false }
    );
    if (!result.rowsAffected) { await connection.rollback(); return false; }
    await connection.commit();
    return true;
  });
}

async function getProgress({ lojaId, mesRef, secoesPermitidas = null, escala = null,
  includeEmpty = false, includeCritiques = true }) {
  const periodo = getOperationalPeriodIso(mesRef);
  const [schedule, secoes, pessoas, suspensoes, enabled] = await Promise.all([
    escala || escalaService.getEscalaMensal({ lojaId, mesRef, secoesPermitidas }),
    catalogService.listSecoesByLoja(lojaId, { secoesPermitidas }),
    catalogService.listFuncionariosByLoja(lojaId, { mesRef, secoesPermitidas }),
    getSuspensions(lojaId, periodo),
    getStoreEnabled(lojaId)
  ]);
  const operacionais = secoes.filter((secao) => isSecaoEscopoOperacional(secao)
    || (Number(lojaId) === 999 && isSecaoFiscalRemoto(secao)));
  return { ...buildProgress({ escala: schedule, secoes: operacionais, pessoas, suspensoes, periodo, lojaId, mesRef,
    includeEmpty, includeCritiques }), habilitada: enabled === true };
}

module.exports = { buildProgress, getProgress, getStoreEnabled, setStoreEnabled };
