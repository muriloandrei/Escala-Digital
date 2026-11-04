const { withConnection, oracledb } = require('../db/oracle');
const { getOperationalPeriodIso } = require('../domain/operationalPeriod');

const NOVEMBER_REF = '2026-11-01';
const DECEMBER_REF = '2026-12';

function uniqueByEmployee(rows) {
  const byEmployee = new Map();
  for (const row of rows || []) {
    const id = Number(row.ESCFUNC_ID);
    byEmployee.set(id, byEmployee.has(id) ? null : row);
  }
  return byEmployee;
}

function buildPriorSunday({ date, employeeIds, schedules, fixedDays, absences }) {
  const scheduled = uniqueByEmployee(schedules);
  const fixed = uniqueByEmployee(fixedDays);
  const absent = new Map();
  for (const row of absences || []) {
    const id = Number(row.ESCFUNC_ID);
    const type = String(row.ID_ERP || '').toUpperCase() === 'FER' ? 'FER' : 'AFA';
    if (!absent.has(id) || type === 'FER') absent.set(id, { type, reason: row.MOTIVO });
  }
  const dias = [];
  for (const id of new Set(employeeIds.map(Number).filter(Number.isSafeInteger))) {
    const absence = absent.get(id);
    const source = scheduled.has(id) ? scheduled.get(id) : fixed.get(id);
    if (!absence && !source) continue;
    dias.push({ ESCFUNC_ID: id, DT: date,
      PROGRAMACAO: absence?.type || source.PROGRAMACAO,
      HR_ENT1: absence ? null : source.HR_ENT1,
      HR_SAI1: absence ? null : source.HR_SAI1,
      HR_ENT2: absence ? null : source.HR_ENT2,
      HR_SAI2: absence ? null : source.HR_SAI2,
      MOTIVO_AUSENCIA: absence?.reason || null });
  }
  return { data: date, dias };
}

async function loadPriorSunday(connection, { lojaId, employeeIds }) {
  const date = getOperationalPeriodIso(NOVEMBER_REF).fim;
  if (!employeeIds.length) return { data: date, dias: [] };
  const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
  const binds = { lojaId };
  const schedules = await connection.execute(
    `select p.escfunc_id, d.programacao, d.hr_ent1, d.hr_sai1, d.hr_ent2, d.hr_sai2
       from sgn_esc_prog p
       join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
      where p.loja = :lojaId and p.mes_ref = date '2026-11-01'
        and d.dt = date '2026-12-06' and nvl(p.ativa, 1) = 1
        and p.revisao = (select max(px.revisao) from sgn_esc_prog px
          where px.loja = p.loja and px.mes_ref = p.mes_ref
            and px.escfunc_id = p.escfunc_id and nvl(px.ativa, 1) = 1)`, binds, options
  );
  const fixedDays = await connection.execute(
    `select escfunc_id, programacao, hr_ent1, hr_sai1, hr_ent2, hr_sai2
       from sgn_esc_fixo_escala
      where loja = :lojaId and mes_ref = date '2026-11-01'
        and dt = date '2026-12-06' and nvl(status, 'A') = 'A'`, binds, options
  );
  const absences = await connection.execute(
    `select escfunc_id, motivo, id_erp from sgn_esc_ausencia
      where loja = :lojaId and date '2026-12-06'
        between trunc(dt_inic) and trunc(nvl(dt_fim, date '2099-12-31'))`, binds, options
  );
  return buildPriorSunday({ date, employeeIds, schedules: schedules.rows,
    fixedDays: fixedDays.rows, absences: absences.rows });
}

async function getPriorSunday({ lojaId, mesRef, employeeIds }) {
  if (String(mesRef).slice(0, 7) !== DECEMBER_REF) return null;
  return withConnection((connection) => loadPriorSunday(connection, { lojaId, employeeIds }));
}

module.exports = { getPriorSunday, loadPriorSunday, buildPriorSunday };
