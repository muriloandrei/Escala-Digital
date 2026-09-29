const test = require('node:test');
const assert = require('node:assert/strict');

const { _private } = require('../src/services/escalaService');

test('reconciliacao RM adiciona folga confirmada sem apagar folga local', () => {
  const atual = [
    { DT: '2026-08-14', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58', PROGRAMACAO: 'TRB' },
    { DT: '2026-08-15', HR_ENT1: 'F', HR_SAI1: 'F', HR_ENT2: 'F', HR_SAI2: 'F', PROGRAMACAO: 'F' },
    { DT: '2026-08-16', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58', PROGRAMACAO: 'TRB' }
  ];

  const result = _private.montarDiasReconciliadosRm(atual, ['2026-08-14'], { inicio: '2026-08-10', fim: '2026-08-16' });

  assert.equal(result.alteracoes.length, 1);
  assert.deepEqual(result.dias.map((dia) => dia.programacao), ['F', 'F', 'TRB']);
  assert.equal(result.dias[1].hrEnt1, null);
});

test('reconciliacao RM preserva dias fora da consulta e ausencias protegidas', () => {
  const atual = [
    { DT: '2026-10-04', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58', PROGRAMACAO: 'TRB' },
    { DT: '2026-10-05', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58', PROGRAMACAO: 'TRB' },
    { DT: '2026-10-06', PROGRAMACAO: 'FER' },
    { DT: '2026-11-01', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58', PROGRAMACAO: 'TRB' },
    { DT: '2026-11-02', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58', PROGRAMACAO: 'TRB' }
  ];
  const result = _private.montarDiasReconciliadosRm(
    atual,
    ['2026-10-04', '2026-10-05', '2026-10-06', '2026-11-01', '2026-11-02'],
    { inicio: '2026-10-05', fim: '2026-11-01' }
  );

  assert.deepEqual(result.dias.map((dia) => dia.programacao), ['TRB', 'F', 'FER', 'F', 'TRB']);
  assert.deepEqual(result.alteracoes.map((item) => item.data), ['2026-10-05', '2026-11-01']);
});

test('detecta alteracao manual em dia bloqueado', () => {
  const atual = [
    { DT: '2026-08-12', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58', PROGRAMACAO: 'TRB' },
    { DT: '2026-08-14', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58', PROGRAMACAO: 'TRB' }
  ];
  const novo = [
    { data: '2026-08-12', hrEnt1: null, hrSai1: null, hrEnt2: null, hrSai2: null, programacao: 'F' },
    { data: '2026-08-14', hrEnt1: null, hrSai1: null, hrEnt2: null, hrSai2: null, programacao: 'F' }
  ];

  assert.deepEqual(_private.getAlteracoesDiasBloqueados(atual, novo, '2026-08-13'), ['2026-08-12']);
});
