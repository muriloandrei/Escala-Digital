const test = require('node:test');
const assert = require('node:assert/strict');
const { previousMonth, projectFixedDays } = require('../src/domain/fixedCarry');

test('repeats the latest weekly fixed pattern into the next operational period', () => {
  assert.equal(previousMonth('2026-12-01'), '2026-11-01');
  const projected = projectFixedDays({
    mesRef: '2026-12-01', todayIso: '2026-11-09',
    previousRows: [
      { escfuncId: 1, escsecaoId: 20, date: '2026-11-02', programacao: 'TRB', hrEnt1: '08:00' },
      { escfuncId: 1, escsecaoId: 20, date: '2026-11-23', programacao: 'FXF' },
      { escfuncId: 1, escsecaoId: 20, date: '2026-11-29', programacao: 'TRB', hrEnt1: '10:00' }
    ],
    existingRows: [{ escfuncId: 1, date: '2026-12-14', programacao: 'TRB' }]
  });
  assert.deepEqual(projected.filter((row) => row.programacao === 'FXF').map((row) => row.date),
    ['2026-11-30', '2026-12-07', '2026-12-21', '2026-12-28']);
  assert.deepEqual(projected.filter((row) => row.hrEnt1 === '10:00').map((row) => row.date),
    ['2026-12-06', '2026-12-13', '2026-12-20', '2026-12-27', '2027-01-03']);
  assert.equal(projected.some((row) => row.hrEnt1 === '08:00'), false);
});

test('does not copy a fixed day outside the prior operational period or into the past', () => {
  const projected = projectFixedDays({ mesRef: '2026-12-01', todayIso: '2026-12-21',
    previousRows: [
      { escfuncId: 1, date: '2026-10-31', programacao: 'FXF' },
      { escfuncId: 1, date: '2026-11-25', programacao: 'FXF' }
    ] });
  assert.deepEqual(projected.map((row) => row.date), ['2026-12-23', '2026-12-30']);
});
