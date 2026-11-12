const { withConnection, oracledb } = require('../db/oracle');
const catalogService = require('./catalogService');
const { getOperationalPeriodIso } = require('../domain/operationalPeriod');
const { isIsoDate, isDutyDay } = require('../domain/workRegime');
const { validate12x36Shift } = require('../domain/shiftValidation');

const DEFAULT_HOURS = Object.freeze({ HR_ENT1: '07:00', HR_SAI1: '12:30', HR_ENT2: '13:30', HR_SAI2: '19:00' });

function assertPostStore(lojaId) {
  if (!Number.isInteger(Number(lojaId)) || Number(lojaId) < 700 || Number(lojaId) > 799) {
    const error = new Error('Escala 12x36 disponivel somente nos postos 700 a 799.');
    error.statusCode = 422;
    throw error;
  }
}

function periodDates(mesRef) {
  const period = getOperationalPeriodIso(mesRef);
  const dates = [];
  for (let timestamp = Date.parse(`${period.inicio}T00:00:00Z`);
    timestamp <= Date.parse(`${period.fim}T00:00:00Z`); timestamp += 86400000) {
    dates.push(new Date(timestamp).toISOString().slice(0, 10));
  }
  return dates;
}

async function employeesInSection(lojaId, mesRef, escsecaoId) {
  const employees = await catalogService.listFuncionariosByLoja(lojaId, {
    mesRef, secoesPermitidas: [Number(escsecaoId)]
  });
  return new Map(employees.filter((person) => Number(person.ESCSECAO_ID) === Number(escsecaoId))
    .map((person) => [Number(person.ESCFUNC_ID), person]));
}

function assertEmployee(employees, escfuncId) {
  if (!employees.has(Number(escfuncId))) {
    const error = new Error('Funcionario nao pertence a esta secao do posto.');
    error.statusCode = 422;
    throw error;
  }
}

function assertHours(hours) {
  const errors = validate12x36Shift(hours);
  if (errors.length) {
    const error = new Error(errors[0]);
    error.statusCode = 422;
    throw error;
  }
}

function simulationRows({ lojaId, mesRef, escsecaoId, escfuncId, anchor, hours, actor }) {
  return periodDates(mesRef).map((date) => ({
    lojaId: Number(lojaId), mesRef, escsecaoId: Number(escsecaoId), escfuncId: Number(escfuncId),
    diaIso: date, anchor, programacao: isDutyDay(anchor, date) ? 'TRB' : 'F',
    ...hours, login: String(actor?.login || 'SISTEMA').slice(0, 100)
  }));
}

