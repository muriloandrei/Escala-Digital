const test = require('node:test');
const assert = require('node:assert/strict');
const { errorHandler } = require('../src/middleware/errorHandler');

test('error handler returns generic 500 with request id and logs sanitized context', () => {
  const originalError = console.error;
  const logs = [];
  console.error = (message) => logs.push(message);

  try {
    const req = {
      id: 'req-123',
      method: 'GET',
      originalUrl: '/api/teste'
    };
    const res = {
      headersSent: false,
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      }
    };
    const error = new Error('ORA-00942: table or view does not exist');
    error.code = 'ORA-00942';
    error.errorNum = 942;

    errorHandler(error, req, res, () => {});

    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { error: 'Erro interno do servidor.', requestId: 'req-123' });
    assert.equal(logs.length, 1);
    const parsed = JSON.parse(logs[0]);
    assert.equal(parsed.event, 'server_error');
    assert.equal(parsed.requestId, 'req-123');
    assert.equal(parsed.code, 'ORA-00942');
    assert.equal(parsed.errorNum, 942);
    assert.equal(parsed.path, '/api/teste');
  } finally {
    console.error = originalError;
  }
});
