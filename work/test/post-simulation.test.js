const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const simulation = require('../src/services/postSimulationService');
const workRegimeService = require('../src/services/workRegimeService');

test('12x36 trial covers the operational month with alternating duty and rest', () => {
  const dates = simulation.periodDates('2026-12-01');
  assert.equal(dates[0], '2026-11-30');
  assert.equal(dates.at(-1), '2027-01-03');
  const rows = simulation.simulationRows({ lojaId: 700, mesRef: '2026-12-01', escsecaoId: 1,
    escfuncId: 10, anchor: '2026-11-30', hours: simulation.DEFAULT_HOURS,
    actor: { login: 'TESTE' } });
  assert.equal(rows.length, dates.length);
  assert.deepEqual(rows.slice(0, 3).map((row) => row.programacao), ['TRB', 'F', 'TRB']);
  assert.equal(rows[0].HR_ENT1, '07:00');
  assert.equal(rows[0].HR_SAI2, '19:00');
});

test('12x36 generation balances the two phases within subsections and across the store', () => {
  const people = [
    { ESCFUNC_ID: 1, CHAPA: '701.0001', ESCSUBSECAO_ID: 10 },
    { ESCFUNC_ID: 2, CHAPA: '701.0002', ESCSUBSECAO_ID: 10 },
    { ESCFUNC_ID: 3, CHAPA: '701.0003', ESCSUBSECAO_ID: 10 },
    { ESCFUNC_ID: 4, CHAPA: '701.0004', ESCSUBSECAO_ID: 20 },
    { ESCFUNC_ID: 5, CHAPA: '701.0005', ESCSUBSECAO_ID: 20 },
    { ESCFUNC_ID: 6, CHAPA: '701.0006', ESCSUBSECAO_ID: 20 },
  ];
  const anchors = simulation.planBalancedAnchors(new Map(people.map((person) => [person.ESCFUNC_ID, person])),
    [6, 4, 2, 1, 3, 5], ['2026-11-30', '2026-12-01']);
  assert.equal([...anchors.values()].filter((date) => date === '2026-11-30').length, 3);
  assert.equal([...anchors.values()].filter((date) => date === '2026-12-01').length, 3);
  for (const subsection of [10, 20]) {
    const phases = people.filter((person) => person.ESCSUBSECAO_ID === subsection)
      .map((person) => anchors.get(person.ESCFUNC_ID));
    assert.equal(new Set(phases).size, 2);
  }
});

test('changing the anchor inverts the whole 12x36 period without isolated duty days', () => {
  const common = { lojaId: 701, mesRef: '2026-12-01', escsecaoId: 1, escfuncId: 10,
    hours: simulation.DEFAULT_HOURS, actor: { login: 'TESTE' } };
  const original = simulation.simulationRows({ ...common, anchor: '2026-11-30' });
  const inverted = simulation.simulationRows({ ...common, anchor: '2026-12-01' });
  for (let index = 0; index < original.length; index += 1) {
    assert.equal(original[index].diaIso, inverted[index].diaIso);
    assert.notEqual(original[index].programacao, inverted[index].programacao);
  }
});

test('old individual regime registrations no longer affect operational schedules', async () => {
  const result = await workRegimeService.listEffective(null, { lojaId: 700, mesRef: '2026-12-01' });
  assert.equal(result.size, 0);
});

test('trial rejects regular stores and invalid 12x36 hours before writing', async () => {
  await assert.rejects(simulation.generate({ lojaId: 64, mesRef: '2026-12-01', escsecaoId: 1,
    escfuncIds: [10] }), /postos 700 a 799/);
  await assert.rejects(simulation.configureEmployee({ lojaId: 700, mesRef: '2026-12-01',
    escsecaoId: 1, escfuncId: 10, anchor: '2026-11-30', hours: {
      HR_ENT1: '07:00', HR_SAI1: '12:00', HR_ENT2: '13:00', HR_SAI2: '17:00'
    } }), /12:00/);
});

test('Oracle writes use non-reserved bind names for generation and day edits', async () => {
  const statements = [];
  const connection = {
    async execute(sql) {
      statements.push(sql);
      if (/select count\(\*\) total from sgn_esc_sim_12x36/i.test(sql)) return { rows: [{ TOTAL: 35 }] };
      return { rows: [], rowsAffected: /update sgn_esc_sim_12x36[\s\S]*dt_ancora/i.test(sql) ? 35 : 1 };
    },
    async executeMany(sql) { statements.push(sql); return { rowsAffected: 35 }; },
    async commit() {}, async rollback() {}
  };
  const mod = { exports: {} };
  const source = fs.readFileSync(path.join(__dirname, '../src/services/postSimulationService.js'), 'utf8');
  vm.runInNewContext(source, {
    module: mod,
    require(name) {
      if (name === '../db/oracle') return { withConnection: (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } };
      if (name === './catalogService') return { listFuncionariosByLoja: async () => [{ ESCFUNC_ID: 10, ESCSECAO_ID: 1 }] };
      if (name === '../domain/operationalPeriod') return require('../src/domain/operationalPeriod');
      if (name === '../domain/workRegime') return require('../src/domain/workRegime');
      if (name === '../domain/shiftValidation') return require('../src/domain/shiftValidation');
      throw new Error(`Dependencia inesperada: ${name}`);
    }
  });
  const service = mod.exports;
  const scope = { lojaId: 700, mesRef: '2026-12-01', escsecaoId: 1, escfuncId: 10, actor: { login: 'TESTE' } };
  await service.generate({ ...scope, escfuncIds: [10] });
  await service.editDay({ ...scope, date: '2026-11-30', hours: service.DEFAULT_HOURS });
  await service.invertEmployee({ ...scope, anchor: '2026-12-01' });
  assert.equal(statements.some((sql) => /:date\b/i.test(sql)), false);
  assert.equal(statements.filter((sql) => /:diaIso\b/.test(sql)).length, 2);
  const inversion = statements.find((sql) => /update sgn_esc_sim_12x36[\s\S]*dt_ancora/i.test(sql));
  assert.match(inversion, /programacao = case when mod\(/i);
  assert.doesNotMatch(inversion, /hr_ent1|hr_sai1|hr_ent2|hr_sai2/i);
});
