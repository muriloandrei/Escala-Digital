const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { _private: { aplicarHorarioBaseNosDias,
  diasComFixoAtualizado, diasSemFixo } } = require('../src/services/escalaService');
const escalaRouter = require('../src/routes/escalaRoutes');

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

test('edicao do horario-base atualiza tambem um dia editado manualmente', () => {
  const result = aplicarHorarioBaseNosDias(
    [jornada('2026-10-05'), { ...jornada('2026-10-06'), HR_ENT1: '10:00' }],
    horario, '2026-10-05'
  );
  assert.equal(result.diasAlterados, 2);
  assert.equal(result.dias[0].hrEnt1, '09:00');
  assert.equal(result.dias[1].hrEnt1, '09:00');
  assert.equal(result.dias[1].hrSai2, '18:58');
});

test('edicao manual em horario fixo continua protegida', () => {
  const result = aplicarHorarioBaseNosDias(
    [jornada('2026-10-05'), { ...jornada('2026-10-06'), HR_ENT1: '10:00' }],
    horario, '2026-10-05', new Set(['2026-10-06'])
  );
  assert.equal(result.diasAlterados, 1);
  assert.equal(result.dias[1].hrEnt1, '10:00');
});

test('previa considera edicoes manuais e consulta apenas fixos como bloqueio', async () => {
  const filename = path.join(__dirname, '../src/services/escalaService.js');
  const serviceRequire = createRequire(filename);
  const connection = { execute: async (sql) => {
    assert.match(sql, /from sgn_esc_fixo_escala/);
    return { rows: [{ DT: '2099-01-06' }] };
  } };
  const mod = { exports: {} };
  const context = vm.createContext({ module: mod, console, require: (name) => name === '../db/oracle'
    ? { withConnection: (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } }
    : serviceRequire(name) });
  vm.runInContext(fs.readFileSync(filename, 'utf8'), context);
  vm.runInContext(`getEscalaFuncionarioAtualComConnection = async () => ({
    header: { OFICIALIZADA: 0 }, revisao: 5,
    dias: [
      { DT: '2099-01-05', PROGRAMACAO: 'TRB', HR_ENT1: '10:00', HR_SAI1: '14:00', HR_ENT2: '15:10', HR_SAI2: '19:58' },
      { DT: '2099-01-06', PROGRAMACAO: 'TRB', HR_ENT1: '10:00', HR_SAI1: '14:00', HR_ENT2: '15:10', HR_SAI2: '19:58' }
    ]
  });`, context);
  const impact = await mod.exports.previewHorarioFuncionarioEscala({ lojaId: 35, mesRef: '2099-01-01',
    escfuncId: 1, horario, actor: { perfil: 'ADMIN' } });
  assert.equal(impact.diasAlterados, 1);
  assert.equal(impact.diasFixos, 1);
  assert.deepEqual(Array.from(impact.mesesImpactados), ['2099-01-01']);
});

test('edicao de horario fixo altera o dia gerado e preserva os demais', () => {
  const atuais = [jornada('2026-11-02'), jornada('2026-11-03')];
  const dias = diasComFixoAtualizado(atuais, '2026-11-03', {
    programacao: 'TRB', hrEnt1: '09:00', hrSai1: '13:00', hrEnt2: '14:10', hrSai2: '18:58'
  });
  assert.equal(dias[0].hrEnt1, '08:00');
  assert.equal(dias[1].hrEnt1, '09:00');
  assert.equal(dias[1].hrSai2, '18:58');
  assert.equal(atuais[1].HR_ENT1, '08:00');
});

test('fixo em dia vazio de escala existente passa a compor uma nova revisao', () => {
  const atuais = [jornada('2026-11-02')];
  const dias = diasComFixoAtualizado(atuais, '2026-11-01', {
    programacao: 'TRB', hrEnt1: '09:00', hrSai1: '13:00', hrEnt2: '14:10', hrSai2: '18:58'
  });
  assert.deepEqual(dias.map((dia) => dia.data), ['2026-11-01', '2026-11-02']);
  assert.equal(dias[0].hrEnt1, '09:00');
  assert.equal(atuais.length, 1);
  const folga = diasComFixoAtualizado(atuais, '2026-11-01', { programacao: 'FXF' });
  assert.equal(folga[0].programacao, 'FXF');
  assert.equal(diasComFixoAtualizado([], '2026-11-01', { programacao: 'FXF' }), null);
});

test('fixo identico ao dia gerado nao cria revisao', () => {
  const atuais = [jornada('2026-11-02')];
  assert.equal(diasComFixoAtualizado(atuais, '2026-11-02', {
    programacao: 'TRB', hrEnt1: '08:00', hrSai1: '12:00', hrEnt2: '13:10', hrSai2: '17:58'
  }), null);
});

test('ferias e afastamento nao podem ser substituidos por fixo', () => {
  for (const programacao of ['FER', 'AFA']) {
    assert.throws(() => diasComFixoAtualizado([jornada('2026-11-02', programacao)], '2026-11-02', {
      programacao: 'TRB', hrEnt1: '09:00', hrSai1: '13:00', hrEnt2: '14:10', hrSai2: '18:58'
    }), /nao pode receber horario fixo/i);
  }
});

test('remover folga fixa preserva o dia como folga comum', () => {
  const atuais = [jornada('2026-11-02', 'FXF'), jornada('2026-11-03')];
  const dias = diasSemFixo(atuais, '2026-11-02', { PROGRAMACAO: 'FXF' });
  assert.equal(dias[0].programacao, 'F');
  assert.equal(dias[0].hrEnt1, null);
  assert.equal(dias[1].programacao, 'TRB');
  assert.equal(atuais[0].PROGRAMACAO, 'FXF');
});

test('remover trabalho fixo mantem os horarios e nao gera revisao sem mudanca', () => {
  const atuais = [jornada('2026-11-02')];
  assert.equal(diasSemFixo(atuais, '2026-11-02', { PROGRAMACAO: 'TRB' }), null);
  assert.equal(diasSemFixo(atuais, '2026-11-03', { PROGRAMACAO: 'FXF' }), null);
  assert.equal(atuais[0].HR_ENT1, '08:00');
});

for (const method of ['post', 'patch']) {
  test(`${method} de horario-base rejeita cadastro isolado e mes ausente`, async () => {
    const layer = escalaRouter.stack.find((item) => item.route?.path === '/funcionario/horario' + (method === 'post' ? '/preview' : '') && item.route.methods[method]);
    const handler = layer.route.stack.at(-1).handle;
    for (const body of [{ mesRef: '2026-10-01', aplicarNaEscala: false }, { aplicarNaEscala: true }]) {
      let status;
      let response;
      const res = {
        status(code) { status = code; return this; },
        json(value) { response = value; return this; }
      };
      await handler({ body }, res, (error) => { throw error; });
      assert.equal(status, 422);
      assert.match(response.error, /atualizados juntos/i);
    }
  });

  test(`${method} de horario-base bloqueia mes anterior`, async () => {
    const route = '/funcionario/horario' + (method === 'post' ? '/preview' : '');
    const layer = escalaRouter.stack.find((item) => item.route?.path === route && item.route.methods[method]);
    const handler = layer.route.stack.at(-1).handle;
    let status;
    let response;
    const res = { status(code) { status = code; return this; }, json(value) { response = value; return this; } };
    await handler({ body: { lojaId: 10, escfuncId: 1, mesRef: '2020-01-01', aplicarNaEscala: true, ...horario } }, res, (error) => { throw error; });
    assert.equal(status, 422);
    assert.match(response.error, /meses anteriores/i);
  });
}
