const test = require('node:test');
const assert = require('node:assert/strict');
const router = require('../src/routes/escalaRoutes');
const accessService = require('../src/services/accessService');
const officializationService = require('../src/services/officializationService');
const escalaService = require('../src/services/escalaService');
const rmIntegrationService = require('../src/services/rmIntegrationService');
const auditService = require('../src/services/auditService');
const sectionRolloutService = require('../src/services/sectionRolloutService');

function response() {
  return { code: 200, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; } };
}

test('admin store scope toggle is persisted and audited', async () => {
  const handle = router.stack.find((layer) => layer.route?.path === '/escopo-secoes-loja').route.stack.at(-1).handle;
  const originalSet = sectionRolloutService.setStoreEnabled;
  const originalAudit = auditService.registerAudit;
  const calls = [];
  sectionRolloutService.setStoreEnabled = async (...args) => { calls.push(args); return true; };
  auditService.registerAudit = async (payload) => { calls.push(payload); };
  try {
    const res = response();
    await handle({ body: { lojaId: 64, habilitada: true }, user: { perfil: 'ADMIN', sub: 1 } }, res,
      (error) => { throw error; });
    assert.deepEqual(res.body, { ok: true, habilitada: true });
    assert.deepEqual(calls[0], [64, true]);
    assert.equal(calls[1].action, 'ALTERAR_ESCOPO_SECOES_LOJA');
    assert.equal(calls[1].lojaId, 64);
  } finally {
    sectionRolloutService.setStoreEnabled = originalSet;
    auditService.registerAudit = originalAudit;
  }
});

test('progress endpoint rejects roles outside RH, gerente and admin', async () => {
  const handle = router.stack.find((layer) => layer.route?.path === '/progresso').route.stack.at(-1).handle;
  const result = response();
  await handle({ user: { perfil: 'OPERADOR' }, query: { lojaId: '10', mesRef: '2026-11-01' } }, result, (error) => { throw error; });
  assert.equal(result.code, 403);
});

test('only admin can request empty sections in the officialization report', async () => {
  const handle = router.stack.find((layer) => layer.route?.path === '/progresso').route.stack.at(-1).handle;
  const originalSections = accessService.getSecoesPermitidasUsuario;
  const originalProgress = officializationService.getProgress;
  const calls = [];
  accessService.getSecoesPermitidasUsuario = async () => null;
  officializationService.getProgress = async (payload) => { calls.push(payload); return { secoes: [] }; };
  try {
    for (const perfil of ['ADMIN', 'GERENTE']) {
      const res = response();
      await handle({ user: { perfil }, query: { lojaId: '10', mesRef: '2026-11-01', includeEmpty: '1' } }, res,
        (error) => { throw error; });
      assert.equal(res.code, 200);
    }
    assert.equal(calls[0].includeEmpty, true);
    assert.equal(calls[0].includeCritiques, false);
    assert.equal(calls[1].includeEmpty, false);
    assert.equal(calls[1].includeCritiques, true);
  } finally {
    accessService.getSecoesPermitidasUsuario = originalSections;
    officializationService.getProgress = originalProgress;
  }
});

