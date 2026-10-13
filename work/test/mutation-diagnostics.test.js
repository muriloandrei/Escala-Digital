const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { attachMutationDiagnostics } = require('../src/middleware/mutationDiagnostics');

test('mutation diagnostics records an early disconnect without request payload', () => {
  const events = [];
  const response = new EventEmitter();
  response.writableEnded = false;
  attachMutationDiagnostics(
    { id: 'request-1', method: 'POST', path: '/api/escalas/gerar-secao', user: { login: 'lider64' } },
    response,
    { log: (value) => events.push(JSON.parse(value)) }
  );
  response.emit('close');
  assert.deepEqual(events.map((event) => event.event), ['mutation_started', 'mutation_connection_closed']);
  assert.equal(events[1].requestId, 'request-1');
  assert.equal(events[1].user, 'lider64');
});

test('completed mutation does not report a disconnected client', () => {
  const events = [];
  const response = new EventEmitter();
  response.writableEnded = true;
  attachMutationDiagnostics(
    { id: 'request-2', method: 'PATCH', path: '/api/escalas/funcionario/horario' },
    response,
    { log: (value) => events.push(JSON.parse(value)) }
  );
  response.emit('finish');
  response.emit('close');
  assert.deepEqual(events.map((event) => event.event), ['mutation_started']);
});
