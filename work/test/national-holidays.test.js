const test = require('node:test');
const assert = require('node:assert/strict');
const { getNationalHoliday, listNationalHolidays, newHolidayRestErrors } = require('../src/domain/nationalHolidays');
const { buildFuncionarioRascunho, buildFuncionariosRascunhoBalanceado } = require('../src/services/monthlyReleaseService');

const funcionario = { ESCFUNC_ID: 10, CHAPA: '000010', NOME: 'Teste', ESCSECAO_ID: 20, ESCFUNCAO_ID: 30, LOJA: 10 };
const turno = { ESCSECAOTURNO_ID: 40, ESCSECAO_ID: 20, HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' };

test('national holiday calendar includes 12 October and 20 November across an operational month', () => {
  assert.equal(getNationalHoliday('2026-10-12').nome, 'Nossa Senhora Aparecida');
  assert.equal(getNationalHoliday('2026-10-13'), null);
  assert.deepEqual(listNationalHolidays('2026-10-05', '2026-11-01').map((item) => item.data), ['2026-10-12']);
  assert.equal(getNationalHoliday('2026-11-20').abrangencia, 'NACIONAL');
});

test('new weekly rest is blocked on holiday but existing rest and work remain editable', () => {
  const payload = [{ escfuncId: 10, nome: 'Teste', dias: [{ data: '2026-10-12', programacao: 'F' }] }];
  assert.equal(newHolidayRestErrors(payload).length, 1);
  assert.equal(newHolidayRestErrors(payload, [{ ESCFUNC_ID: 10, DT: new Date(2026, 9, 12), PROGRAMACAO: 'F' }]).length, 0);
  payload[0].dias[0].programacao = 'TRB';
  assert.equal(newHolidayRestErrors(payload).length, 0);
});

test('automatic rest generation does not use national holiday', () => {
  const draft = buildFuncionarioRascunho(funcionario, turno, '2026-10-01', '2026-10-05');
  assert.notEqual(draft.dias.find((day) => day.data === '2026-10-12')?.programacao, 'F');
  assert.ok(draft.dias.filter((day) => day.data >= '2026-10-12' && day.data <= '2026-10-18' && day.programacao === 'F').length >= 2);
  const balanced = buildFuncionariosRascunhoBalanceado([funcionario], [turno], '2026-10-01', '2026-10-05');
  assert.notEqual(balanced[0].dias.find((day) => day.data === '2026-10-12')?.programacao, 'F');
  assert.ok(balanced[0].dias.filter((day) => day.data >= '2026-10-12' && day.data <= '2026-10-18' && day.programacao === 'F').length >= 2);
});
