const test = require('node:test');
const assert = require('node:assert/strict');
const { isDutyDay, effectiveRegime } = require('../src/domain/workRegime');

test('12x36 alternates continuously across month and year boundaries', () => {
  assert.equal(isDutyDay('2026-12-30', '2026-12-30'), true);
  assert.equal(isDutyDay('2026-12-30', '2026-12-31'), false);
  assert.equal(isDutyDay('2026-12-30', '2027-01-01'), true);
  assert.equal(isDutyDay('2026-12-30', '2026-12-28'), true);
});

test('regime defaults to 5x2 and invalid dates are rejected', () => {
  assert.equal(effectiveRegime({}), '5X2');
  assert.equal(effectiveRegime({ REGIME_ESCALA: '12X36' }), '12X36');
  assert.throws(() => isDutyDay('2026-02-30', '2026-03-01'));
});
