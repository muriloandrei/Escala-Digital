const test = require('node:test');
const assert = require('node:assert/strict');
const { _private: { aplicarHorarioBaseNosDias } } = require('../src/services/escalaService');

const horario = { HR_ENT1: '09:00', HR_SAI1: '13:00', HR_ENT2: '14:10', HR_SAI2: '18:58' };
const jornada = (dt, programacao = 'TRB') => ({
  DT: dt, PROGRAMACAO: programacao,
  HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
});

test('edicao de horario-base altera somente jornadas futuras editaveis', () => {
  const atual = [
    jornada('2026-10-04'),
    jornada('2026-10-05'),
    jornada('2026-10-06'),
    jornada('2026-10-07', 'F')
  ];
  const result = aplicarHorarioBaseNosDias(atual, horario, '2026-10-05', new Set(['2026-10-06']));
  assert.equal(result.diasAlterados, 1);
  assert.equal(result.dias[0].hrEnt1, '08:00');
  assert.equal(result.dias[1].hrEnt1, '09:00');
  assert.equal(result.dias[1].hrSai2, '18:58');
  assert.equal(result.dias[2].hrEnt1, '08:00');
  assert.equal(result.dias[3].programacao, 'F');
  assert.equal(result.dias[3].hrEnt1, '08:00');
});

test('horario identico nao cria alteracao artificial', () => {
  const result = aplicarHorarioBaseNosDias([jornada('2026-10-05')], {
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  }, '2026-10-05');
  assert.equal(result.diasAlterados, 0);
  assert.equal(result.dias[0].justificativa, null);
});
