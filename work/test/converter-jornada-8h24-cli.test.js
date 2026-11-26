const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, loadBlock, assertDatabaseReady } = require('../scripts/converter-jornada-8h24-dezembro');
const { readMigration } = require('../scripts/apply-oracle-migration');

test('conversao 08:24 exige operador no apply e usa previa por padrao', () => {
  assert.deepEqual(parseArgs(['node', 'script']), { apply: false });
  assert.deepEqual(parseArgs(['node', 'script', '--apply', '--by=opc']), { apply: true, by: 'opc' });
  assert.throws(() => parseArgs(['node', 'script', '--apply']), /--by/);
  assert.throws(() => parseArgs(['node', 'script', '--apply', '--by=']), /--by/);
  assert.match(loadBlock(false), /v_aplicar constant number := 0;/);
  assert.match(loadBlock(true), /v_aplicar constant number := 1;/);
  assert.doesNotMatch(loadBlock(true), /\n\/\s*$/);
});

test('conversao 08:24 exige schema correto e migration confirmada', async () => {
  const checksum = readMigration('20261126_jornada_8h24_todas_lojas.sql').checksum;
  let recorded = checksum;
  let schema = 'ESCALAINT';
  const connection = { execute: async (sql) => sql.includes('schema_user')
    ? { rows: [{ SCHEMA_USER: schema }] } : { rows: [{ CHECKSUM_SHA256: recorded }] } };
  await assert.doesNotReject(assertDatabaseReady(connection, 'ESCALAINT'));
  recorded = 'outro-checksum';
  await assert.rejects(assertDatabaseReady(connection, 'ESCALAINT'), /Confirme a migration/);
  schema = 'OUTRO';
  await assert.rejects(assertDatabaseReady(connection, 'ESCALAINT'), /Schema Oracle inesperado/);
});
