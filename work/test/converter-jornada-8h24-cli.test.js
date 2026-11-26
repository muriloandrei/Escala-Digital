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

test('conversao calcula nova saida fora dos comandos SQL Oracle', () => {
  const block = loadBlock(true);
  const dml = block.match(/(?:merge into|update sgn_esc_)[\s\S]*?;/gi) || [];
  assert.equal(dml.length >= 5, true);
  for (const statement of dml) assert.doesNotMatch(statement, /\bnova_saida\s*\(/i);
  assert.equal((block.match(/v_saida_824 := nova_saida\(/g) || []).length, 5);
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
