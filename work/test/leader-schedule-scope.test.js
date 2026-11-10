const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const vm = require('node:vm');
const router = require('../src/routes/escalaRoutes');
const accessService = require('../src/services/accessService');
const escalaService = require('../src/services/escalaService');
const officializationService = require('../src/services/officializationService');
const previousSundayService = require('../src/services/previousSundayService');
const rmIntegrationService = require('../src/services/rmIntegrationService');
const auditService = require('../src/services/auditService');
const sundayShiftService = require('../src/services/sundayShiftService');
sundayShiftService.getStoreEnabled = async () => false;
const serviceRequire = createRequire(path.join(__dirname, '../src/services/escalaService.js'));

function response() {
  return { code: 200, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; } };
}

function route(pathname) {
  return router.stack.find((layer) => layer.route?.path === pathname &&
    layer.route.methods.get).route.stack.at(-1).handle;
}

test('leader sees released store in summary while monthly data remains section-scoped', async () => {
  const originals = {
    sections: accessService.getSecoesPermitidasUsuario,
    summary: escalaService.listEscalasResumo,
    monthly: escalaService.getEscalaMensal,
    progress: officializationService.getProgress,
    sunday: previousSundayService.getPriorSunday
  };
  const calls = [];
  accessService.getSecoesPermitidasUsuario = async () => [20, 21];
  escalaService.listEscalasResumo = async (options) => {
    calls.push(['summary', options]);
    return [{ LOJA: 10, MES_REF: '2026-11-01' }];
  };
  escalaService.getEscalaMensal = async (options) => {
    calls.push(['monthly', options]);
    return { secoes: [{ ESCSECAO_ID: 20 }, { ESCSECAO_ID: 21 }], funcionarios: [], dias: [] };
  };
  officializationService.getProgress = async (options) => {
    calls.push(['progress', options]);
    return { secoes: [] };
  };
  previousSundayService.getPriorSunday = async () => null;
  const user = { perfil: 'LIDER', lojas: [10], sub: 1 };
  try {
    const list = response();
    await route('/resumo')({ user, query: {} }, list, (error) => { throw error; });
    assert.equal(list.code, 200);
    assert.equal(list.body.escalas.length, 1);
    assert.equal(calls[0][1].escopoPorLoja, true);
    assert.deepEqual(calls[0][1].secoesPermitidas, [20, 21]);
    assert.deepEqual(calls[0][1].lojasPermitidas, [10]);

    const month = response();
    await route('/mensal')({ user, query: { lojaId: '10', mesRef: '2026-11-01' } }, month,
      (error) => { throw error; });
    assert.equal(month.code, 200);
    assert.deepEqual(calls.find(([kind]) => kind === 'monthly')[1].secoesPermitidas, [20, 21]);
    assert.deepEqual(calls.find(([kind]) => kind === 'progress')[1].secoesPermitidas, [20, 21]);
  } finally {
    accessService.getSecoesPermitidasUsuario = originals.sections;
    escalaService.listEscalasResumo = originals.summary;
    escalaService.getEscalaMensal = originals.monthly;
    officializationService.getProgress = originals.progress;
    previousSundayService.getPriorSunday = originals.sunday;
  }
});

test('critiques response includes only the selected section', async () => {
  const originalSections = accessService.getSecoesPermitidasUsuario;
  const originalMonthly = escalaService.getEscalaMensal;
  accessService.getSecoesPermitidasUsuario = async () => [20, 21];
  escalaService.getEscalaMensal = async () => ({
    secoes: [{ ESCSECAO_ID: 20, DESCR: 'Deposito' }, { ESCSECAO_ID: 21, DESCR: 'Frios' }],
    funcionarios: [
      { ESCFUNC_ID: 1, ESCSECAO_ID: 20, NOME: 'Pessoa A' },
      { ESCFUNC_ID: 2, ESCSECAO_ID: 21, NOME: 'Pessoa B' }
    ],
    dias: []
  });
  try {
    const res = response();
    await route('/criticas')({ user: { perfil: 'LIDER', lojas: [10], sub: 1 },
      query: { lojaId: '10', mesRef: '2026-11-01', escsecaoId: '20' } }, res,
    (error) => { throw error; });
    assert.equal(res.code, 200);
    assert.equal(res.body.grupos.length, 1);
    assert.equal(res.body.grupos[0].escsecaoId, 20);
    assert.ok(res.body.criticas.every((message) => message.includes('Pessoa A')));
  } finally {
    accessService.getSecoesPermitidasUsuario = originalSections;
    escalaService.getEscalaMensal = originalMonthly;
  }
});

