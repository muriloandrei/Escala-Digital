const test = require('node:test');
const assert = require('node:assert/strict');
const { getNationalHoliday, listNationalHolidays } = require('../src/domain/nationalHolidays');
const { buildFuncionarioRascunho, buildFuncionariosRascunhoBalanceado } = require('../src/services/monthlyReleaseService');

const funcionario = { ESCFUNC_ID: 10, CHAPA: '000010', NOME: 'Teste', ESCSECAO_ID: 20, ESCFUNCAO_ID: 30, LOJA: 10 };
const turno = { ESCSECAOTURNO_ID: 40, ESCSECAO_ID: 20, HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' };

test('national holiday calendar includes 12 October and 20 November across an operational month', () => {
  assert.equal(getNationalHoliday('2026-10-12').nome, 'Nossa Senhora Aparecida');
  assert.equal(getNationalHoliday('2026-10-13'), null);
  assert.deepEqual(listNationalHolidays('2026-10-05', '2026-11-01').map((item) => item.data), ['2026-10-12']);
  assert.equal(getNationalHoliday('2026-11-20').abrangencia, 'NACIONAL');
});

test('automatic rest generation may place a rest on a national holiday', () => {
  const draft = buildFuncionarioRascunho(funcionario, turno, '2026-10-01', '2026-10-05');
  assert.equal(draft.dias.find((day) => day.data === '2026-10-12')?.programacao, 'F');
  assert.ok(draft.dias.filter((day) => day.data >= '2026-10-12' && day.data <= '2026-10-18' && day.programacao === 'F').length >= 2);
  const balanced = buildFuncionariosRascunhoBalanceado([funcionario], [turno], '2026-10-01', '2026-10-05');
  assert.ok(['F', 'TRB'].includes(balanced[0].dias.find((day) => day.data === '2026-10-12')?.programacao));
  assert.ok(balanced[0].dias.filter((day) => day.data >= '2026-10-12' && day.data <= '2026-10-18' && day.programacao === 'F').length >= 2);
});
