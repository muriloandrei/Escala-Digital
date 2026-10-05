const test = require('node:test');
const assert = require('node:assert/strict');
const { migrationNames, parseSinglePlsqlBlock, parseArgs, readMigration, checkPrerequisites } = require('../scripts/apply-oracle-migration');

test('executor accepts only the ten mirrored single-block migrations', () => {
  assert.equal(migrationNames.length, 10);
  for (const name of migrationNames) {
    const migration = readMigration(name);
    assert.match(migration.sql, /^(declare|begin)\b/i);
    assert.match(migration.sql, /\bend;$/i);
    assert.equal(migration.checksum.length, 64);
  }
});

test('executor rejects extra SQLPlus commands and multiple blocks', () => {
  assert.throws(() => parseSinglePlsqlBlock('begin null; end;\n/\nbegin null; end;\n/'), /Formato nao suportado/);
  assert.throws(() => parseSinglePlsqlBlock('prompt test\nbegin null; end;\n/'), /Formato nao suportado/);
  assert.throws(() => parseSinglePlsqlBlock('begin null; end;'), /terminar/);
});

test('executor requires explicit apply flag, operator and approved filename', () => {
  const name = migrationNames[0];
  assert.deepEqual(parseArgs(['node', 'script', '--name', name]), { name, apply: false });
  assert.deepEqual(parseArgs(['node', 'script', '--name', name, '--apply', '--by', 'opc']), { name, apply: true, by: 'opc' });
  assert.throws(() => parseArgs(['node', 'script', '--name', 'qualquer.sql', '--apply', '--by', 'opc']), /arquivos aprovados/);
  assert.throws(() => parseArgs(['node', 'script', '--name', name, '--apply']), /--by OPERADOR/);
});

test('executor refuses a wrong schema or missing migration ledger', async () => {
  const connection = {
    execute: async (sql) => ({ rows: [{
      ...(sql.includes('schema_user') ? { SCHEMA_USER: 'OUTRO' } : { TOTAL: 2 })
    }] })
  };
  await assert.rejects(checkPrerequisites(connection, readMigration(migrationNames[0]), 'ESCALA'), /difere de ORACLE_USER/);
  connection.execute = async (sql) => ({ rows: [{
    ...(sql.includes('schema_user') ? { SCHEMA_USER: 'ESCALA' } : { TOTAL: sql.includes('SGN_ESC_MIGRACAO') ? 0 : 2 })
  }] });
  await assert.rejects(checkPrerequisites(connection, readMigration(migrationNames[1]), 'ESCALA'), /Aplique primeiro/);
});
