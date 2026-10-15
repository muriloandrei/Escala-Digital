const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');
const express = require('express');

test('leader suspends only employees in an allowed section and sees only their records', async () => {
  const created = [];
  const closed = [];
  const module = { exports: {} };
  const dependencies = {
    express,
    zod: require('zod'),
    '../middleware/auth': {
      requireAuth: (req, _res, next) => {
        req.user = { sub: 7, login: 'lider.frente10', perfil: 'LIDER', lojas: [10] };
        next();
      },
      requireLojaAccess: (_req, _res, next) => next(),
      requirePermission: () => (_req, _res, next) => next()
    },
    '../services/catalogService': {
      resolveLojaCodigo: async () => 10,
      listFuncionariosByLoja: async () => [
        { ESCFUNC_ID: 1, ESCSECAO_ID: 20 },
        { ESCFUNC_ID: 2, ESCSECAO_ID: 30 }
      ]
    },
    '../services/accessService': {
      isGlobalStoreAccessUser: () => false,
      getSecoesPermitidasUsuario: async () => [20],
      getPermissaoPerfil: async () => ({ PODE_EDITAR: 1 }),
      assertSecoesPermitidas: async (_user, _loja, sections) => {
        if (sections.some((section) => Number(section) !== 20)) {
          const error = new Error('Secao nao permitida.');
          error.statusCode = 403;
          throw error;
        }
      }
    },
    '../services/pendenciaFuncionarioService': {
      listar: async () => [
        { ESCPEND_ID: 11, ESCFUNC_ID: 1, ESCSECAO_ID: 20, STATUS: 'P', JUSTIFICATIVA: 'Motivo permitido' },
        { ESCPEND_ID: 12, ESCFUNC_ID: 2, ESCSECAO_ID: 30, STATUS: 'P', JUSTIFICATIVA: 'Motivo restrito' }
      ],
      criar: async (payload) => { created.push(payload); return { id: 13, impacto: {} }; },
      encerrar: async (payload) => { closed.push(payload); return true; }
    },
    '../services/subsectionTransferService': {},
    '../services/auditService': { registerAudit: async () => {} },
    '../domain/shiftValidation': { validateStandardShift: () => [] }
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/routes/catalogRoutes.js'), 'utf8');
  vm.runInNewContext(source, { module, require: (name) => dependencies[name], console });
  const app = express();
  app.use(express.json());
  app.use('/api/catalog', module.exports);
  app.use((error, _req, res, _next) => res.status(error.statusCode || 500).json({ error: error.message }));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}/api/catalog`;
    const list = await fetch(`${base}/suspensoes-funcionarios?lojaId=10`);
    assert.equal(list.status, 200);
    const records = (await list.json()).suspensoes;
    assert.equal(records.length, 1);
    assert.equal(records[0].ESCFUNC_ID, 1);
    assert.equal(records[0].JUSTIFICATIVA, 'Motivo permitido');

    const create = (id) => fetch(`${base}/lojas/10/funcionarios/${id}/suspensoes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'OUTRO', inicio: '2026-10-15', justificativa: 'Ajuste operacional' })
    });
    assert.equal((await create(1)).status, 201);
    assert.equal((await create(2)).status, 403);
    assert.equal(created.length, 1);

    assert.equal((await fetch(`${base}/lojas/10/suspensoes/11/encerrar`, { method: 'POST' })).status, 200);
    assert.equal((await fetch(`${base}/lojas/10/suspensoes/12/encerrar`, { method: 'POST' })).status, 403);
    assert.equal(closed.length, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
