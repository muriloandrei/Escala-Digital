const { withConnection, closeOraclePool, oracledb } = require('../src/db/oracle');
const escalaService = require('../src/services/escalaService');
const { planHolidayRests } = require('../src/domain/holidayRest');
const { listNationalHolidays } = require('../src/domain/nationalHolidays');
const { getOperationalPeriodIso } = require('../src/domain/operationalPeriod');
const { validateEscalaPayload } = require('../src/rules/escalaRules');
const { permiteEscala } = require('../src/domain/employeeStatus');

const MES_REF = '2026-12-01';
const PERIODO = getOperationalPeriodIso(MES_REF);
const HOLIDAYS = new Set(listNationalHolidays(PERIODO.inicio, PERIODO.fim).map((item) => item.data));
const queryOptions = { outFormat: oracledb.OUT_FORMAT_OBJECT };

function dateIso(value) {
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
  return String(value || '').slice(0, 10);
}

function parseArgs(args) {
  const lojaArg = args.find((arg) => /^--loja=[1-9]\d*$/.test(arg));
  const all = args.includes('--all');
  const apply = args.includes('--apply');
  const byArg = args.find((arg) => /^--by=[\w.@-]{2,80}$/.test(arg));
  const includeOfficialized = args.includes('--include-officialized');
  if (Boolean(lojaArg) === all || (apply && !byArg) || (!apply && byArg)
    || args.length !== 1 + Number(includeOfficialized) + Number(apply) + Number(Boolean(byArg))) {
    throw new Error('Use --loja=NUMERO ou --all [--include-officialized] [--apply --by=OPERADOR].');
  }
  return { loja: lojaArg ? Number(lojaArg.slice(7)) : null, all, apply,
    by: byArg?.slice(5) || null, includeOfficialized };
}

function groupEmployees(rows) {
  const employees = new Map();
  for (const row of rows || []) {
    const id = Number(row.ESCFUNC_ID);
    if (!employees.has(id)) employees.set(id, { ...row, days: [], headerIds: new Set() });
    employees.get(id).headerIds.add(Number(row.ESCPROG_ID));
    if (row.DT) employees.get(id).days.push({
      data: row.DT, programacao: row.PROGRAMACAO,
      hrEnt1: row.HR_ENT1, hrSai1: row.HR_SAI1,
      hrEnt2: row.HR_ENT2, hrSai2: row.HR_SAI2
    });
  }
  return [...employees.values()];
}

function planEmployee(employee, fixedDays = [], { includeOfficialized = false, restCounts = new Map() } = {}) {
  const identity = { loja: Number(employee.LOJA), escfuncId: Number(employee.ESCFUNC_ID), chapa: employee.CHAPA };
  const blocked = (reason) => ({ ...identity, action: 'BLOCKED', reason });
  if (employee.headerIds.size !== 1) return blocked('Mais de uma escala ativa na revisao atual.');
  const days = [...employee.days].sort((left, right) => left.data.localeCompare(right.data));
  if (!days.length) return { ...identity, action: 'UNCHANGED' };
  const lockedDates = fixedDays.filter((row) => Number(row.ESCFUNC_ID) === identity.escfuncId)
    .map((row) => dateIso(row.DT));
  const fixedHolidays = days.filter((day) => HOLIDAYS.has(day.data)
    && ['F', 'TRB'].includes(day.programacao) && lockedDates.includes(day.data));
  if (fixedHolidays.length) {
    return blocked(`Feriado com programacao fixa exige revisao individual: ${fixedHolidays.map((day) => day.data).join(', ')}.`);
  }
  const pendingHolidays = days.filter((day) => HOLIDAYS.has(day.data)
    && ['F', 'TRB'].includes(day.programacao)).map((day) => day.data);
  if (!pendingHolidays.length) return { ...identity, action: 'UNCHANGED' };
  if (Number(employee.OFICIALIZADA) === 1 && !includeOfficialized) {
    return blocked('Oficializada; use --include-officialized para criar revisao pendente.');
  }
  if (!permiteEscala(employee.FUNCIONARIO_STATUS) || employee.DT_DEMISS) {
    return blocked('Funcionario inativo ou desligado; revisar individualmente.');
  }
  const employeePayload = {
    nome: employee.NOME, chapa: employee.CHAPA, escfuncId: identity.escfuncId,
    regimeEscala: employee.REGIME_ESCALA || '5X2', dtAncora12x36: dateIso(employee.DT_ANCORA_12X36) || null
  };
  const validate = (candidateDays) => validateEscalaPayload({ lojaId: identity.loja, mesRef: MES_REF,
    funcionarios: [{ ...employeePayload, dias: candidateDays }] });
  const plan = planHolidayRests(days, { regime: employeePayload.regimeEscala, lockedDates,
    holidayDates: HOLIDAYS, validate, restCounts: new Map(restCounts) });
  if (plan.blocked.length || plan.converted.length !== pendingHolidays.length) {
    return blocked(`Feriado sem alternativa 5x2 valida: ${plan.blocked.join(', ') || pendingHolidays.join(', ')}.`);
  }
  if (!plan.converted.length) return { ...identity, action: 'UNCHANGED' };
  return { ...identity, action: 'CORRECT', revision: Number(employee.REVISAO),
    officialized: Number(employee.OFICIALIZADA) === 1,
    holidays: plan.converted, replacementRests: plan.replacementRests,
    payload: {
      escfuncId: identity.escfuncId, escsecaoId: Number(employee.ESCSECAO_ID),
      escfuncaoId: Number(employee.ESCFUNCAO_ID), chapa: employee.CHAPA,
      nome: employee.NOME, revisaoBase: Number(employee.REVISAO),
      turnoOficial: {
        escsecaoTurnoId: employee.ESCSECAOTURNO_ID,
        hrEnt1: employee.HR_OFICIAL_ENT1, hrSai1: employee.HR_OFICIAL_SAI1,
        hrEnt2: employee.HR_OFICIAL_ENT2, hrSai2: employee.HR_OFICIAL_SAI2
      },
      dias: plan.days
    } };
}