test('leader can officialize only a whole enabled complete section', async () => {
  const handle = router.stack.find((layer) => layer.route?.path === '/oficializar').route.stack.at(-1).handle;
  const originals = {
    getSecoesPermitidasUsuario: accessService.getSecoesPermitidasUsuario,
    assertSecoesPermitidas: accessService.assertSecoesPermitidas,
    getProgress: officializationService.getProgress,
    validarPreRequisitosRm: rmIntegrationService.validarPreRequisitosRm,
    processarOperacaoRm: rmIntegrationService.processarOperacaoRm,
    oficializarEscala: escalaService.oficializarEscala,
    registerAudit: auditService.registerAudit
  };
  let enabled = false;
  let complete = true;
  let writes = 0;
  accessService.getSecoesPermitidasUsuario = async () => [12];
  accessService.assertSecoesPermitidas = async () => {};
  officializationService.getProgress = async () => ({ habilitada: enabled,
    secoes: [{ escsecaoId: 12, escfuncIds: [42, 43], completa: complete, criticas: 0 }] });
  rmIntegrationService.validarPreRequisitosRm = async ({ escfuncIds }) => {
    assert.deepEqual(escfuncIds, [42, 43]);
    return { errors: [] };
  };
  rmIntegrationService.processarOperacaoRm = async () => ({ status: 'PENDENTE' });
  escalaService.oficializarEscala = async (payload) => {
    assert.deepEqual(payload.escfuncIds, [42, 43]);
    writes += 1;
    return { affectedRows: 2, operacaoId: 'operation', revisao: 1 };
  };
  auditService.registerAudit = async () => {};
  const req = { body: { lojaId: 10, mesRef: '2026-11-01', escsecaoId: 12 }, user: { perfil: 'LIDER', sub: 1 } };
  try {
    const disabled = response();
    await handle(req, disabled, (error) => { throw error; });
    assert.equal(disabled.code, 403);
    enabled = true;
    complete = false;
    const incomplete = response();
    await handle(req, incomplete, (error) => { throw error; });
    assert.equal(incomplete.code, 422);
    complete = true;
    const partial = response();
    await handle({ ...req, body: { ...req.body, escfuncIds: [42] } }, partial, (error) => { throw error; });
    assert.equal(partial.code, 400);
    const approved = response();
    await handle(req, approved, (error) => { throw error; });
    assert.equal(approved.code, 200);
    assert.equal(writes, 1);
    const rh = response();
    await handle({ ...req, user: { perfil: 'RH', sub: 2 } }, rh, (error) => { throw error; });
    assert.equal(rh.code, 403);
  } finally {
    accessService.getSecoesPermitidasUsuario = originals.getSecoesPermitidasUsuario;
    accessService.assertSecoesPermitidas = originals.assertSecoesPermitidas;
    officializationService.getProgress = originals.getProgress;
    rmIntegrationService.validarPreRequisitosRm = originals.validarPreRequisitosRm;
    rmIntegrationService.processarOperacaoRm = originals.processarOperacaoRm;
    escalaService.oficializarEscala = originals.oficializarEscala;
    auditService.registerAudit = originals.registerAudit;
  }
});

test('officializing Transportes also approves ready linked sections without approving blocked or unrelated ones', async () => {
  const handle = router.stack.find((layer) => layer.route?.path === '/oficializar').route.stack.at(-1).handle;
  const originals = {
    getSecoesPermitidasUsuario: accessService.getSecoesPermitidasUsuario,
    assertSecoesPermitidas: accessService.assertSecoesPermitidas,
    getProgress: officializationService.getProgress,
    validarPreRequisitosRm: rmIntegrationService.validarPreRequisitosRm,
    processarOperacaoRm: rmIntegrationService.processarOperacaoRm,
    oficializarEscala: escalaService.oficializarEscala,
    registerAudit: auditService.registerAudit
  };
  const approved = [];
  const audited = [];
  const sent = [];
  accessService.getSecoesPermitidasUsuario = async () => [1, 2, 3, 4];
  accessService.assertSecoesPermitidas = async (_user, _loja, ids) => {
    assert.ok(ids.every((id) => [1, 2, 3, 4].includes(id)));
  };
  officializationService.getProgress = async (params) => {
    assert.deepEqual(params.secoesPermitidas, [1, 2, 3, 4]);
    return { habilitada: true, secoes: [
      { escsecaoId: 1, escfuncIds: [11], codigo: '035.02.002', secao: 'Frente de Caixa', completa: true, criticas: 0, podeOficializar: true },
      { escsecaoId: 2, escfuncIds: [22], codigo: '035.02.004', secao: 'Transportes', completa: true, criticas: 0, podeOficializar: true },
      { escsecaoId: 3, escfuncIds: [33], codigo: '035.03.001', secao: 'Serviços a Clientes', completa: true, criticas: 0, podeOficializar: true },
      { escsecaoId: 4, codigo: '035.02.012', secao: 'Estacionamento', completa: false, criticas: 1, podeOficializar: false },
      { escsecaoId: 5, codigo: '035.03.008', secao: 'Fiscal Remoto', completa: true, criticas: 0, podeOficializar: true }
    ] };
  };
  rmIntegrationService.validarPreRequisitosRm = async ({ escsecaoId, escfuncIds }) => {
    assert.deepEqual(escfuncIds, { 1: [11], 2: [22], 3: [33] }[escsecaoId]);
    return { errors: escsecaoId === 3 ? ['CPF ausente.'] : [] };
  };
  escalaService.oficializarEscala = async ({ escsecaoId, escfuncIds }) => {
    assert.deepEqual(escfuncIds, { 1: [11], 2: [22] }[escsecaoId]);
    approved.push(escsecaoId);
    return { affectedRows: 2, revisao: 7, operacaoId: `operation-${escsecaoId}` };
  };
  rmIntegrationService.processarOperacaoRm = async ({ operacaoId }) => {
    sent.push(operacaoId);
    return { status: 'ENVIADO', enviados: 2, falhas: 0 };
  };
  auditService.registerAudit = async ({ details }) => { audited.push(details.escsecaoId); };
  try {
    const res = response();
    await handle({ body: { lojaId: 35, mesRef: '2026-11-01', escsecaoId: 2 },
      user: { perfil: 'LIDER', sub: 1 } }, res, (error) => { throw error; });
    assert.equal(res.code, 200);
    assert.deepEqual(approved, [2, 1]);
    assert.deepEqual(sent, ['operation-2', 'operation-1']);
    assert.deepEqual(audited, [2, 1]);
    assert.deepEqual(res.body.relacionadas.map((item) => [item.escsecaoId, item.status]),
      [[3, 'IGNORADA'], [1, 'OFICIALIZADA']]);
    assert.equal(res.body.relacionadas[0].motivo, 'CPF ausente.');
  } finally {
    accessService.getSecoesPermitidasUsuario = originals.getSecoesPermitidasUsuario;
    accessService.assertSecoesPermitidas = originals.assertSecoesPermitidas;
    officializationService.getProgress = originals.getProgress;
    rmIntegrationService.validarPreRequisitosRm = originals.validarPreRequisitosRm;
    rmIntegrationService.processarOperacaoRm = originals.processarOperacaoRm;
    escalaService.oficializarEscala = originals.oficializarEscala;
    auditService.registerAudit = originals.registerAudit;
  }
});

