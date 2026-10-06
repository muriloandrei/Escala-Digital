const test = require('node:test');
const assert = require('node:assert/strict');
const { validateQuickRestWorkEdit } = require('../src/domain/quickEdit');

const oldDay = { DT: '2026-10-12', PROGRAMACAO: 'TRB', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' };

test('quick edit accepts one rest despite weekly critiques elsewhere', () => {
  const employee = { funcao: 'OPERADOR DE CAIXA', dias: [{ data: '2026-10-12', programacao: 'F', hrEnt1: null, hrSai1: null, hrEnt2: null, hrSai2: null }] };
  assert.equal(validateQuickRestWorkEdit(employee, [oldDay]), '');
});

test('quick edit rejects protected codes, multiple changes and invalid work hours', () => {
  const rest = { DT: '2026-10-12', PROGRAMACAO: 'F' };
  const work = { data: '2026-10-12', programacao: 'TRB', hrEnt1: '08:00', hrSai1: '12:00', hrEnt2: '13:10', hrSai2: '17:58' };
  assert.equal(validateQuickRestWorkEdit({ dias: [work] }, [rest]), '');
  assert.match(validateQuickRestWorkEdit({ dias: [{ ...work, hrSai2: '18:00' }] }, [rest]), /08:48/);
  assert.match(validateQuickRestWorkEdit({ dias: [{ ...work, programacao: 'FER' }] }, [rest]), /somente/);
  assert.match(validateQuickRestWorkEdit({ dias: [work, { ...work, data: '2026-10-13' }] }, [rest]), /exatamente um dia/);
});

test('quick edit keeps apprentice shift at 05:15', () => {
  const rest = { DT: '2026-10-12', PROGRAMACAO: 'F' };
  const employee = { funcao: 'JOVEM APRENDIZ', dias: [{ data: '2026-10-12', programacao: 'TRB', hrEnt1: '08:00', hrSai1: '13:15', hrEnt2: null, hrSai2: null }] };
  assert.equal(validateQuickRestWorkEdit(employee, [rest]), '');
  employee.dias[0].hrSai1 = '14:00';
  assert.match(validateQuickRestWorkEdit(employee, [rest]), /05:15/);
});
