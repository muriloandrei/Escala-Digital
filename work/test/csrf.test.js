const test = require('node:test');
const assert = require('node:assert/strict');
const { _private } = require('../src/middleware/csrf');

function makeReq({ method = 'POST', path = '/api/escalas', origin = '', referer = '', host = 'localhost:3000', proto = 'http' } = {}) {
  return {
    method,
    path,
    protocol: proto,
    get(header) {
      const values = {
        origin,
        referer,
        host,
        'x-forwarded-proto': proto
      };
      return values[String(header).toLowerCase()] || '';
    }
  };
}

test('csrf guard allows safe methods and same-origin API writes', () => {
  assert.equal(_private.shouldBlockCsrf(makeReq({ method: 'GET', origin: 'http://evil.test' })), false);
  assert.equal(_private.shouldBlockCsrf(makeReq({ origin: 'http://localhost:3000' })), false);
});

test('csrf guard blocks cross-origin API writes when origin is present', () => {
  assert.equal(_private.shouldBlockCsrf(makeReq({ origin: 'http://evil.test' })), true);
});

test('csrf guard keeps curl and postman without origin compatible', () => {
  assert.equal(_private.shouldBlockCsrf(makeReq({ origin: '', referer: '' })), false);
});
