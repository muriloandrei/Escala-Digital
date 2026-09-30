const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { previewHorarioFuncionarioEscala, _private: { aplicarHorarioBaseNosDias } } = require('../src/services/escalaService');

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

test('edicao do horario-base preserva ajuste individual do dia', () => {
  const result = aplicarHorarioBaseNosDias(
    [jornada('2026-10-05'), jornada('2026-10-06')],
    horario, '2026-10-05', new Set(), new Set(['2026-10-06'])
  );
  assert.equal(result.diasAlterados, 1);
  assert.equal(result.dias[0].hrEnt1, '09:00');
  assert.equal(result.dias[1].hrEnt1, '08:00');
});

test('previa somente cadastro nao acessa nem modifica a escala', async () => {
  const result = await previewHorarioFuncionarioEscala({
    lojaId: 35, mesRef: '2026-10-01', escfuncId: 90, horario, aplicarNaEscala: false
  });
  assert.deepEqual(result, { diasAlterados: 0, diasManuais: 0, possuiEscala: false });
});

test('alcance somente cadastro nao regrava dias da escala', async () => {
  const operations = [];
  const connection = {
    async execute(sql) {
      if (/select escfunc_id from sgn_esc_funcionario/i.test(sql)) return { rows: [{ ESCFUNC_ID: 90 }] };
      if (/update sgn_esc_funcionario/i.test(sql)) {
        operations.push('update-cadastro');
        return { rowsAffected: 1 };
      }
      throw new Error(`SQL inesperado: ${sql}`);
    },
    async commit() { operations.push('commit'); },
    async rollback() { operations.push('rollback'); }
  };
  const module = { exports: {} };
  const dependencies = {
    '../db/oracle': { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } },
    './catalogService': {},
    './escalaEventService': {
      createOperationId: () => 'op-horario',
      appendEvent: async (_, event) => {
        assert.equal(event.detalhe.aplicarNaEscala, false);
        operations.push('event');
      }
    },
    '../domain/operationalPeriod': {},
    '../utils/scheduleDiff': {}
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/services/escalaService.js'), 'utf8');
  vm.runInNewContext(source, { module, require: (name) => dependencies[name], console });
  const result = await module.exports.updateHorarioFuncionarioEscala({
    lojaId: 35, mesRef: '2026-10-01', aplicarNaEscala: false,
    funcionario: { ESCFUNC_ID: 90, ESCSECAO_ID: 2003, CHAPA: '035.0090' },
    horario, actor: { sub: 1, login: 'admin' }
  });
  assert.equal(result.saved, null);
  assert.equal(result.diasAlterados, 0);
  assert.deepEqual(operations, ['update-cadastro', 'event', 'commit']);
});
