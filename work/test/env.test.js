const test = require('node:test');
const assert = require('node:assert/strict');
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
