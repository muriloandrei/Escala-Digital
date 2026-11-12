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

test('dezembro respeita descanso dominical do ultimo domingo de novembro', () => {
  const funcionarios = [{ escfuncId: 10, nome: 'Teste', dias: [
    descanso('2026-12-01'), trabalho('2026-12-02'), trabalho('2026-12-03'),
    descanso('2026-12-04'), trabalho('2026-12-05'), trabalho('2026-12-06')
  ] }];
  const domingoAnteriorPorFuncionario = new Map([[10,
    { DT: '2026-11-29', PROGRAMACAO: 'TRB' }]]);
  assert.ok(validarCriticasEscopo({ lojaId: 1, mesRef: '2026-12-01', funcionarios,
    domingoAnteriorPorFuncionario }).some((item) => item.includes('dois domingos consecutivos')));
  domingoAnteriorPorFuncionario.set(10, { DT: '2026-11-29', PROGRAMACAO: 'F' });
  assert.equal(validarCriticasEscopo({ lojaId: 1, mesRef: '2026-12-01', funcionarios,
    domingoAnteriorPorFuncionario }).some((item) => item.includes('dois domingos consecutivos')), false);
});

test('12x36 follows its anchor without applying 5x2 weekly rest rules', () => {
  const shift = (data) => trabalho(data, { hrEnt1: '07:00', hrSai1: '12:30', hrEnt2: '13:30', hrSai2: '19:00' });
  const dias = [shift('2026-12-01'), descanso('2026-12-02'), shift('2026-12-03'),
    descanso('2026-12-04'), shift('2026-12-05'), descanso('2026-12-06')];
  const funcionario = { escfuncId: 10, nome: 'Plantao', regimeEscala: '12X36',
    dtAncora12x36: '2026-12-01', dias };
  assert.deepEqual(validarCriticasEscopo({ lojaId: 700, mesRef: '2026-12-01',
    funcionarios: [funcionario] }), []);
  dias[1] = shift('2026-12-02');
  assert.ok(validarCriticasEscopo({ lojaId: 700, mesRef: '2026-12-01',
    funcionarios: [funcionario] }).some((item) => item.includes('descanso 12x36 esperado')));
});

test('08h24 post shift is rejected outside post stores', () => {
  const day = trabalho('2026-09-01', { hrEnt1: '07:00', hrSai1: '11:30',
    hrEnt2: '13:10', hrSai2: '17:04', jornadaMinutos: 504, intervaloMinutos: 100 });
  const employee = { escfuncId: 10, nome: 'Posto', dias: [day] };
  assert.deepEqual(validarCriticasEscopo({ lojaId: 700, mesRef: '2026-09-01', funcionarios: [employee] }), []);
  assert.match(validarCriticasEscopo({ lojaId: 35, mesRef: '2026-09-01', funcionarios: [employee] }).join(' '), /jornada selecionada invalida/);
  const unchanged = { ...day, jornadaMinutos: null, intervaloMinutos: null };
  assert.match(validarCriticasEscopo({ lojaId: 700, mesRef: '2026-09-01',
    funcionarios: [{ ...employee, dias: [unchanged] }] }).join(' '), /jornada total deve ser 08:48/);
});

test('selected 08h48 with 01h40 interval is valid only for posts', () => {
  const day = trabalho('2026-09-01', { hrEnt1: '08:00', hrSai1: '12:00',
    hrEnt2: '13:40', hrSai2: '18:28', jornadaMinutos: 528, intervaloMinutos: 100 });
  const employee = { escfuncId: 10, nome: 'Posto', dias: [day] };
  assert.deepEqual(validarCriticasEscopo({ lojaId: 701, mesRef: '2026-09-01', funcionarios: [employee] }), []);
  assert.match(validarCriticasEscopo({ lojaId: 35, mesRef: '2026-09-01', funcionarios: [employee] }).join(' '), /jornada selecionada invalida/);
});

test('FDO pode coexistir com duas folgas semanais sem contar como terceira folga', () => {
  const dias = [
    descanso('2026-09-07', 'FDO'), trabalho('2026-09-08'), descanso('2026-09-09'),
    trabalho('2026-09-10'), descanso('2026-09-11'), trabalho('2026-09-12'), trabalho('2026-09-13')
  ];
  const criticas = validateEscalaPayload(buildPayload(dias));
  assert.equal(criticas.some((item) => item.includes('possui 3 folgas')), false);
  dias[0] = descanso('2026-09-07');
  assert.equal(validateEscalaPayload(buildPayload(dias)).some((item) => item.includes('possui 3 folgas')), true);
});

test('FDO nao substitui uma das duas folgas semanais', () => {
  const dias = [
    descanso('2026-09-07', 'FDO'), trabalho('2026-09-08'), descanso('2026-09-09'),
    trabalho('2026-09-10'), trabalho('2026-09-11'), trabalho('2026-09-12'), trabalho('2026-09-13')
  ];
  assert.equal(validateEscalaPayload(buildPayload(dias)).some((item) => item.includes('minimo esperado no 5x2')), true);
  dias[4] = descanso('2026-09-11');
  assert.equal(validateEscalaPayload(buildPayload(dias)).some((item) => item.includes('minimo esperado no 5x2')), false);
});

