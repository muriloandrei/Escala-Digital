const test = require('node:test');
const assert = require('node:assert/strict');
const { _private } = require('../src/services/escalaService');

test('absence validation matches only the employee and covered work dates', () => {
  const trabalho = [
    { funcionario: { escfuncId: 1, chapa: '001' }, data: '2026-10-05' },
    { funcionario: { escfuncId: 1, chapa: '001' }, data: '2026-10-06' },
    { funcionario: { escfuncId: 2, chapa: '002' }, data: '2026-10-06' }
  ];
  const ausencias = [
    { ESCFUNC_ID: 1, DT_INIC: '2026-10-06', DT_FIM: '2026-10-07', MOTIVO: 'Ferias' }
  ];
  assert.deepEqual(_private.encontrarErrosAusencias(trabalho, ausencias), [
    'Funcionario 001 possui ausencia em 2026-10-06: Ferias.'
  ]);
});
