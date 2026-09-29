const test = require('node:test');
const assert = require('node:assert/strict');
const { getMesStatus, _private } = require('../src/services/escalaService');

test('future month is scheduled', () => {
  const now = new Date();
  const future = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const value = future.getFullYear() + '-' + String(future.getMonth() + 1).padStart(2, '0') + '-01';
  assert.equal(getMesStatus(value, 1), 'AGENDADA');
});

test('draft save rejects a stale employee revision', () => {
  assert.doesNotThrow(() => _private.assertRevisaoBase({ chapa: '001', revisaoBase: 4 }, 4));
  assert.throws(
    () => _private.assertRevisaoBase({ chapa: '001', revisaoBase: 4 }, 5),
    (error) => error.statusCode === 409 && /001/.test(error.message)
  );
});
