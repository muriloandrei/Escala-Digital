const assert = require('node:assert/strict');
const test = require('node:test');
const { getOperationalPeriodIso } = require('../src/domain/operationalPeriod');

test('operational months use complete Monday-to-Sunday weeks', () => {
  assert.deepEqual(getOperationalPeriodIso('2026-09-01'), { inicio: '2026-09-07', fim: '2026-10-04' });
  assert.deepEqual(getOperationalPeriodIso('2026-10-01'), { inicio: '2026-10-05', fim: '2026-11-01' });
  assert.deepEqual(getOperationalPeriodIso('2026-12-01'), { inicio: '2026-12-07', fim: '2027-01-03' });
  assert.deepEqual(getOperationalPeriodIso('2027-01-01'), { inicio: '2027-01-04', fim: '2027-01-31' });
});

test('invalid operational month is rejected', () => {
  assert.throws(() => getOperationalPeriodIso('2026-13-01'));
});
