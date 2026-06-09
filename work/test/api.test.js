const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

process.env.MOCK_DB_FILE = path.join(os.tmpdir(), `escala-mock-test-${process.pid}.json`);

const { app } = require('../src/server');
const { resetMockDb } = require('../scripts/reset-mock-db');

function startTestServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(0);
    server.once('listening', () => {
      const port = server.address().port;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
    server.once('error', reject);
  });
}

async function requestJson(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { response, body };
}

async function login(baseUrl) {
  const { response } = await requestJson(baseUrl, '/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login: 'admin', password: 'admin123' })
  });
  assert.equal(response.status, 200);
  return response.headers.get('set-cookie').split(';')[0];
}

test.beforeEach(() => {
  resetMockDb();
});

test.after(() => {
  fs.rmSync(process.env.MOCK_DB_FILE, { force: true });
});

test('login protects and unlocks authenticated APIs', async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const denied = await requestJson(baseUrl, '/api/state');
  assert.equal(denied.response.status, 401);

  const cookie = await login(baseUrl);
  const state = await requestJson(baseUrl, '/api/state', {
    headers: { Cookie: cookie }
  });

  assert.equal(state.response.status, 200);
  assert.deepEqual(state.body.escalasSalvas, []);
});

test('catalog returns stores and employees from mock database', async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());
  const cookie = await login(baseUrl);

  const lojas = await requestJson(baseUrl, '/api/catalog/lojas', { headers: { Cookie: cookie } });
  assert.equal(lojas.response.status, 200);
  assert.equal(lojas.body.lojas.length, 2);

  const funcionarios = await requestJson(baseUrl, '/api/catalog/lojas/101/funcionarios', { headers: { Cookie: cookie } });
  assert.equal(funcionarios.response.status, 200);
  assert.equal(funcionarios.body.funcionarios.length, 2);
  assert.equal(funcionarios.body.funcionarios[0].NOME, 'Ana Souza');
});

test('access API returns users, roles and allowed stores without password hashes', async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());
  const cookie = await login(baseUrl);

  const acessos = await requestJson(baseUrl, '/api/acessos/usuarios', {
    headers: { Cookie: cookie }
  });

  assert.equal(acessos.response.status, 200);
  assert.equal(acessos.body.usuarios.length, 2);
  assert.equal(acessos.body.usuarios[0].SENHA_HASH, undefined);
  assert.ok(acessos.body.usuarios.some((usuario) => usuario.LOGIN === 'gerente101' && usuario.PERFIL === 'GERENTE'));
});

test('structured schedule saves headers and days', async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());
  const cookie = await login(baseUrl);

  const payload = {
    lojaId: 101,
    mesRef: '2026-06-01',
    escalaOrigemId: 5001,
    funcionarios: [
      {
        escfuncId: 1,
        chapa: '000101',
        dias: [
          { data: '2026-06-01', hrEnt1: '08:00', hrSai1: '12:00', hrEnt2: '13:00', hrSai2: '17:20', programacao: 'TRB' }
        ]
      }
    ],
    oficializada: 0
  };

  const saved = await requestJson(baseUrl, '/api/escalas', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify(payload)
  });
  assert.equal(saved.response.status, 201);
  assert.equal(saved.body.saved.length, 1);

  const listed = await requestJson(baseUrl, '/api/escalas?lojaId=101&mesRef=2026-06-01', {
    headers: { Cookie: cookie }
  });
  assert.equal(listed.response.status, 200);
  assert.equal(listed.body.escalas.length, 1);
  assert.equal(listed.body.escalas[0].NOME, 'Ana Souza');

  const dias = await requestJson(baseUrl, `/api/escalas/${saved.body.saved[0].escprogId}/dias`, {
    headers: { Cookie: cookie }
  });
  assert.equal(dias.response.status, 200);
  assert.equal(dias.body.dias.length, 1);
});

test('absence validation blocks scheduled work during absence', async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());
  const cookie = await login(baseUrl);

  const blocked = await requestJson(baseUrl, '/api/escalas', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: JSON.stringify({
      lojaId: 101,
      mesRef: '2026-06-01',
      escalaOrigemId: 5002,
      funcionarios: [
        {
          escfuncId: 2,
          chapa: '000102',
          dias: [
            { data: '2026-06-10', hrEnt1: '13:00', hrSai1: '17:00', hrEnt2: '18:00', hrSai2: '22:20', programacao: 'TRB' }
          ]
        }
      ]
    })
  });

  assert.equal(blocked.response.status, 422);
  assert.match(blocked.body.errors[0], /ausencia/i);
});

test('saving same UI scale origin creates new revision without duplicates', async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());
  const cookie = await login(baseUrl);

  const body = {
    lojaId: 101,
    mesRef: '2026-06-01',
    escalaOrigemId: 6001,
    funcionarios: [
      {
        escfuncId: 1,
        chapa: '000101',
        dias: [
          { data: '2026-06-01', hrEnt1: '08:00', hrSai1: '12:00', hrEnt2: '13:00', hrSai2: '17:20', programacao: 'TRB' }
        ]
      }
    ]
  };

  await requestJson(baseUrl, '/api/escalas', { method: 'POST', headers: { Cookie: cookie }, body: JSON.stringify(body) });
  await requestJson(baseUrl, '/api/escalas', { method: 'POST', headers: { Cookie: cookie }, body: JSON.stringify(body) });

  const listed = await requestJson(baseUrl, '/api/escalas?lojaId=101&mesRef=2026-06-01', {
    headers: { Cookie: cookie }
  });

  assert.equal(listed.body.escalas.length, 1);
  assert.equal(listed.body.escalas[0].REVISAO, 2);
});
