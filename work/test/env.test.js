const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { parseTrustProxy } = require('../src/config/env');

test('trust proxy accepts nginx hop configuration', () => {
  assert.equal(parseTrustProxy('true'), 1);
  assert.equal(parseTrustProxy('1'), 1);
  assert.equal(parseTrustProxy('2'), 2);
});

test('trust proxy stays disabled for direct HTTP access', () => {
  assert.equal(parseTrustProxy('false'), false);
  assert.equal(parseTrustProxy('0'), false);
  assert.equal(parseTrustProxy('off'), false);
});

test('React login destination requires an explicit environment flag', () => {
  const readFlag = (value) => execFileSync(process.execPath, [
    '-e', 'process.stdout.write(String(require("./src/config/env").getEnv().ui.reactDefault))'
  ], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    env: {
      ...process.env,
      JWT_SECRET: 'test-secret',
      ORACLE_USER: 'test',
      ORACLE_PASSWORD: 'test',
      ORACLE_CONNECT_STRING: 'test',
      REACT_DEFAULT_UI: value
    }
  }).trim();
  assert.equal(readFlag('false'), 'false');
  assert.equal(readFlag('true'), 'true');
});
