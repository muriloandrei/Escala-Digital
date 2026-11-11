const test = require('node:test');
const assert = require('node:assert/strict');
const { planDecemberTransfer } = require('../src/domain/decemberTransfer');
const { parseArgs } = require('../scripts/transferir-dias-dezembro-2026');

function day(DT, PROGRAMACAO = 'TRB', HR_ENT1 = '08:00') {
  return { DT, PROGRAMACAO, HR_ENT1, HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' };
}

test('transfers 30 November through 06 December from the latest November schedule', () => {
  const result = planDecemberTransfer({
    november: [{ days: [day('2026-11-30'), day('2026-12-01'), day('2026-12-06')] }],
    december: [{ days: [day('2026-12-07'), day('2027-01-03')] }],
    novemberFixes: [{ ...day('2026-12-03', 'FXF'), ESCFIXO_ID: 1 }]
  });
  assert.deepEqual(result, { action: 'TRANSFER', sourceDays: 3, fixes: 1, addDays: 3, addFixes: 1 });
});

test('blocks conflicting December days and fixed days without overwriting them', () => {
  const november = [{ days: [day('2026-12-01')] }];
  const december = [{ days: [day('2026-12-01', 'F')] }];
  assert.match(planDecemberTransfer({ november, december }).reason, /divergente em 2026-12-01/);
  assert.match(planDecemberTransfer({ november, december: [{ days: [] }],
    novemberFixes: [day('2026-12-03', 'FXF')], decemberFixes: [day('2026-12-03', 'TRB')] }).reason,
  /Fixo de dezembro divergente/);
});

test('permite preservar dezembro divergente somente com funcionario explicitamente selecionado', () => {
  const november = [{ days: [day('2026-11-30', 'F'), day('2026-12-01', 'TRB')] }];
  const december = [{ days: [day('2026-12-01', 'F')] }];
  assert.deepEqual(planDecemberTransfer({ november, december }, { preferDecember: true }), {
    action: 'TRANSFER', sourceDays: 2, fixes: 0, addDays: 1, addFixes: 0,
    preservedDecemberDays: ['2026-12-01']
  });
  assert.deepEqual(parseArgs(['--loja=52', '--escfunc=24541', '--prefer-december']), {
    loja: 52, escfuncId: 24541, preferDecember: true, all: false, apply: false, by: null
  });
  assert.equal(parseArgs(['--loja=52', '--escfunc=24541', '--prefer-december', '--apply', '--by=opc']).by, 'opc');
  assert.throws(() => parseArgs(['--loja=52', '--prefer-december']), /Use --loja/);
  assert.throws(() => parseArgs(['--all', '--escfunc=24541', '--prefer-december']), /Use --loja/);
});

test('requires a single December revision and is idempotent after the source is moved', () => {
  assert.match(planDecemberTransfer({ november: [{ days: [day('2026-12-01')] }] }).reason,
    /escala de dezembro ausente/);
  assert.deepEqual(planDecemberTransfer({ november: [{ days: [day('2026-11-29')] }],
    december: [{ days: [day('2026-11-30')] }] }),
  { action: 'UNCHANGED', sourceDays: 0, fixes: 0 });
});

test('30 November alone moves without duplicating existing December days', () => {
  const result = planDecemberTransfer({
    november: [{ days: [day('2026-11-29', 'F'), day('2026-11-30')] }],
    december: [{ days: [day('2026-12-01')] }]
  });
  assert.deepEqual(result, { action: 'TRANSFER', sourceDays: 1, fixes: 0, addDays: 1, addFixes: 0 });
});

test('blocks transfer across different employee sections', () => {
  const result = planDecemberTransfer({
    november: [{ sectionId: 11, days: [day('2026-12-01')] }],
    december: [{ sectionId: 12, days: [] }]
  });
  assert.match(result.reason, /Secao mudou/);
});

test('blocks duplicate days and conflicts across schedule and fixed sources', () => {
  assert.match(planDecemberTransfer({
    november: [{ days: [day('2026-12-01'), day('2026-12-01')] }],
    december: [{ days: [] }]
  }).reason, /Datas duplicadas em novembro/);
  assert.match(planDecemberTransfer({
    november: [{ days: [day('2026-12-01')] }],
    december: [{ days: [] }],
    decemberFixes: [day('2026-12-01', 'F')]
  }).reason, /Horario e fixo divergentes/);
  assert.match(planDecemberTransfer({
    november: [{ days: [day('2026-12-01')] }],
    december: [{ days: [day('2026-12-02', 'F')] }],
    novemberFixes: [day('2026-12-02', 'FXF')]
  }).reason, /Horario e fixo divergentes/);
});
