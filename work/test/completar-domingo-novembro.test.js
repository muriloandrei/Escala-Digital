const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, planEmployee, loadStores } = require('../scripts/completar-domingo-novembro-2026');
const escalaService = require('../src/services/escalaService');

const shift = { HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' };
const head = {
  ESCPROG_ID: 10, ESCFUNC_ID: 20, ESCSECAO_ID: 30, ESCFUNCAO_ID: 40,
  LOJA: 35, CHAPA: '035.0001', NOME: 'Funcionario', REVISAO: 9,
  FUNCIONARIO_STATUS: 'A', OFICIALIZADA: 0, OUTUBRO_25_TRB: 0
};
const rows = [
  { ...head, DT: '2026-11-02', PROGRAMACAO: 'TRB', ...shift },
  { ...head, DT: '2026-11-08', PROGRAMACAO: 'F' }
];

test('script exige loja e operador somente na aplicacao', () => {
  assert.deepEqual(parseArgs(['--loja=35']), { loja: 35, all: false,
    apply: false, actor: null, includeOfficialized: false, onlyAbsences: false });
  assert.deepEqual(parseArgs(['--all']), { loja: null, all: true,
    apply: false, actor: null, includeOfficialized: false, onlyAbsences: false });
  assert.equal(parseArgs(['--loja=35', '--include-officialized']).includeOfficialized, true);
  assert.equal(parseArgs(['--all', '--only-absences']).onlyAbsences, true);
  assert.equal(parseArgs(['--loja=35', '--apply', '--by=opc']).apply, true);
  assert.equal(parseArgs(['--all', '--only-absences', '--apply', '--by=opc', '--include-officialized']).apply, true);
  assert.throws(() => parseArgs(['--loja=35', '--apply']), /Use --loja/);
  assert.throws(() => parseArgs(['--loja=0']), /Use --loja/);
  assert.throws(() => parseArgs(['--all', '--loja=35']), /Use --loja/);
});

test('modo geral descobre somente lojas com escala ativa de novembro', async () => {
  let sql;
  const lojas = await loadStores({ async execute(query) {
    sql = query;
    return { rows: [{ LOJA: 2 }, { LOJA: 64 }] };
  } });
  assert.deepEqual(lojas, [2, 64]);
  assert.match(sql, /mes_ref = date '2026-11-01'/);
  assert.match(sql, /nvl\(ativa, 1\) = 1/);
});

test('completa 01/11 de forma oposta a 08/11 e preserva os dias existentes', () => {
  const plan = planEmployee(rows, { todayIso: '2026-10-29' });
  assert.equal(plan.acao, 'COMPLETAR');
  assert.equal(plan.programacao, 'TRB');
  assert.equal(plan.payload.revisaoBase, 9);
  assert.deepEqual(plan.payload.dias.map((dia) => dia.data), ['2026-11-01', '2026-11-02', '2026-11-08']);
});

test('oficializada gera nova revisao pendente somente com autorizacao explicita', () => {
  const official = rows.map((row) => ({ ...row, OFICIALIZADA: 1 }));
  assert.equal(planEmployee(official, { todayIso: '2026-10-29' }).acao, 'BLOQUEADA');
  assert.equal(planEmployee(official, { todayIso: '2026-10-29', includeOfficialized: true }).acao, 'COMPLETAR');
});

test('domingo anterior trabalhado coloca 01/11 em folga e preserva 1x1', () => {
  const plan = planEmployee(rows.map((row) => ({ ...row, OUTUBRO_25_TRB: 1 })),
    { todayIso: '2026-10-29' });
  assert.equal(plan.acao, 'COMPLETAR');
  assert.equal(plan.programacao, 'F');
});

test('ferias em 01/11 sao preenchidas sem solicitar horario', () => {
  const plan = planEmployee(rows.map((row) => ({ ...row, AUSENCIA_01: 'FER' })),
    { todayIso: '2026-10-29' });
  assert.equal(plan.acao, 'COMPLETAR');
  assert.equal(plan.payload.dias[0].programacao, 'FER');
});

test('ausencia confirmada pode ser materializada apos 01/11 sem alterar outros dias', () => {
  for (const programacao of ['FER', 'AFA']) {
    const absent = rows.map((row) => ({ ...row, AUSENCIA_01: programacao }));
    assert.match(planEmployee(absent, { todayIso: '2026-11-03' }).motivo, /--only-absences/);
    const plan = planEmployee(absent, { todayIso: '2026-11-03', onlyAbsences: true });
    assert.equal(plan.acao, 'COMPLETAR');
    assert.equal(plan.payload.dias[0].data, '2026-11-01');
    assert.equal(plan.payload.dias[0].programacao, programacao);
    assert.deepEqual(plan.payload.dias.slice(1), rows.map((row) => ({
      data: row.DT, hrEnt1: row.HR_ENT1, hrSai1: row.HR_SAI1,
      hrEnt2: row.HR_ENT2, hrSai2: row.HR_SAI2, programacao: row.PROGRAMACAO
    })));
  }
  assert.equal(planEmployee(rows, { todayIso: '2026-10-29', onlyAbsences: true }).acao, 'IGNORADA');
  assert.equal(planEmployee(rows, { todayIso: '2026-11-03', onlyAbsences: true }).acao, 'IGNORADA');
});

test('dia passado fica bloqueado para revisao manual', () => {
  assert.match(planEmployee(rows, { todayIso: '2026-11-02' }).motivo, /ja passou/);
});

test('servico especial so cria revisao pendente de novembro', async () => {
  await assert.rejects(escalaService.completarDomingoNovembro2026({
    mesRef: '2026-10-01', oficializada: 0
  }), /novembro\/2026/);
  await assert.rejects(escalaService.completarDomingoNovembro2026({
    mesRef: '2026-11-01', oficializada: 1
  }), /pendentes/);
});