test('store summary checks assigned active sections without requiring programs in those sections', async () => {
  const calls = [];
  const connection = { execute: async (sql, binds) => {
    calls.push({ sql, binds });
    return { rows: [] };
  } };
  const module = { exports: {} };
  const context = vm.createContext({ module, console, require: (name) => name === '../db/oracle'
    ? { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } }
    : serviceRequire(name) });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/services/escalaService.js'), 'utf8'), context);
  vm.runInContext("getAtivaSql = async () => 'nvl(p.ativa, 1) = 1'; getSecaoAtivaProgSql = async () => '1 = 1';", context);

  await module.exports.listEscalasResumo({ lojasPermitidas: [10], secoesPermitidas: [20], escopoPorLoja: true });
  assert.match(calls[0].sql, /exists \(\s*select 1 from sgn_esc_secao s_permitida/);
  assert.match(calls[0].sql, /s_permitida\.codfilial = p\.loja/);
  assert.match(calls[0].sql, /s_permitida\.escsecao_id in \(:secaoPermitida0\)/);
  assert.match(calls[0].sql, /nvl\(min\(case when p\.escsecao_id in \(:secaoPermitida0\) then nvl\(p\.oficializada, 0\) end\), 0\) as oficializada/);
  assert.match(calls[0].sql, /count\(distinct case when p\.escsecao_id in \(:secaoPermitida0\) then p\.escfunc_id end\) as funcionarios/);
  assert.doesNotMatch(calls[0].sql, /where p\.escsecao_id in \(:secaoPermitida0\)/);
  assert.equal(calls[0].binds.secaoPermitida0, 20);

  calls.length = 0;
  await module.exports.listEscalasResumo({ lojasPermitidas: [10], secoesPermitidas: [], escopoPorLoja: true });
  assert.match(calls[0].sql, /and 1 = 0/);
});

test('monthly view uses store release only when assigned sections have no programs', async () => {
  const calls = [];
  const module = { exports: {} };
  const connection = { execute: async (sql, binds) => {
    calls.push(binds);
    return { rows: [{ REVISAO: 'secaoPermitida0' in binds || sql.includes('1 = 0') ? null : 27 }] };
  } };
  const context = vm.createContext({ module, console, require: (name) => name === '../db/oracle'
    ? { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } }
    : serviceRequire(name) });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/services/escalaService.js'), 'utf8'), context);
  vm.runInContext("getAtivaSql = async () => '1 = 1'; getSecaoAtivaProgSql = async () => '1 = 1';", context);
  const helper = module.exports._private.getRevisaoLiberadaParaEscopo;
  assert.equal(await helper(connection, { lojaId: 10, mesRef: '2026-11-01', secoesPermitidas: [20] }), 27);
  assert.equal(calls.length, 2);
  calls.length = 0;
  assert.equal(await helper(connection, { lojaId: 10, mesRef: '2026-11-01', secoesPermitidas: [] }), null);
  assert.equal(calls.length, 1);
});

