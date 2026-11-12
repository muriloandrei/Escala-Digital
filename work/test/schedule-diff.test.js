const test = require('node:test');
const assert = require('node:assert/strict');
const { buildDiaAlteracoes } = require('../src/utils/scheduleDiff');

test('schedule diff returns only days changed with previous and new values', () => {
  const previous = [
    {
      DT: new Date('2026-09-01T00:00:00'),
      HR_ENT1: '08:00',
      HR_SAI1: '12:00',
      HR_ENT2: '13:10',
      HR_SAI2: '17:58',
      PROGRAMACAO: 'TRB'
    },
    {
      DT: new Date('2026-09-02T00:00:00'),
      HR_ENT1: '08:00',
      HR_SAI1: '12:00',
      HR_ENT2: '13:10',
      HR_SAI2: '17:58',
      PROGRAMACAO: 'TRB'
    }
  ];
  const current = [
    {
      data: '2026-09-01',
      hrEnt1: '08:00',
      hrSai1: '12:00',
      hrEnt2: '13:10',
      hrSai2: '17:58',
      programacao: 'TRB'
    },
    {
      data: '2026-09-02',
      hrEnt1: null,
      hrSai1: null,
      hrEnt2: null,
      hrSai2: null,
      programacao: 'F',
      justificativa: 'Troca de folga'
    }
  ];

  assert.deepEqual(buildDiaAlteracoes(previous, current), [
    {
      data: '2026-09-02',
      anterior: {
        hrEnt1: '08:00',
        hrSai1: '12:00',
        hrEnt2: '13:10',
        hrSai2: '17:58',
        programacao: 'TRB'
      },
      novo: {
        hrEnt1: null,
        hrSai1: null,
        hrEnt2: null,
        hrSai2: null,
        programacao: 'F'
      },
      justificativa: 'Troca de folga'
    }
  ]);
});

test('schedule diff treats a new day as an inserted change', () => {
  const changes = buildDiaAlteracoes([], [{
    data: '2026-09-03',
    hrEnt1: '07:20',
    hrSai1: '12:00',
    hrEnt2: '13:10',
    hrSai2: '18:18',
    programacao: 'TRB'
  }]);

  assert.equal(changes.length, 1);
  assert.equal(changes[0].data, '2026-09-03');
  assert.equal(changes[0].anterior, null);
  assert.equal(changes[0].novo.hrEnt1, '07:20');
});

test('changing only the selected shift profile is recorded', () => {
  const previous = [{ DT: new Date('2026-09-03T00:00:00'), PROGRAMACAO: 'TRB',
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:40', HR_SAI2: '18:28',
    JORNADA_MINUTOS: 528, INTERVALO_MINUTOS: 70 }];
  const next = [{ data: '2026-09-03', programacao: 'TRB', hrEnt1: '08:00', hrSai1: '12:00',
    hrEnt2: '13:40', hrSai2: '18:28', jornadaMinutos: 528, intervaloMinutos: 100 }];
  const changes = buildDiaAlteracoes(previous, next);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].anterior.intervaloMinutos, 70);
  assert.equal(changes[0].novo.intervaloMinutos, 100);
});
