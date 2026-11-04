const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPriorSunday, buildPriorSunday } = require('../src/services/previousSundayService');

test('previous Sunday uses November active schedule and only current visible employees', async () => {
  const queries = [];
  const connection = { async execute(sql, binds) {
    queries.push({ sql, binds });
    if (queries.length === 1) return { rows: [
      { ESCFUNC_ID: 1, PROGRAMACAO: 'TRB', HR_ENT1: '08:00' },
      { ESCFUNC_ID: 2, PROGRAMACAO: 'F' },
      { ESCFUNC_ID: 99, PROGRAMACAO: 'TRB' }
    ] };
    if (queries.length === 2) return { rows: [
      { ESCFUNC_ID: 3, PROGRAMACAO: 'FXF' }
    ] };
    return { rows: [
      { ESCFUNC_ID: 4, ID_ERP: 'AFA', MOTIVO: 'AFASTAMENTO' },
      { ESCFUNC_ID: 2, ID_ERP: 'FER', MOTIVO: 'FERIAS' }
    ] };
  } };
  const result = await loadPriorSunday(connection, { lojaId: 35, employeeIds: [1, 2, 3, 4, 5] });
  assert.equal(result.data, '2026-12-06');
  assert.deepEqual(result.dias.map((day) => [day.ESCFUNC_ID, day.PROGRAMACAO]),
    [[1, 'TRB'], [2, 'FER'], [3, 'FXF'], [4, 'AFA']]);
  assert.equal(result.dias[0].HR_ENT1, '08:00');
  assert.equal(result.dias[1].HR_ENT1, null);
  assert.equal(queries.length, 3);
  assert.ok(queries.every(({ binds }) => binds.lojaId === 35));
  assert.match(queries[0].sql, /nvl\(p\.ativa, 1\) = 1/);
  assert.match(queries[0].sql, /max\(px\.revisao\)/);
});

test('ambiguous prior Sunday is not presented as a definite shift', () => {
  const result = buildPriorSunday({ date: '2026-12-06', employeeIds: [1],
    schedules: [{ ESCFUNC_ID: 1, PROGRAMACAO: 'TRB' }, { ESCFUNC_ID: 1, PROGRAMACAO: 'F' }],
    fixedDays: [{ ESCFUNC_ID: 1, PROGRAMACAO: 'FXF' }], absences: [] });
  assert.deepEqual(result.dias, []);
});
