const test = require('node:test');
const assert = require('node:assert/strict');
const { migrationNames, parseSinglePlsqlBlock, parseArgs, readMigration, checkPrerequisites } = require('../scripts/apply-oracle-migration');

test('executor accepts only the sixteen mirrored single-block migrations', () => {
  assert.equal(migrationNames.length, 16);
  for (const name of migrationNames) {
    const migration = readMigration(name);
    assert.match(migration.sql, /^(declare|begin)\b/i);
    assert.match(migration.sql, /\bend;$/i);
    assert.equal(migration.checksum.length, 64);
  }
});

test('Portaria preparation creates only missing subsections and rejects ambiguous destination', () => {
  const { sql } = readMigration('20261015_portaria_preparar_subsecao.sql');
  assert.match(sql, /if v_frentes <> 1 then/);
  assert.match(sql, /if v_porteiros > 1/);
  assert.equal((sql.match(/regexp_like\(trim\(frente\.cod_secao\), '\(\^\|\[\.\]\)02\[\.\]002\$'\)/g) || []).length, 2);
  assert.equal((sql.match(/s\.codfilial <> 999/g) || []).length, 2);
  assert.match(sql, /v_outras_funcoes > 0/);
  assert.match(sql, /nvl\(upper\(trim\(fn\.descr\)\), '\?'\) <> 'PORTEIRO'/);
  assert.match(sql, /if v_porteiros = 0 then\s+insert into sgn_esc_subsecao/i);
  assert.doesNotMatch(sql, /update sgn_esc_(?:funcionario|prog)/i);
  assert.doesNotMatch(sql, /\bcommit\b/i);
});

test('Portaria migration preserves officialized history and checks conflicting active schedules', () => {
  const { sql } = readMigration('20261015_portaria_migrar_frente_caixa.sql');
  assert.equal((sql.match(/regexp_like\(trim\(frente\.cod_secao\), '\(\^\|\[\.\]\)02\[\.\]002\$'\)/g) || []).length, 2);
  assert.equal((sql.match(/s\.codfilial <> 999/g) || []).length, 2);
  assert.match(sql, /if v_conflitos > 0 then\s+raise_application_error\(-20004/);
  assert.match(sql, /nvl\(upper\(trim\(fn\.descr\)\), '\?'\) <> 'PORTEIRO'/);
  assert.equal((sql.match(/upper\(trim\(fn\.descr\)\) = 'PORTEIRO'/g) || []).length, 3);
  assert.match(sql, /p\.oficializada = 0/);
  assert.match(sql, /p\.ativa = 1/);
  assert.match(sql, /atual\.escfunc_id = p\.escfunc_id/);
  assert.match(sql, /t\.status in \('P', 'E'\)/);
  assert.match(sql, /f\.escsubsecao_id = v_porteiro_id/);
  assert.doesNotMatch(sql, /\bcommit\b/i);
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
