const test = require('node:test');
const assert = require('node:assert/strict');
const { getNationalHoliday, listNationalHolidays } = require('../src/domain/nationalHolidays');
const { getCriticasCoberturaMinima } = require('../src/rules/escalaRules');
const { buildFuncionarioRascunho, buildFuncionariosRascunhoBalanceado } = require('../src/services/monthlyReleaseService');

const funcionario = { ESCFUNC_ID: 10, CHAPA: '000010', NOME: 'Teste', ESCSECAO_ID: 20, ESCFUNCAO_ID: 30, LOJA: 10 };
const turno = { ESCSECAOTURNO_ID: 40, ESCSECAO_ID: 20, HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' };

test('national holiday calendar includes 12 October and 20 November across an operational month', () => {
  assert.equal(getNationalHoliday('2026-10-12').nome, 'Nossa Senhora Aparecida');
  assert.equal(getNationalHoliday('2026-10-13'), null);
  assert.deepEqual(listNationalHolidays('2026-10-05', '2026-11-01').map((item) => item.data), ['2026-10-12']);
  assert.equal(getNationalHoliday('2026-11-20').abrangencia, 'NACIONAL');
});

test('December operational period includes Christmas and New Year', () => {
  assert.deepEqual(listNationalHolidays('2026-12-07', '2027-01-03')
    .map((item) => [item.data, item.nome]), [
      ['2026-12-25', 'Natal'],
      ['2027-01-01', 'Confraternizacao Universal']
    ]);
});

test('automatic generation adds FDO on a holiday without replacing two weekly rests', () => {
  const draft = buildFuncionarioRascunho(funcionario, turno, '2026-10-01', '2026-10-05');
  assert.equal(draft.dias.find((day) => day.data === '2026-10-12')?.programacao, 'FDO');
  assert.ok(draft.dias.filter((day) => day.data >= '2026-10-12' && day.data <= '2026-10-18' && day.programacao === 'F').length >= 2);
  const balanced = buildFuncionariosRascunhoBalanceado([funcionario], [turno], '2026-10-01', '2026-10-05');
  assert.equal(balanced[0].dias.find((day) => day.data === '2026-10-12')?.programacao, 'FDO');
  assert.ok(balanced[0].dias.filter((day) => day.data >= '2026-10-12' && day.data <= '2026-10-18' && day.programacao === 'F').length >= 2);
});

test('December generation marks Christmas and New Year as FDO', () => {
  const draft = buildFuncionarioRascunho(funcionario, turno, '2026-12-01', '2026-11-30');
  for (const date of ['2026-12-25', '2027-01-01']) {
    assert.equal(draft.dias.find((day) => day.data === date)?.programacao, 'FDO');
  }
});

test('holiday FDO does not create a false coverage warning for a closed section', () => {
  const closed = [{ dias: [{ data: '2026-12-25', programacao: 'FDO' }] }];
  assert.deepEqual(getCriticasCoberturaMinima(closed, 60, '2026-12-01'), []);
  const partlyOpen = [...closed, { dias: [{ data: '2026-12-25', programacao: 'TRB' }] }, ...closed];
  assert.equal(getCriticasCoberturaMinima(partlyOpen, 60, '2026-12-01').length, 1);
});