async function listStores(connection) {
  const result = await connection.execute(
    `select distinct loja from sgn_esc_prog where mes_ref = date '2026-12-01'
       and nvl(ativa, 1) = 1 order by loja`, {}, queryOptions
  );
  return result.rows.map((row) => Number(row.LOJA));
}

async function loadEmployees(connection, loja, escfuncId = null) {
  const employeeFilter = escfuncId ? 'and p.escfunc_id = :escfuncId' : '';
  const result = await connection.execute(
    `select p.escprog_id, p.loja, p.escfunc_id, p.escsecao_id, p.escfuncao_id,
            p.escsecaoturno_id, p.hr_oficial_ent1, p.hr_oficial_sai1,
            p.hr_oficial_ent2, p.hr_oficial_sai2,
            p.chapa, p.revisao, p.oficializada, f.nome,
            f.status funcionario_status, to_char(f.dt_demiss, 'YYYY-MM-DD') dt_demiss,
            nvl(r.regime, '5X2') regime_escala,
            to_char(r.dt_ancora, 'YYYY-MM-DD') dt_ancora_12x36,
            to_char(d.dt, 'YYYY-MM-DD') dt, d.programacao,
            d.hr_ent1, d.hr_sai1, d.hr_ent2, d.hr_sai2
       from sgn_esc_prog p
       join sgn_esc_funcionario f on f.escfunc_id = p.escfunc_id and f.loja = p.loja
       left join (
         select regime_config.*, row_number() over (
           partition by regime_config.loja, regime_config.escfunc_id
           order by regime_config.mes_inicio desc, regime_config.regime_id desc
         ) rn
           from sgn_esc_regime_func regime_config
          where regime_config.mes_inicio <= date '2026-12-01'
       ) r on r.loja = p.loja and r.escfunc_id = p.escfunc_id and r.rn = 1
       left join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
      where p.loja = :loja and p.mes_ref = date '2026-12-01'
        ${employeeFilter}
        and nvl(p.ativa, 1) = 1
        and p.revisao = (select max(px.revisao) from sgn_esc_prog px
          where px.loja = p.loja and px.escfunc_id = p.escfunc_id
            and px.mes_ref = p.mes_ref and nvl(px.ativa, 1) = 1)
      order by p.escfunc_id, d.dt`, escfuncId ? { loja, escfuncId } : { loja }, queryOptions
  );
  return groupEmployees(result.rows);
}

