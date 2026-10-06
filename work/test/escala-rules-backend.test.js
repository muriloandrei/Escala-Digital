const test = require('node:test');
const assert = require('node:assert/strict');
const { validateEscalaPayload, validarCriticasEscopo, agruparCriticasPorSubsecao, getCriticasCoberturaMinima } = require('../src/rules/escalaRules');

function buildPayload(dias, funcionarioOverrides = {}) {
  return {
    lojaId: 1,
    mesRef: '2026-09-01',
    funcionarios: [{
      escfuncId: 10,
      chapa: '000010',
      nome: 'Funcionario Teste',
      dias,
      ...funcionarioOverrides
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

test('oficializacao bloqueia critica individual mas nao alerta de cobertura', () => {
  const funcionarios = [{ escfuncId: 10, nome: 'Teste', dias: [
    trabalho('2026-09-01'), trabalho('2026-09-02'), descanso('2026-09-03'),
    trabalho('2026-09-04'), trabalho('2026-09-05'), descanso('2026-09-06')
  ] }];
  assert.deepEqual(validarCriticasEscopo({ lojaId: 1, mesRef: '2026-09-01', funcionarios }), []);
  assert.ok(getCriticasCoberturaMinima(funcionarios, 60, '2026-09-01').length > 0);
  funcionarios[0].dias = Array.from({ length: 6 }, (_, index) => trabalho(`2026-09-0${index + 1}`));
  assert.ok(validarCriticasEscopo({ lojaId: 1, mesRef: '2026-09-01', funcionarios })
    .some((critica) => critica.includes('dias consecutivos')));
});

test('oficializacao identifica funcionario sem dias gerados', () => {
  const criticas = validarCriticasEscopo({ lojaId: 1, mesRef: '2026-09-01',
    funcionarios: [{ escfuncId: 10, nome: 'Teste', dias: [] }] });
  assert.match(criticas[0], /escala sem dias gerados/);
});

test('painel mostra criticas de outras subsecoes sem repetir funcionarios ou secoes inacessiveis', () => {
  const grupos = agruparCriticasPorSubsecao({
    lojaId: 10, mesRef: '2026-11-01',
    escala: {
      secoes: [{ ESCSECAO_ID: 1, DESCR: 'Frente de Caixa' }],
      funcionarios: [
        { ESCFUNC_ID: 1, NOME: 'Ana', ESCSECAO_ID: 1, ESCSUBSECAO_ID: 11, SUBSECAO_DESCR: 'Caixa' },
        { ESCFUNC_ID: 2, NOME: 'Bia', ESCSECAO_ID: 1, ESCSUBSECAO_ID: 11, SUBSECAO_DESCR: 'Caixa' },
        { ESCFUNC_ID: 3, NOME: 'Caio', ESCSECAO_ID: 1, ESCSUBSECAO_ID: 12, SUBSECAO_DESCR: 'Aprendiz' },
        { ESCFUNC_ID: 4, NOME: 'Fora', ESCSECAO_ID: 2, ESCSUBSECAO_ID: 21 }
      ],
      dias: []
    }
  });
  assert.equal(grupos.length, 2);
  assert.deepEqual(grupos.map((grupo) => grupo.subsecao), ['Caixa', 'Aprendiz']);
  assert.equal(grupos[0].criticas.length, 2);
  assert.equal(grupos[1].criticas.length, 1);
  assert.ok(grupos.every((grupo) => grupo.secao === 'Frente de Caixa'));
  assert.deepEqual(grupos[0].marcadores.map((marker) => marker.escfuncId), [1, 2]);
  assert.ok(grupos[0].marcadores.every((marker) => marker.datas.length === 0));
});

test('criticas marcam dia invalido e todos os dias da semana com falta de folga', () => {
  const dias = Array.from({ length: 7 }, (_, index) => ({
    ESCFUNC_ID: 1,
    DT: `2026-11-0${index + 2}`,
    PROGRAMACAO: 'TRB',
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  }));
  dias[0].HR_ENT2 = null;
  const [grupo] = agruparCriticasPorSubsecao({ escala: {
    secoes: [{ ESCSECAO_ID: 1, DESCR: 'Frente de Caixa' }],
    funcionarios: [{ ESCFUNC_ID: 1, NOME: 'Ana', ESCSECAO_ID: 1, ESCSUBSECAO_ID: 11, SUBSECAO_DESCR: 'Caixa' }],
    dias
  } });
  assert.ok(grupo.marcadores.some((marker) => marker.mensagem.includes('horario incompleto') && marker.datas.join() === '2026-11-02'));
  assert.ok(grupo.marcadores.some((marker) => marker.mensagem.includes('minimo esperado') && marker.datas.length === 7));
  assert.deepEqual(grupo.criticas, validarCriticasEscopo({ lojaId: 10, mesRef: '2026-11-01', funcionarios: [{ escfuncId: 1, nome: 'Ana', dias }] }));
});

test('criticas calculam semanas com datas Oracle sem produzir NaN', () => {
  const dias = [
    descanso(new Date(2026, 10, 2)),
    descanso(new Date(2026, 10, 3)),
    descanso(new Date(2026, 10, 4))
  ];
  const criticas = validarCriticasEscopo({ lojaId: 10, mesRef: '2026-11-01',
    funcionarios: [{ escfuncId: 10, nome: 'Teste', dias }] });
  assert.ok(criticas.some((critica) => critica.includes('2026-11-02')));
  assert.ok(criticas.every((critica) => !critica.includes('NaN')));
});

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

test('backend allows a proportional 5x2 week with enough rests', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01'),
    trabalho('2026-09-02'),
    descanso('2026-09-03'),
    trabalho('2026-09-04'),
    trabalho('2026-09-05'),
    descanso('2026-09-06')
  ]));

  assert.deepEqual(errors, []);
});