function planBalancedAnchors(employees, ids, dates) {
  const sections = new Map();
  for (const id of ids) {
    const person = employees.get(id);
    const subsection = String(person.ESCSUBSECAO_ID || 'sem');
    if (!sections.has(subsection)) sections.set(subsection, []);
    sections.get(subsection).push(person);
  }
  const anchors = new Map();
  const totals = [0, 0];
  for (const [, people] of [...sections.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const local = [0, 0];
    people.sort((left, right) => String(left.CHAPA || '').localeCompare(String(right.CHAPA || ''))
      || Number(left.ESCFUNC_ID) - Number(right.ESCFUNC_ID));
    for (const person of people) {
      const phase = local[0] === local[1]
        ? (totals[0] <= totals[1] ? 0 : 1)
        : (local[0] < local[1] ? 0 : 1);
      anchors.set(Number(person.ESCFUNC_ID), dates[phase]);
      local[phase] += 1;
      totals[phase] += 1;
    }
  }
  return anchors;
}

async function replaceEmployee(connection, input) {
  const rows = simulationRows(input);
  await connection.execute(
    `delete from sgn_esc_sim_12x36 where loja = :lojaId and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
      and escfunc_id = :escfuncId`,
    { lojaId: input.lojaId, mesRef: input.mesRef, escfuncId: input.escfuncId }, { autoCommit: false }
  );
  await connection.executeMany(
    `insert into sgn_esc_sim_12x36
       (loja, mes_ref, escsecao_id, escfunc_id, dia, dt_ancora, programacao,
        hr_ent1, hr_sai1, hr_ent2, hr_sai2, login, dt_hr_alter)
     values (:lojaId, to_date(:mesRef, 'YYYY-MM-DD'), :escsecaoId, :escfuncId,
       to_date(:diaIso, 'YYYY-MM-DD'), to_date(:anchor, 'YYYY-MM-DD'), :programacao,
       :HR_ENT1, :HR_SAI1, :HR_ENT2, :HR_SAI2, :login, sysdate)`,
    rows, { autoCommit: false }
  );
  return rows.length;
}

async function list({ lojaId, mesRef, escsecaoId }) {
  assertPostStore(lojaId);
  const employees = await employeesInSection(lojaId, mesRef, escsecaoId);
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select escfunc_id, to_char(dia, 'YYYY-MM-DD') dia,
              to_char(dt_ancora, 'YYYY-MM-DD') dt_ancora, programacao,
              hr_ent1, hr_sai1, hr_ent2, hr_sai2
         from sgn_esc_sim_12x36
        where loja = :lojaId and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
          and escsecao_id = :escsecaoId order by escfunc_id, dia`,
      { lojaId: Number(lojaId), mesRef, escsecaoId: Number(escsecaoId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return (result.rows || []).filter((row) => employees.has(Number(row.ESCFUNC_ID)));
  });
}

async function generate({ lojaId, mesRef, escsecaoId, escfuncIds, actor }) {
  assertPostStore(lojaId);
  const employees = await employeesInSection(lojaId, mesRef, escsecaoId);
  const ids = [...new Set((escfuncIds || []).map(Number))];
  if (!ids.length) {
    const error = new Error('Selecione ao menos um funcionario para gerar a escala 12x36.');
    error.statusCode = 422;
    throw error;
  }
  ids.forEach((id) => assertEmployee(employees, id));
  const dates = periodDates(mesRef);
  const anchors = planBalancedAnchors(employees, ids, dates);
  return withConnection(async (connection) => {
    try {
      let days = 0;
      for (const escfuncId of ids) {
        days += await replaceEmployee(connection, { lojaId, mesRef, escsecaoId, escfuncId,
          anchor: anchors.get(escfuncId), hours: DEFAULT_HOURS, actor });
      }
      await connection.commit();
      return { funcionarios: ids.length, dias: days };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

async function reset({ lojaId, mesRef, escsecaoId, escfuncIds }) {
  assertPostStore(lojaId);
  const employees = await employeesInSection(lojaId, mesRef, escsecaoId);
  const ids = [...new Set((escfuncIds || []).map(Number))];
  if (!ids.length) {
    const error = new Error('Selecione ao menos um funcionario para resetar a escala 12x36.');
    error.statusCode = 422;
    throw error;
  }
  ids.forEach((id) => assertEmployee(employees, id));
  return withConnection(async (connection) => {
    try {
      let dias = 0;
      for (const escfuncId of ids) {
        const result = await connection.execute(
          `delete from sgn_esc_sim_12x36 where loja = :lojaId and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
            and escsecao_id = :escsecaoId and escfunc_id = :escfuncId`,
          { lojaId: Number(lojaId), mesRef, escsecaoId: Number(escsecaoId), escfuncId }, { autoCommit: false }
        );
        dias += result.rowsAffected || 0;
      }
      await connection.commit();
      return { funcionarios: ids.length, dias };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

async function configureEmployee({ lojaId, mesRef, escsecaoId, escfuncId, anchor, hours, actor }) {
  assertPostStore(lojaId);
  const dates = periodDates(mesRef);
  if (!isIsoDate(anchor) || !dates.includes(anchor)) {
    const error = new Error('A ancora deve estar no periodo desta escala.');
    error.statusCode = 422;
    throw error;
  }
  assertHours(hours);
  assertEmployee(await employeesInSection(lojaId, mesRef, escsecaoId), escfuncId);
  return withConnection(async (connection) => {
    try {
      const days = await replaceEmployee(connection, { lojaId, mesRef, escsecaoId, escfuncId, anchor, hours, actor });
      await connection.commit();
      return { dias: days };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

async function invertEmployee({ lojaId, mesRef, escsecaoId, escfuncId, anchor, date, hours, actor }) {
  assertPostStore(lojaId);
  const dates = periodDates(mesRef);
  if (!isIsoDate(anchor) || !dates.includes(anchor)) {
    const error = new Error('O dia de plantao deve estar no periodo desta escala.');
    error.statusCode = 422;
    throw error;
  }
  if (hours && (!date || !dates.includes(date) || !isDutyDay(anchor, date))) {
    const error = new Error('Informe um dia de plantao valido para ajustar o horario.');
    error.statusCode = 422;
    throw error;
  }
  if (hours) assertHours(hours);
  assertEmployee(await employeesInSection(lojaId, mesRef, escsecaoId), escfuncId);
  return withConnection(async (connection) => {
    const binds = { lojaId: Number(lojaId), mesRef, escsecaoId: Number(escsecaoId),
      escfuncId: Number(escfuncId), anchor, inicio: dates[0], fim: dates.at(-1),
      login: String(actor?.login || 'SISTEMA').slice(0, 100) };
    try {
      const existing = await connection.execute(
        `select count(*) total from sgn_esc_sim_12x36
          where loja = :lojaId and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
            and escsecao_id = :escsecaoId and escfunc_id = :escfuncId
            and dia between to_date(:inicio, 'YYYY-MM-DD') and to_date(:fim, 'YYYY-MM-DD')`,
        { lojaId: binds.lojaId, mesRef, escsecaoId: binds.escsecaoId,
          escfuncId: binds.escfuncId, inicio: binds.inicio, fim: binds.fim },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (Number(existing.rows?.[0]?.TOTAL) !== dates.length) {
        const error = new Error('Gere a escala 12x36 completa antes de inverter a alternancia.');
        error.statusCode = 422;
        throw error;
      }
      const result = await connection.execute(
        `update sgn_esc_sim_12x36
            set dt_ancora = to_date(:anchor, 'YYYY-MM-DD'),
                programacao = case when mod(trunc(dia) - to_date(:anchor, 'YYYY-MM-DD'), 2) = 0 then 'TRB' else 'F' end,
                login = :login, dt_hr_alter = sysdate
          where loja = :lojaId and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
            and escsecao_id = :escsecaoId and escfunc_id = :escfuncId
            and dia between to_date(:inicio, 'YYYY-MM-DD') and to_date(:fim, 'YYYY-MM-DD')`,
        binds, { autoCommit: false }
      );
      if (result.rowsAffected !== dates.length) {
        const error = new Error('Escala 12x36 alterada durante a inversao. Atualize e tente novamente.');
        error.statusCode = 409;
        throw error;
      }
      if (hours) {
        const adjusted = await connection.execute(
          `update sgn_esc_sim_12x36 set hr_ent1 = :HR_ENT1, hr_sai1 = :HR_SAI1,
                  hr_ent2 = :HR_ENT2, hr_sai2 = :HR_SAI2
            where loja = :lojaId and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
              and escsecao_id = :escsecaoId and escfunc_id = :escfuncId
              and dia = to_date(:diaIso, 'YYYY-MM-DD') and programacao = 'TRB'`,
          { ...hours, lojaId: binds.lojaId, mesRef, escsecaoId: binds.escsecaoId,
            escfuncId: binds.escfuncId, diaIso: date }, { autoCommit: false }
        );
        if (adjusted.rowsAffected !== 1) {
          const error = new Error('Plantao nao encontrado apos inverter a alternancia.');
          error.statusCode = 409;
          throw error;
        }
      }
      await connection.commit();
      return { dias: result.rowsAffected };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

async function editDay({ lojaId, mesRef, escsecaoId, escfuncId, date, hours, actor }) {
  assertPostStore(lojaId);
  if (!periodDates(mesRef).includes(date)) {
    const error = new Error('Dia fora do periodo da escala 12x36.');
    error.statusCode = 422;
    throw error;
  }
  assertHours(hours);
  assertEmployee(await employeesInSection(lojaId, mesRef, escsecaoId), escfuncId);
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `update sgn_esc_sim_12x36 set hr_ent1 = :HR_ENT1, hr_sai1 = :HR_SAI1,
              hr_ent2 = :HR_ENT2, hr_sai2 = :HR_SAI2, login = :login, dt_hr_alter = sysdate
        where loja = :lojaId and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
          and escsecao_id = :escsecaoId and escfunc_id = :escfuncId
          and dia = to_date(:diaIso, 'YYYY-MM-DD') and programacao = 'TRB'`,
      { ...hours, login: String(actor?.login || 'SISTEMA').slice(0, 100),
        lojaId: Number(lojaId), mesRef, escsecaoId: Number(escsecaoId), escfuncId: Number(escfuncId), diaIso: date },
      { autoCommit: false }
    );
    if (result.rowsAffected !== 1) {
      await connection.rollback();
      const error = new Error('Plantao nao encontrado. Gere a escala 12x36 antes de editar.');
      error.statusCode = 422;
      throw error;
    }
    await connection.commit();
    return { atualizado: true };
  });
}

module.exports = { DEFAULT_HOURS, periodDates, simulationRows, planBalancedAnchors,
  list, generate, reset, configureEmployee, invertEmployee, editDay };
