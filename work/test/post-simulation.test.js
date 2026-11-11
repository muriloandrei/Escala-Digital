const test = require('node:test');
const assert = require('node:assert/strict');
const simulation = require('../src/services/postSimulationService');
const workRegimeService = require('../src/services/workRegimeService');

test('12x36 trial covers the operational month with alternating duty and rest', () => {
  const dates = simulation.periodDates('2026-12-01');
  assert.equal(dates[0], '2026-11-30');
  assert.equal(dates.at(-1), '2027-01-03');
  const rows = simulation.simulationRows({ lojaId: 700, mesRef: '2026-12-01', escsecaoId: 1,
    escfuncId: 10, anchor: '2026-11-30', hours: simulation.DEFAULT_HOURS,
    actor: { login: 'TESTE' } });
  assert.equal(rows.length, dates.length);
  assert.deepEqual(rows.slice(0, 3).map((row) => row.programacao), ['TRB', 'F', 'TRB']);
  assert.equal(rows[0].HR_ENT1, '07:00');
  assert.equal(rows[0].HR_SAI2, '19:00');
});

test('old individual regime registrations no longer affect operational schedules', async () => {
  const result = await workRegimeService.listEffective(null, { lojaId: 700, mesRef: '2026-12-01' });
  assert.equal(result.size, 0);
});

test('trial rejects regular stores and invalid 12x36 hours before writing', async () => {
  await assert.rejects(simulation.generate({ lojaId: 64, mesRef: '2026-12-01', escsecaoId: 1,
    escfuncIds: [10] }), /postos 700 a 799/);
  await assert.rejects(simulation.configureEmployee({ lojaId: 700, mesRef: '2026-12-01',
    escsecaoId: 1, escfuncId: 10, anchor: '2026-11-30', hours: {
      HR_ENT1: '07:00', HR_SAI1: '12:00', HR_ENT2: '13:00', HR_SAI2: '17:00'
    } }), /12:00/);
});