test('backend allows consecutive rests created manually', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01'),
    descanso('2026-09-02'),
    descanso('2026-09-03'),
    trabalho('2026-09-04')
  ]));

  assert.deepEqual(errors, []);
});

test('backend rejects more than two weekly rests counting Sunday', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01'),
    descanso('2026-09-02'),
    descanso('2026-09-04'),
    descanso('2026-09-06')
  ]));

  assert.ok(errors.some((error) => error.includes('folgas na semana')));
});

test('backend allows up to three manual rests immediately after vacation', () => {
  const errors = validateEscalaPayload(buildPayload([
    descanso('2026-09-01', 'FER'),
    descanso('2026-09-02', 'FER'),
    descanso('2026-09-03', 'FER'),
    descanso('2026-09-04'),
    descanso('2026-09-05'),
    descanso('2026-09-06'),
    trabalho('2026-09-07')
  ]));

  assert.equal(errors.some((error) => error.includes('folgas na semana')), false);
});

test('backend does not criticize weekly rest limit for fixed manual rests', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01'),
    descanso('2026-09-02', 'FXF'),
    descanso('2026-09-04', 'FXF'),
    descanso('2026-09-06', 'FXF')
  ]));

  assert.deepEqual(errors, []);
});

test('backend treats vacation in the week as enough weekly 5x2 rest', () => {
  const errors = validateEscalaPayload(buildPayload([
    descanso('2026-09-01', 'FER'),
    trabalho('2026-09-02'),
    trabalho('2026-09-03'),
    trabalho('2026-09-04'),
    trabalho('2026-09-05'),
    trabalho('2026-09-06')
  ]));

  assert.equal(errors.some((error) => error.includes('minimo esperado no 5x2')), false);
});

test('backend allows Sunday rest plus one more rest in same week', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01'),
    trabalho('2026-09-02'),
    descanso('2026-09-04'),
    descanso('2026-09-06')
  ]));

  assert.deepEqual(errors, []);
});

test('backend rejects 5x2 week with fewer than two proportional rests', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01'),
    trabalho('2026-09-02'),
    trabalho('2026-09-03'),
    trabalho('2026-09-04'),
    trabalho('2026-09-05'),
    descanso('2026-09-06'),
    trabalho('2026-09-07')
  ]));

  assert.ok(errors.some((error) => error.includes('minimo esperado no 5x2')));
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

test('backend validates apprentice with fixed 05:15 first period only', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01', { hrSai1: '13:15', hrEnt2: '00:00', hrSai2: '00:00' })
  ], { funcao: 'JOVEM APRENDIZ', aprendiz: true }));

  assert.deepEqual(errors, []);
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
