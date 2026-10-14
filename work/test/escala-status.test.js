const test = require('node:test');
const assert = require('node:assert/strict');
const { getMesStatus, _private } = require('../src/services/escalaService');

test('future month is scheduled', () => {
  const now = new Date();
  const future = new Date(Math.max(new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime(), new Date(2026, 10, 1).getTime()));
  const value = future.getFullYear() + '-' + String(future.getMonth() + 1).padStart(2, '0') + '-01';
  assert.equal(getMesStatus(value, 1), 'AGENDADA');
});

test('September and October 2026 are finalized before November planning', () => {
  assert.equal(getMesStatus('2026-09-01', 0), 'FINALIZADA');
  assert.equal(getMesStatus('2026-10-01', 1), 'FINALIZADA');
});

test('draft save rejects a stale employee revision', () => {
  assert.doesNotThrow(() => _private.assertRevisaoBase({ chapa: '001', revisaoBase: 4 }, 4));
  assert.throws(
    () => _private.assertRevisaoBase({ chapa: '001', revisaoBase: 4 }, 5),
    (error) => error.statusCode === 409 && /001/.test(error.message)
  );
  assert.throws(
    () => _private.assertRevisaoBase({ chapa: '001' }, 5),
    (error) => error.statusCode === 409 && /001/.test(error.message)
  );
});
