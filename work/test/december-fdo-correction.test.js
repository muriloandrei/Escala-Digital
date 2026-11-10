const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, planEmployee, groupEmployees } = require('../scripts/corrigir-fdo-dezembro-2026');
const { validateEscalaPayload } = require('../src/rules/escalaRules');

function day(date, programacao) {
  return {
    data: date, programacao,
    hrEnt1: programacao === 'TRB' ? '08:00' : programacao,
    hrSai1: programacao === 'TRB' ? '12:00' : programacao,
    hrEnt2: programacao === 'TRB' ? '13:10' : programacao,
    hrSai2: programacao === 'TRB' ? '17:58' : programacao
  };
}

function employee(days, officialized = 0) {
  return {
    LOJA: 64, ESCFUNC_ID: 100, ESCSECAO_ID: 20, ESCFUNCAO_ID: 30,
    CHAPA: '064.0100', NOME: 'Funcionario Teste', REVISAO: 4,
    ESCSECAOTURNO_ID: 99, HR_OFICIAL_ENT1: '08:00', HR_OFICIAL_SAI1: '12:00',
    HR_OFICIAL_ENT2: '13:10', HR_OFICIAL_SAI2: '17:58',
    OFICIALIZADA: officialized, FUNCIONARIO_STATUS: 'A',
    REGIME_ESCALA: '5X2', DT_DEMISS: null,
    headerIds: new Set([80]), days
  };
}

test('December correction changes holiday work to FDO and keeps weekly rests', () => {
  const days = ['2026-12-21', '2026-12-22', '2026-12-23', '2026-12-24',
    '2026-12-25', '2026-12-26', '2026-12-27']
    .map((date) => day(date, ['2026-12-23', '2026-12-27'].includes(date) ? 'F' : 'TRB'));
  const plan = planEmployee(employee(days));
  assert.equal(plan.action, 'CORRECT');
  assert.equal(plan.payload.dias.find((item) => item.data === '2026-12-25').programacao, 'FDO');
  assert.equal(plan.payload.dias.filter((item) => item.programacao === 'F').length, 2);
  assert.deepEqual(plan.payload.turnoOficial, {
    escsecaoTurnoId: 99, hrEnt1: '08:00', hrSai1: '12:00', hrEnt2: '13:10', hrSai2: '17:58'
  });
  assert.deepEqual(validateEscalaPayload({ lojaId: 64, mesRef: '2026-12-01',
    funcionarios: [{ nome: 'Funcionario Teste', dias: plan.payload.dias }] }), []);
  assert.equal(days.find((item) => item.data === '2026-12-25').programacao, 'TRB');
});

test('December correction moves an ordinary holiday rest within the same week', () => {
  const days = ['2026-12-21', '2026-12-22', '2026-12-23', '2026-12-24',
    '2026-12-25', '2026-12-26', '2026-12-27']
    .map((date) => day(date, ['2026-12-25', '2026-12-27'].includes(date) ? 'F' : 'TRB'));
  const plan = planEmployee(employee(days));
  assert.equal(plan.action, 'CORRECT');
  assert.deepEqual(plan.replacementRests, ['2026-12-21']);
  assert.equal(plan.payload.dias.filter((item) => item.programacao === 'F').length, 2);
  assert.equal(plan.payload.dias.find((item) => item.data === '2026-12-25').programacao, 'FDO');
});

test('fixed holidays are blocked, existing FDO is preserved and officialized revisions require opt-in', () => {
  const days = [day('2026-12-25', 'TRB'), day('2027-01-01', 'FDO')];
  const fixed = [{ ESCFUNC_ID: 100, DT: '2026-12-25', PROGRAMACAO: 'TRB' }];
  assert.equal(planEmployee(employee(days), fixed).action, 'BLOCKED');
  assert.equal(planEmployee(employee([day('2026-12-25', 'FDO')])).action, 'UNCHANGED');
  assert.equal(planEmployee(employee([day('2026-12-25', 'FDO')], 1)).action, 'UNCHANGED');
  assert.equal(planEmployee(employee(days, 1)).action, 'BLOCKED');
  assert.equal(planEmployee(employee(days, 1), [], { includeOfficialized: true }).action, 'CORRECT');
});

test('correction blocks a holiday rest when all possible replacement days are fixed', () => {
  const days = ['2026-12-21', '2026-12-22', '2026-12-23', '2026-12-24',
    '2026-12-25', '2026-12-26', '2026-12-27']
    .map((date) => day(date, ['2026-12-25', '2026-12-27'].includes(date) ? 'F' : 'TRB'));
  const fixed = days.filter((item) => item.programacao === 'TRB').map((item) => ({ ESCFUNC_ID: 100, DT: item.data }));
  assert.equal(planEmployee(employee(days), fixed).action, 'BLOCKED');
});

test('correction keeps vacation and absence days while processing Christmas', () => {
  const days = [day('2026-12-24', 'FER'), day('2026-12-25', 'TRB'), day('2026-12-26', 'AFA')];
  const plan = planEmployee(employee(days));
  assert.equal(plan.action, 'CORRECT');
  assert.equal(plan.payload.dias.find((item) => item.data === '2026-12-24').programacao, 'FER');
  assert.equal(plan.payload.dias.find((item) => item.data === '2026-12-26').programacao, 'AFA');
});

test('correction CLI requires store scope and explicit apply operator', () => {
  assert.deepEqual(parseArgs(['--loja=64']), { loja: 64, all: false, apply: false, by: null, includeOfficialized: false });
  assert.equal(parseArgs(['--all', '--include-officialized', '--apply', '--by=opc']).apply, true);
  assert.throws(() => parseArgs(['--all', '--apply']), /--by/);
  const grouped = groupEmployees([{ ESCFUNC_ID: 100, ESCPROG_ID: 80, DT: '2026-12-25', PROGRAMACAO: 'F' }]);
  assert.equal(grouped[0].days.length, 1);
  assert.equal(grouped[0].headerIds.size, 1);
});
