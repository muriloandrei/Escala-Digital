const test = require('node:test');
const assert = require('node:assert/strict');
const { validateEscalaPayload } = require('../src/rules/escalaRules');

function buildPayload(dias) {
  return {
    lojaId: 1,
    mesRef: '2026-09-01',
    funcionarios: [{
      escfuncId: 10,
      chapa: '000010',
      nome: 'Funcionario Teste',
      dias
    }]
  };
}

function trabalho(data, overrides = {}) {
  return {
    data,
    hrEnt1: '08:00',
    hrSai1: '12:00',
    hrEnt2: '13:10',
    hrSai2: '17:58',
    programacao: 'TRB',
    ...overrides
  };
}

function descanso(data, programacao = 'F') {
  return {
    data,
    hrEnt1: null,
    hrSai1: null,
    hrEnt2: null,
    hrSai2: null,
    programacao
  };
}

test('backend rejects two consecutive worked Sundays', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-06'),
    trabalho('2026-09-13')
  ]));

  assert.ok(errors.some((error) => error.includes('dois domingos consecutivos')));
});

test('backend rejects interjornada lower than 11 hours', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01', { hrEnt1: '12:00', hrSai1: '16:00', hrEnt2: '17:10', hrSai2: '21:58' }),
    trabalho('2026-09-02', { hrEnt1: '06:00', hrSai1: '10:00', hrEnt2: '11:10', hrSai2: '15:58' })
  ]));

  assert.ok(errors.some((error) => error.includes('interjornada menor que 11h')));
});

test('backend rejects more than five consecutive worked days in 5x2', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01'),
    trabalho('2026-09-02'),
    trabalho('2026-09-03'),
    trabalho('2026-09-04'),
    trabalho('2026-09-05'),
    trabalho('2026-09-06')
  ]));

  assert.ok(errors.some((error) => error.includes('dias consecutivos')));
});

test('backend allows five consecutive worked days followed by rest', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01'),
    trabalho('2026-09-02'),
    trabalho('2026-09-03'),
    trabalho('2026-09-04'),
    trabalho('2026-09-05'),
    descanso('2026-09-06')
  ]));

  assert.deepEqual(errors, []);
});

test('backend rejects rest lower than 35 hours after day off', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01', { hrEnt1: '12:00', hrSai1: '16:00', hrEnt2: '17:10', hrSai2: '21:58' }),
    descanso('2026-09-02'),
    trabalho('2026-09-03', { hrEnt1: '07:00', hrSai1: '11:00', hrEnt2: '12:10', hrSai2: '16:58' })
  ]));

  assert.ok(errors.some((error) => error.includes('descanso apos folga menor que 35h')));
});

test('backend rejects total journey different from 08:48', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01', { hrSai2: '17:30' })
  ]));

  assert.ok(errors.some((error) => error.includes('jornada total deve ser 08:48')));
});

test('backend rejects continuous period greater than 06:00', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01', { hrEnt1: '06:00', hrSai1: '12:30', hrEnt2: '13:40', hrSai2: '16:58' })
  ]));

  assert.ok(errors.some((error) => error.includes('jornada continua maior que 06:00')));
});

test('backend allows continuous period exactly equal to 06:00', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01', { hrEnt1: '06:00', hrSai1: '12:00', hrEnt2: '13:10', hrSai2: '15:58' })
  ]));

  assert.deepEqual(errors, []);
});

test('backend treats vacation and custom absence as rest days', () => {
  const errors = validateEscalaPayload(buildPayload([
    descanso('2026-09-01', 'FER'),
    descanso('2026-09-02', 'AFA'),
    trabalho('2026-09-03')
  ]));

  assert.deepEqual(errors, []);
});