test('a linked section changed during approval is reported without hiding the primary success', async () => {
  const handle = router.stack.find((layer) => layer.route?.path === '/oficializar').route.stack.at(-1).handle;
  const originals = {
    getSecoesPermitidasUsuario: accessService.getSecoesPermitidasUsuario,
    assertSecoesPermitidas: accessService.assertSecoesPermitidas,
    getProgress: officializationService.getProgress,
    validarPreRequisitosRm: rmIntegrationService.validarPreRequisitosRm,
    processarOperacaoRm: rmIntegrationService.processarOperacaoRm,
    oficializarEscala: escalaService.oficializarEscala,
    registerAudit: auditService.registerAudit
  };
  accessService.getSecoesPermitidasUsuario = async () => [1, 2];
  accessService.assertSecoesPermitidas = async () => {};
  officializationService.getProgress = async () => ({ habilitada: true, secoes: [
    { escsecaoId: 1, escfuncIds: [11], codigo: '035.02.002', secao: 'Frente de Caixa', completa: true, criticas: 0, podeOficializar: true },
    { escsecaoId: 2, escfuncIds: [22], codigo: '035.02.004', secao: 'Transportes', completa: true, criticas: 0, podeOficializar: true }
  ] });
  rmIntegrationService.validarPreRequisitosRm = async () => ({ errors: [] });
  escalaService.oficializarEscala = async ({ escsecaoId }) => {
    if (escsecaoId === 2) throw Object.assign(new Error('A programacao mudou.'), { statusCode: 409 });
    return { affectedRows: 1, revisao: 7, operacaoId: 'operation-1' };
  };
  rmIntegrationService.processarOperacaoRm = async () => ({ status: 'ENVIADO' });
  auditService.registerAudit = async () => {};
  try {
    const res = response();
    await handle({ body: { lojaId: 35, mesRef: '2026-11-01', escsecaoId: 1 },
      user: { perfil: 'GERENTE', sub: 1 } }, res, (error) => { throw error; });
    assert.equal(res.code, 200);
    assert.equal(res.body.affectedRows, 1);
    assert.deepEqual(res.body.relacionadas.map((item) => [item.escsecaoId, item.status, item.motivo]),
      [[2, 'IGNORADA', 'A programacao mudou.']]);
  } finally {
    accessService.getSecoesPermitidasUsuario = originals.getSecoesPermitidasUsuario;
    accessService.assertSecoesPermitidas = originals.assertSecoesPermitidas;
    officializationService.getProgress = originals.getProgress;
    rmIntegrationService.validarPreRequisitosRm = originals.validarPreRequisitosRm;
    rmIntegrationService.processarOperacaoRm = originals.processarOperacaoRm;
    escalaService.oficializarEscala = originals.oficializarEscala;
    auditService.registerAudit = originals.registerAudit;
  }
});