async function loadEmployeeFixes(connection, loja, escfuncId) {
  const result = await connection.execute(
    `select escfunc_id, to_char(dt, 'YYYY-MM-DD') dt
       from sgn_esc_fixo_escala
      where loja = :loja and mes_ref = date '2026-12-01'
        and escfunc_id = :escfuncId and nvl(status, 'A') = 'A'`,
    { loja, escfuncId }, queryOptions
  );
  return result.rows;
}

async function processStore(loja, args) {
  const employees = await withConnection((connection) => loadEmployees(connection, loja));
  const fixedDays = await escalaService.listFixosEscala({ lojaId: loja, mesRef: MES_REF });
  const counts = { correct: 0, blocked: 0, unchanged: 0, applied: 0, failed: 0 };
  const restCountsBySection = new Map();
  for (const employee of employees) {
    const sectionId = Number(employee.ESCSECAO_ID);
    if (!restCountsBySection.has(sectionId)) restCountsBySection.set(sectionId, new Map());
    const sectionCounts = restCountsBySection.get(sectionId);
    for (const day of employee.days) {
      if (day.programacao === 'TRB') continue;
      sectionCounts.set(day.data, (sectionCounts.get(day.data) || 0) + 1);
    }
  }
  for (const employee of employees) {
    const sectionCounts = restCountsBySection.get(Number(employee.ESCSECAO_ID));
    const plan = planEmployee(employee, fixedDays, { ...args, restCounts: sectionCounts });
    if (plan.action === 'UNCHANGED') { counts.unchanged += 1; continue; }
    if (plan.action === 'BLOCKED') {
      counts.blocked += 1;
      console.log(JSON.stringify(plan));
      continue;
    }
    counts.correct += 1;
    console.log(JSON.stringify({ loja, escfuncId: plan.escfuncId, chapa: plan.chapa,
      action: args.apply ? 'APPLY' : 'PREVIEW', revision: plan.revision,
      officialized: plan.officialized, holidays: plan.holidays,
      replacementRests: plan.replacementRests }));
    let applied = !args.apply;
    if (args.apply) {
      try {
        const current = await withConnection((connection) => loadEmployees(connection, loja, plan.escfuncId));
        const fresh = current.find((row) => Number(row.ESCFUNC_ID) === plan.escfuncId);
        const freshFixes = await withConnection((connection) => loadEmployeeFixes(connection, loja, plan.escfuncId));
        const refreshed = fresh && planEmployee(fresh, freshFixes, { ...args, restCounts: sectionCounts });
        if (!refreshed || JSON.stringify(refreshed.payload) !== JSON.stringify(plan.payload)) {
          throw new Error('Escala ou fixos mudaram desde a previa; execute novamente.');
        }
        await escalaService.saveEscalasFuncionariosRevision({ lojaId: loja, mesRef: MES_REF,
          funcionarios: [plan.payload], oficializada: 0,
          actor: { login: args.by, perfil: 'ADMIN' }, acao: 'CORRIGIR_FDO_FERIADO' });
        counts.applied += 1;
        applied = true;
      } catch (error) {
        counts.failed += 1;
        console.error(`FALHA loja=${loja} escfunc=${plan.escfuncId}: ${error.message}`);
      }
    }
    if (applied) {
      const previous = new Map(employee.days.map((day) => [day.data, day.programacao]));
      for (const day of plan.payload.dias) {
        if (previous.get(day.data) !== 'TRB' || day.programacao === 'TRB') continue;
        sectionCounts.set(day.data, (sectionCounts.get(day.data) || 0) + 1);
      }
    }
  }
  return counts;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const stores = args.all ? await withConnection(listStores) : [args.loja];
    const totals = { correct: 0, blocked: 0, unchanged: 0, applied: 0, failed: 0 };
    for (const loja of stores) {
      try {
        const result = await processStore(loja, args);
        for (const key of Object.keys(totals)) totals[key] += result[key];
      } catch (error) {
        totals.failed += 1;
        console.error(`FALHA loja=${loja}: ${error.message}`);
      }
    }
    console.log(JSON.stringify({ modo: args.apply ? 'APLICACAO' : 'PREVIA', mesRef: MES_REF,
      periodo: PERIODO, feriados: [...HOLIDAYS], lojas: stores.length, ...totals }));
    if (totals.failed || (args.apply && totals.blocked)) process.exitCode = 1;
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) main().catch((error) => {
  console.error(`Correcao interrompida: ${error.message}`);
  process.exitCode = 1;
});

module.exports = { parseArgs, planEmployee, groupEmployees };