test('regra parametrizada exige seis horas e intervalo de 1h10 no domingo', () => {
  const domingo = trabalho('2026-09-13', { hrEnt1: '08:00', hrSai1: '11:00', hrEnt2: '12:10', hrSai2: '15:10' });
  assert.equal(validateEscalaPayload(buildPayload([domingo]), { domingo6h: true }).some((item) => item.includes('jornada total')), false);
  assert.equal(validateEscalaPayload(buildPayload([domingo]), { domingo6h: false }).some((item) => item.includes('jornada total')), true);
  const intervaloLongo = { ...domingo, hrEnt2: '12:20', hrSai2: '15:20' };
  assert.equal(validateEscalaPayload(buildPayload([intervaloLongo]), { domingo6h: true }).some((item) => item.includes('intervalo')), true);
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

test('painel nao cria critica de cobertura para domingos da subsecao', () => {
  const funcionarios = ['Fiscal A', 'Fiscal B', 'Aprendiz', 'Fiscal em ferias', 'Fiscal afastado']
    .map((nome, index) => ({
      ESCFUNC_ID: index + 1,
      NOME: nome,
      FUNCAO_DESCR: nome === 'Aprendiz' ? 'APRENDIZ' : 'FISCAL DE CAIXA',
      ESCSECAO_ID: 1,
      ESCSUBSECAO_ID: 11,
      SUBSECAO_DESCR: 'Fiscal Caixa'
    }));
  const dias = funcionarios.map((funcionario, index) => ({
    ESCFUNC_ID: funcionario.ESCFUNC_ID,
    DT: '2026-11-08',
    PROGRAMACAO: index === 3 ? 'FER' : index === 4 ? 'AFA' : 'F'
  }));
  assert.deepEqual(agruparCriticasPorSubsecao({ escala: {
    secoes: [{ ESCSECAO_ID: 1, DESCR: 'Frente de Caixa' }], funcionarios, dias
  } }), []);
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

test('November 1 is a standalone week without two mandatory rests, but keeps Sunday 1x1', () => {
  assert.deepEqual(validateEscalaPayload(buildPayload([trabalho('2026-11-01')])), []);
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-11-01'), trabalho('2026-11-08')
  ]));
  assert.ok(errors.some((error) => error.includes('dois domingos consecutivos')));
  assert.ok(errors.every((error) => !error.includes('minimo esperado no 5x2')));
});

test('backend rejects interjornada lower than 11 hours', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01', { hrEnt1: '12:00', hrSai1: '16:00', hrEnt2: '17:10', hrSai2: '21:58' }),
    trabalho('2026-09-02', { hrEnt1: '06:00', hrSai1: '10:00', hrEnt2: '11:10', hrSai2: '15:58' })
  ]));

  assert.ok(errors.some((error) => error.includes('interjornada menor que 11h')));
});

test('night shift is valid but next morning must respect 11 hours after its exit', () => {
  const night = trabalho('2026-09-01', { hrEnt1: '20:00', hrSai1: '00:00', hrEnt2: '01:10', hrSai2: '05:58' });
  assert.deepEqual(validateEscalaPayload(buildPayload([night])), []);
  const errors = validateEscalaPayload(buildPayload([
    night, trabalho('2026-09-02', { hrEnt1: '08:00', hrSai1: '12:00', hrEnt2: '13:10', hrSai2: '17:58' })
  ]));
  assert.ok(errors.some((error) => error.includes('interjornada menor que 11h')));
  assert.ok(errors.every((error) => !error.includes('horarios fora de ordem')));
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

test('backend counts fixed rests toward the weekly minimum and maximum', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01'),
    descanso('2026-09-02', 'FXF'),
    descanso('2026-09-04', 'FXF'),
    descanso('2026-09-06', 'FXF')
  ]));

  assert.ok(errors.some((error) => error.includes('3 folgas na semana')));
  const twoFixed = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01'),
    descanso('2026-09-02', 'FXF'),
    trabalho('2026-09-03'),
    trabalho('2026-09-04'),
    descanso('2026-09-05', 'FXF'),
    trabalho('2026-09-06')
  ]));
  assert.equal(twoFixed.some((error) => error.includes('minimo esperado no 5x2')), false);
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

test('backend accepts 5h with 15m interval and rejects a wrong interval', () => {
  const five = trabalho('2026-09-01', { hrEnt1: '08:00', hrSai1: '10:30', hrEnt2: '10:45', hrSai2: '13:15',
    jornadaMinutos: 300, intervaloMinutos: 15 });
  assert.equal(validateEscalaPayload(buildPayload([five])).some((error) => error.includes('jornada total') || error.includes('intervalo')), false);
  const invalid = { ...five, hrEnt2: '11:40', hrSai2: '14:10' };
  assert.equal(validateEscalaPayload(buildPayload([invalid])).some((error) => error.includes('intervalo')), true);
});

test('backend validates apprentice with fixed 05:15 first period only', () => {
  const errors = validateEscalaPayload(buildPayload([
    trabalho('2026-09-01', { hrSai1: '13:15', hrEnt2: '00:00', hrSai2: '00:00' })
  ], { funcao: 'JOVEM APRENDIZ', aprendiz: true }));

  assert.deepEqual(errors, []);
  assert.deepEqual(validateEscalaPayload(buildPayload([
    trabalho('2026-09-01', { hrEnt1: '09:00', hrSai1: '14:15', hrEnt2: null, hrSai2: null })
  ], { funcao: 'JOVEM APRENDIZ', aprendiz: true })), []);
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
