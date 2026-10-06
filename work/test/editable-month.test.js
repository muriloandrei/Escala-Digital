const test = require('node:test');
const assert = require('node:assert/strict');
const { currentMonth, isEditableMonth } = require('../src/domain/editableMonth');

test('horario-base bloqueia meses anteriores no fuso da loja', () => {
  const now = new Date('2026-10-01T02:30:00Z');
  assert.equal(currentMonth(now), '2026-09');
  assert.equal(isEditableMonth('2026-08-01', now), false);
  assert.equal(isEditableMonth('2026-09-01', now), true);
  assert.equal(isEditableMonth('2026-10-01', now), true);
  assert.equal(isEditableMonth('2026-10-02', now), false);
});
