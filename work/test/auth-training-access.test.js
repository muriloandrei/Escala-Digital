const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');
const express = require('express');

test('login comum ignora treinamento e acesso direto ao tour e negado', async () => {
  const ui = { reactDefault: true, reactAllowedLogins: ['admin', 'murilo.jesus'] };
  const progressCalls = [];
  const module = { exports: {} };
  const dependencies = {
    express,
    zod: require('zod'),
    '../config/env': { getEnv: () => ({ ui, auth: { cookieSecure: false, sessionMaxAgeMs: 3600000 }, nodeEnv: 'test' }) },
    '../config/reactUiAccess': require('../src/config/reactUiAccess'),
    '../config/trainingStages': require('../src/config/trainingStages'),
    '../services/authService': { login: async ({ login }) => ({ token: 'test-token', user: { sub: login === 'admin' ? 1 : 2, login } }) },
    '../services/trainingProgressService': { getProgress: async (id) => {
      progressCalls.push(id);
      return { stage: 0, persisted: true };
    } },
    '../middleware/auth': { requireAuth: (req, _res, next) => {
      req.user = { sub: req.get('x-test-login') === 'admin' ? 1 : 2, login: req.get('x-test-login') };
      next();
    } }
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/routes/authRoutes.js'), 'utf8');
  vm.runInNewContext(source, { module, require: (name) => dependencies[name], console });
  const app = express();
  app.use(express.json());
  app.use('/api/auth', module.exports);
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const login = async (name) => fetch(`${base}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: name, password: 'test' })
    });
    const normal = await login('lider.frente35');
    assert.equal(normal.status, 200);
    assert.equal((await normal.json()).startPath, '/app#/escalas-geradas');
    assert.deepEqual(progressCalls, []);
    const allowed = await login('admin');
    assert.equal(allowed.status, 200);
    assert.equal((await allowed.json()).startPath, '/nova/treinamento');
    assert.deepEqual(progressCalls, [1]);
    const deniedTour = await fetch(`${base}/api/auth/treinamento`, { headers: { 'x-test-login': 'lider.frente35' } });
    assert.equal(deniedTour.status, 403);
    const adminTour = await fetch(`${base}/api/auth/treinamento`, { headers: { 'x-test-login': 'admin' } });
    assert.equal(adminTour.status, 200);
    ui.reactAllowedLogins = ['*'];
    const released = await login('lider.frente35');
    assert.equal(released.status, 200);
    assert.equal((await released.json()).startPath, '/nova/treinamento');
    assert.deepEqual(progressCalls, [1, 1, 2]);
    const releasedTour = await fetch(`${base}/api/auth/treinamento`, { headers: { 'x-test-login': 'lider.frente35' } });
    assert.equal(releasedTour.status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