test('monthly view shows assigned employees before their section has generated programs', async () => {
  const module = { exports: {} };
  const employee = { ESCFUNC_ID: 42, CHAPA: '010.0042', NOME: 'Pessoa A', ESCSECAO_ID: 20,
    COD_SECAO: '010.02.001', SECAO_DESCR: 'Deposito', STATUS: 'A' };
  const catalog = { listFuncionariosByLoja: async (_lojaId, options) => {
    assert.deepEqual(options.secoesPermitidas, [20]);
    return [employee];
  } };
  const connection = { execute: async (sql) => {
    if (sql.includes('from sgn_esc_prog p') && sql.includes('left join sgn_esc_prog_dia d')) return { rows: [] };
    if (sql.includes('from sgn_esc_loja where loja')) return { rows: [{ HABILITADA: 1 }] };
    if (sql.includes('from sgn_esc_transfer_sub t')) return { rows: [] };
    throw new Error(`SQL inesperado: ${sql}`);
  } };
  const context = vm.createContext({ module, console, require: (name) => name === '../db/oracle'
    ? { withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1 } }
    : name === './catalogService' ? catalog : serviceRequire(name) });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/services/escalaService.js'), 'utf8'), context);
  vm.runInContext(`
    reconciliarDesligamentosComConnection = async () => ({ dias: 0 });
    getLatestRevision = async (_, scope) => scope.secoesPermitidas ? null : 27;
    getTableColumns = async () => new Set(['ESCSUBSECAO_ID', 'DT_DEMISS']);
    getAtivaSql = async () => '1 = 1';
    getSecaoAtivaProgSql = async () => '1 = 1';
    listAusenciasEscalaMensalComConnection = async () => [];
    listFixosEscalaComConnection = async () => [];
  `, context);
  const month = await module.exports.getEscalaMensal({ lojaId: 10, mesRef: '2026-11-01', secoesPermitidas: [20] });
  assert.equal(month.revisao, 27);
  assert.equal(month.todasSecoesHabilitadas, true);
  assert.deepEqual(Array.from(month.funcionarios, (person) => person.ESCFUNC_ID), [42]);
  assert.deepEqual(Array.from(month.secoes, (section) => section.ESCSECAO_ID), [20]);
  assert.equal(month.dias.length, 0);
});

test('leader officialization does not approve a linked section outside assigned scope', async () => {
  const originals = {
    sections: accessService.getSecoesPermitidasUsuario,
    assertSections: accessService.assertSecoesPermitidas,
    progress: officializationService.getProgress,
    prerequisites: rmIntegrationService.validarPreRequisitosRm,
    send: rmIntegrationService.processarOperacaoRm,
    officialize: escalaService.oficializarEscala,
    audit: auditService.registerAudit
  };
  const approved = [];
  accessService.getSecoesPermitidasUsuario = async () => [20];
  accessService.assertSecoesPermitidas = async (_user, _loja, ids) => {
    if (ids.some((id) => id !== 20)) throw Object.assign(new Error('Secao nao permitida.'), { statusCode: 403 });
  };
  officializationService.getProgress = async () => ({ habilitada: true, secoes: [
    { escsecaoId: 20, codigo: '010.02.002', secao: 'Frente de Caixa',
      escfuncIds: [42], completa: true, criticas: 0, podeOficializar: true },
    { escsecaoId: 21, codigo: '010.02.004', secao: 'Transportes',
      escfuncIds: [43], completa: true, criticas: 0, podeOficializar: true }
  ] });
  rmIntegrationService.validarPreRequisitosRm = async ({ escfuncIds }) => {
    assert.deepEqual(escfuncIds, [42]);
    return { errors: [] };
  };
  rmIntegrationService.processarOperacaoRm = async () => ({ status: 'ENVIADO' });
  escalaService.oficializarEscala = async ({ escsecaoId, escfuncIds }) => {
    approved.push(escsecaoId);
    assert.deepEqual(escfuncIds, [42]);
    return { affectedRows: 1, revisao: 2, operacaoId: 'operation-20' };
  };
  auditService.registerAudit = async () => {};
  try {
    const res = response();
    await router.stack.find((layer) => layer.route?.path === '/oficializar').route.stack.at(-1).handle({
      user: { perfil: 'LIDER', lojas: [10], sub: 1 },
      body: { lojaId: 10, mesRef: '2026-11-01', escsecaoId: 20 }
    }, res, (error) => { throw error; });
    assert.equal(res.code, 200);
    assert.deepEqual(approved, [20]);
    assert.equal(res.body.relacionadas[0].escsecaoId, 21);
    assert.equal(res.body.relacionadas[0].status, 'IGNORADA');
  } finally {
    accessService.getSecoesPermitidasUsuario = originals.sections;
    accessService.assertSecoesPermitidas = originals.assertSections;
    officializationService.getProgress = originals.progress;
    rmIntegrationService.validarPreRequisitosRm = originals.prerequisites;
    rmIntegrationService.processarOperacaoRm = originals.send;
    escalaService.oficializarEscala = originals.officialize;
    auditService.registerAudit = originals.audit;
  }
});
