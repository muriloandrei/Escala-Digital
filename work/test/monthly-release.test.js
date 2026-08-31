const test = require('node:test');
const assert = require('node:assert/strict');
const { buildFuncionarioRascunho, buildFuncionariosRascunhoBalanceado } = require('../src/services/monthlyReleaseService');
const { _private } = require('../src/services/escalaService');
const { validateEscalaPayload } = require('../src/rules/escalaRules');

test('monthly release builds draft only from today onward', () => {
  const funcionario = {
    ESCFUNC_ID: 10,
    CHAPA: '000010',
    NOME: 'Funcionario Teste',
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30
  };
  const turno = {
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  };

  const rascunho = buildFuncionarioRascunho(funcionario, turno, '2026-08-01', '2026-08-15');

  assert.equal(rascunho.escfuncId, 10);
  assert.equal(rascunho.escsecaoTurnoId, 40);
  assert.equal(rascunho.dias[0].data, '2026-08-15');
  assert.equal(rascunho.dias.at(-1).data, '2026-08-31');
  assert.equal(rascunho.dias.some((dia) => dia.programacao === 'F'), true);
  assert.equal(rascunho.dias.some((dia) => dia.programacao === 'TRB'), true);
});

test('monthly release distributes 5x2 rests without consecutive Sunday work', () => {
  const funcionario = {
    ESCFUNC_ID: 11,
    CHAPA: '000011',
    NOME: 'Funcionario 5x2',
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30
  };
  const turno = {
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  };

  const rascunho = buildFuncionarioRascunho(funcionario, turno, '2026-09-01', '2026-09-01', 0);
  const errors = validateEscalaPayload({
    lojaId: 10,
    mesRef: '2026-09-01',
    funcionarios: [rascunho]
  });

  assert.deepEqual(errors, []);
  assert.equal(rascunho.dias.filter((dia) => dia.programacao === 'F').length >= 8, true);
});

test('monthly release balances rests between employees in the same section and shift', () => {
  const funcionarios = Array.from({ length: 6 }, (_, index) => ({
    ESCFUNC_ID: 100 + index,
    CHAPA: `01010${index}`,
    NOME: `Funcionario ${index + 1}`,
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }));
  const turnos = [{
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];

  const rascunhos = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-01');
  const errors = validateEscalaPayload({
    lojaId: 10,
    mesRef: '2026-09-01',
    funcionarios: rascunhos
  });
  const folgasPorDia = new Map();
  rascunhos.forEach((funcionario) => {
    funcionario.dias
      .filter((dia) => dia.programacao === 'F')
      .forEach((dia) => folgasPorDia.set(dia.data, (folgasPorDia.get(dia.data) || 0) + 1));
  });

  assert.deepEqual(errors, []);
  assert.equal(Math.max(...folgasPorDia.values()) < funcionarios.length, true);
  assert.equal(new Set([...folgasPorDia.values()]).size > 1, true);
});

test('monthly release separates balance by section and shift', () => {
  const funcionarios = [
    { ESCFUNC_ID: 1, CHAPA: 'A1', NOME: 'A1', LOJA: 10, ESCSECAO_ID: 20, ESCFUNCAO_ID: 1, HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' },
    { ESCFUNC_ID: 2, CHAPA: 'A2', NOME: 'A2', LOJA: 10, ESCSECAO_ID: 20, ESCFUNCAO_ID: 1, HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' },
    { ESCFUNC_ID: 3, CHAPA: 'B1', NOME: 'B1', LOJA: 10, ESCSECAO_ID: 20, ESCFUNCAO_ID: 1, HR_ENT1: '10:00', HR_SAI1: '14:00', HR_ENT2: '15:10', HR_SAI2: '19:58' },
    { ESCFUNC_ID: 4, CHAPA: 'B2', NOME: 'B2', LOJA: 10, ESCSECAO_ID: 20, ESCFUNCAO_ID: 1, HR_ENT1: '10:00', HR_SAI1: '14:00', HR_ENT2: '15:10', HR_SAI2: '19:58' }
  ];
  const turnos = [
    { ESCSECAOTURNO_ID: 40, ESCSECAO_ID: 20, HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' },
    { ESCSECAOTURNO_ID: 41, ESCSECAO_ID: 20, HR_ENT1: '10:00', HR_SAI1: '14:00', HR_ENT2: '15:10', HR_SAI2: '19:58' }
  ];

  const rascunhos = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-01');

  assert.deepEqual(rascunhos.map((item) => item.escsecaoTurnoId).sort(), [40, 40, 41, 41]);
});

test('date lock blocks only previous days, not current day', () => {
  assert.equal(_private.isDiaBloqueadoParaEdicao('2026-08-14', '2026-08-15'), true);
  assert.equal(_private.isDiaBloqueadoParaEdicao('2026-08-15', '2026-08-15'), false);
  assert.equal(_private.isDiaBloqueadoParaEdicao('2026-08-16', '2026-08-15'), false);
});
