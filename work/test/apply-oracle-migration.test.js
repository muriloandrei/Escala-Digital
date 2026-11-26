const test = require('node:test');
const assert = require('node:assert/strict');
const { migrationNames, parseSinglePlsqlBlock, parseArgs, readMigration, checkPrerequisites } = require('../scripts/apply-oracle-migration');

test('executor accepts only the approved mirrored single-block migrations', () => {
  assert.equal(migrationNames.length, 36);
  for (const name of migrationNames) {
    const migration = readMigration(name);
    assert.match(migration.sql, /^(declare|begin)\b/i);
    assert.match(migration.sql, /\bend;$/i);
    assert.equal(migration.checksum.length, 64);
  }
});

test('apprentice journey repair preserves the recorded migration and requires its column', () => {
  const crypto = require('node:crypto');
  const fs = require('node:fs');
  const path = require('node:path');
  const previous = fs.readFileSync(path.join(__dirname, '../db/migrations/20261125_jornadas_aprendiz_livres.sql'));
  assert.equal(crypto.createHash('sha256').update(previous).digest('hex'),
    '50f4f8d5a99b3f13986bc9d46d6d88ca658320c30ff2dd8ea705d2530ac5756c');
  const { sql } = readMigration('20261125_reparar_jornadas_aprendiz.sql');
  assert.match(sql, /add \(liberar_horario_aprendiz number\(1\) default 0 not null\)/i);
  assert.match(sql, /execute immediate q'\[\s*merge into sgn_esc_horario_padrao/i);
  assert.match(sql, /execute immediate q'\[\s*update sgn_esc_horario_padrao\s+set liberar_horario_aprendiz/i);
  const schemaCheck = require('node:fs').readFileSync(require('node:path').join(__dirname, '../scripts/check-schema.js'), 'utf8');
  assert.match(schemaCheck, /SGN_ESC_HORARIO_PADRAO: \[[^\]]*'LIBERAR_HORARIO_APRENDIZ'/);
});

test('apprentice standard profile is versioned after the repair without changing its checksum', () => {
  const { sql } = readMigration('20261125_aprendiz_5h_15min_intervalo.sql');
  assert.match(sql, /300 jornada, 15 intervalo/i);
  assert.match(sql, /liberar_horario_aprendiz = 1/i);
  assert.match(sql, /insert into sgn_esc_horpad_loja/i);
});

test('officialization migration preserves operational profiles without granting custom profiles', () => {
  const { sql } = readMigration('20261123_oficializacao_por_perfil.sql');
  assert.match(sql, /PODE_OFICIALIZAR = case/i);
  assert.match(sql, /upper\(p\.NOME\) in \('LIDER', 'GERENTE', 'RH'\)/i);
  assert.match(sql, /upper\(p\.NOME\) <> 'ADMIN'/i);
});

test('monthly base hours and Sunday 1x1 store configuration are versioned', () => {
  const monthly = readMigration('20261118_horario_base_mensal.sql').sql;
  const sunday = readMigration('20261118_domingo_1x1_por_loja.sql').sql;
  assert.match(monthly, /primary key \(escfunc_id, mes_ref\)/i);
  assert.match(sunday, /domingo_1x1_habilitado number\(1\) default 1 not null/i);
  assert.match(sunday, /loja between 400 and 499 or loja between 700 and 799/i);
});

test('journey assignments seed 08:24 for practical stores', () => {
  const sql = readMigration('20261118_horarios_padrao_por_loja.sql').sql;
  assert.match(sql, /create table sgn_esc_horpad_loja/i);
  assert.match(sql, /execute immediate q'\[\s*insert into sgn_esc_horpad_loja/i);
  assert.match(sql, /l\.loja between 400 and 499 and h\.jornada_minutos = 504/i);
  assert.match(sql, /h\.intervalo_minutos in \(70, 100\)/i);
});

test('08:24 journey migration is approved and reaches every existing store', () => {
  const sql = readMigration('20261126_jornada_8h24_todas_lojas.sql').sql;
  assert.match(sql, /h\.jornada_minutos = 504 and h\.intervalo_minutos = 70/i);
  assert.match(sql, /cross join sgn_esc_loja l/i);
  assert.match(sql, /merge into sgn_esc_horpad_loja/i);
});

test('duration-only profiles can omit fixed clock times after migration', () => {
  const { sql } = readMigration('20261112_horarios_padrao_duracoes.sql');
  assert.match(sql, /SGN_ESC_HORARIO_PADRAO/);
  assert.match(sql, /HR_ENT1.*HR_SAI1.*HR_ENT2.*HR_SAI2/);
  assert.match(sql, /modify \('/);
});

test('selected shift duration is stored on schedule and fixed days', () => {
  const { sql } = readMigration('20261112_jornada_selecionada_dia.sql');
  assert.match(sql, /SGN_ESC_PROG_DIA.*JORNADA_MINUTOS/s);
  assert.match(sql, /SGN_ESC_PROG_DIA.*INTERVALO_MINUTOS/s);
  assert.match(sql, /SGN_ESC_FIXO_ESCALA.*JORNADA_MINUTOS/s);
  assert.match(sql, /SGN_ESC_FIXO_ESCALA.*INTERVALO_MINUTOS/s);
});

test('Sunday 6h migration compiles before the new column exists', () => {
  const { sql } = readMigration('20261105_domingo_6h_lojas.sql');
  assert.match(sql, /execute immediate 'update sgn_esc_loja set domingo_6h_habilitado = 1/i);
  assert.doesNotMatch(sql, /^\s*update sgn_esc_loja set domingo_6h_habilitado/gim);
  assert.match(sql, /from user_constraints/);
});

test('Portaria unification preserves officialized records and loja 999', () => {
  const { sql } = readMigration('20261016_unificar_portaria_porteiro.sql');
  assert.match(sql, /p\.oficializada = 0/);
  assert.match(sql, /p\.mes_ref >= trunc\(sysdate, 'MM'\)/);
  assert.match(sql, /s\.codfilial <> 999/);
  assert.match(sql, /f\.escsubsecao_id = v_porteiro_id/);
  assert.match(sql, /nvl\(f\.escsubsecao_id, -1\) <> v_porteiro_id/);
  assert.match(sql, /if v_conflitos > 0 then/);
  assert.doesNotMatch(sql, /\bcommit\b/i);
});

test('Portaria unification allows older Front revisions but rejects true conflicts', () => {
  const { sql } = readMigration('20261016_unificar_portaria_porteiro.sql');
  assert.match(sql, /atual\.revisao = p\.revisao/);
  assert.match(sql, /atual\.revisao >= \(\s*select max\(p2\.revisao\)/);
  assert.match(sql, /p2\.escsecao_id = origem\.escsecao_id/);
  assert.match(sql, /p2\.ativa = 1 and p2\.oficializada = 0/);
});

test('Portaria unification creates only missing Porteiro destinations', () => {
  const { sql } = readMigration('20261016_unificar_portaria_porteiro.sql');
  assert.match(sql, /if v_destinos <> 1 then/);
  assert.match(sql, /if v_porteiros > 1 or \(v_porteiros = 1 and v_porteiros_ativos <> 1\) then/);
  assert.match(sql, /if v_porteiros = 0 then\s+insert into sgn_esc_subsecao/);
  assert.match(sql, /sgn_esc_subsecao_seq\.nextval, v_frente_id, 'Porteiro', 'A'/);
  assert.doesNotMatch(sql, /\bcommit\b/i);
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
  assert.throws(() => parseSinglePlsqlBlock('begin\n  set serveroutput on\nend;\n/'), /Formato nao suportado/);
  assert.match(parseSinglePlsqlBlock('begin\n  update tabela\n     set coluna = 1;\nend;\n/'), /set coluna = 1/);
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

test('apprentice repair accepts confirmed original despite unrelated legacy ledger gaps', async () => {
  const originalName = '20261125_jornadas_aprendiz_livres.sql';
  const repair = readMigration('20261125_reparar_jornadas_aprendiz.sql');
  const required = {
    SGN_ESC_HORARIO_PADRAO: ['ESCHORPAD_ID', 'DESCR', 'HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2',
      'JORNADA_MINUTOS', 'INTERVALO_MINUTOS', 'STATUS', 'DT_HR_INCL'],
    SGN_ESC_HORPAD_LOJA: ['ESCHORPAD_ID', 'LOJA'],
    SGN_ESC_LOJA: ['LOJA']
  };
  const columns = Object.entries(required).flatMap(([TABLE_NAME, fields]) => fields
    .map((COLUMN_NAME) => ({ TABLE_NAME, COLUMN_NAME })));
  let recordedChecksum = readMigration(originalName).checksum;
  let availableColumns = columns;
  const connection = { execute: async (sql) => {
    if (sql.includes('schema_user')) return { rows: [{ SCHEMA_USER: 'ESCALAINT' }] };
    if (sql.includes("table_name in ('SGN_ESC_PROG'")) return { rows: [{ TOTAL: 2 }] };
    if (sql.includes("table_name = 'SGN_ESC_MIGRACAO'")) return { rows: [{ TOTAL: 1 }] };
    if (sql.includes('from sgn_esc_migracao')) return { rows: [{ ARQUIVO: originalName, CHECKSUM_SHA256: recordedChecksum }] };
    if (sql.includes('from user_tab_columns')) return { rows: availableColumns };
    if (sql.includes('from user_sequences')) return { rows: [{ SEQUENCE_NAME: 'SGN_ESC_HORARIO_PADRAO_SEQ' }] };
    throw new Error(`SQL inesperado: ${sql}`);
  } };
  assert.deepEqual(await checkPrerequisites(connection, repair, 'ESCALAINT'),
    { schemaUser: 'ESCALAINT', alreadyApplied: false });
  recordedChecksum = 'outro-checksum';
  await assert.rejects(checkPrerequisites(connection, repair, 'ESCALAINT'), /Migration anterior sem registro confirmado/);
  recordedChecksum = readMigration(originalName).checksum;
  availableColumns = columns.filter((row) => row.COLUMN_NAME !== 'JORNADA_MINUTOS');
  await assert.rejects(checkPrerequisites(connection, repair, 'ESCALAINT'), /Dependencias da reparacao ausentes/);
});

test('apprentice standard requires the confirmed repair and its column', async () => {
  const repair = readMigration('20261125_reparar_jornadas_aprendiz.sql');
  const standard = readMigration('20261125_aprendiz_5h_15min_intervalo.sql');
  const required = {
    SGN_ESC_HORARIO_PADRAO: ['ESCHORPAD_ID', 'DESCR', 'HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2',
      'JORNADA_MINUTOS', 'INTERVALO_MINUTOS', 'STATUS', 'DT_HR_INCL', 'LIBERAR_HORARIO_APRENDIZ'],
    SGN_ESC_HORPAD_LOJA: ['ESCHORPAD_ID', 'LOJA'], SGN_ESC_LOJA: ['LOJA']
  };
  let ledger = [];
  const columns = Object.entries(required).flatMap(([TABLE_NAME, fields]) => fields
    .map((COLUMN_NAME) => ({ TABLE_NAME, COLUMN_NAME })));
  const connection = { execute: async (sql) => {
    if (sql.includes('schema_user')) return { rows: [{ SCHEMA_USER: 'ESCALAINT' }] };
    if (sql.includes("table_name in ('SGN_ESC_PROG'")) return { rows: [{ TOTAL: 2 }] };
    if (sql.includes("table_name = 'SGN_ESC_MIGRACAO'")) return { rows: [{ TOTAL: 1 }] };
    if (sql.includes('from sgn_esc_migracao')) return { rows: ledger };
    if (sql.includes('from user_tab_columns')) return { rows: columns };
    if (sql.includes('from user_sequences')) return { rows: [{ SEQUENCE_NAME: 'SGN_ESC_HORARIO_PADRAO_SEQ' }] };
    throw new Error(`SQL inesperado: ${sql}`);
  } };
  await assert.rejects(checkPrerequisites(connection, standard, 'ESCALAINT'), /Migration anterior sem registro confirmado/);
  ledger = [{ ARQUIVO: repair.name, CHECKSUM_SHA256: repair.checksum }];
  assert.deepEqual(await checkPrerequisites(connection, standard, 'ESCALAINT'),
    { schemaUser: 'ESCALAINT', alreadyApplied: false });
  ledger = [{ ARQUIVO: '20261125_reparar_jornadas_aprendiz_v2.sql',
    CHECKSUM_SHA256: readMigration('20261125_reparar_jornadas_aprendiz_v2.sql').checksum }];
  assert.deepEqual(await checkPrerequisites(connection, standard, 'ESCALAINT'),
    { schemaUser: 'ESCALAINT', alreadyApplied: false });
});

test('08:24 migration checks schema without requiring unrelated historical ledger entries', async () => {
  const migration = readMigration('20261126_jornada_8h24_todas_lojas.sql');
  const required = {
    SGN_ESC_HORARIO_PADRAO: ['ESCHORPAD_ID', 'DESCR', 'HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2',
      'JORNADA_MINUTOS', 'INTERVALO_MINUTOS', 'STATUS', 'DT_HR_INCL'],
    SGN_ESC_HORPAD_LOJA: ['ESCHORPAD_ID', 'LOJA'], SGN_ESC_LOJA: ['LOJA']
  };
  let columns = Object.entries(required).flatMap(([TABLE_NAME, fields]) => fields
    .map((COLUMN_NAME) => ({ TABLE_NAME, COLUMN_NAME })));
  const connection = { execute: async (sql) => {
    if (sql.includes('schema_user')) return { rows: [{ SCHEMA_USER: 'ESCALAINT' }] };
    if (sql.includes("table_name in ('SGN_ESC_PROG'")) return { rows: [{ TOTAL: 2 }] };
    if (sql.includes("table_name = 'SGN_ESC_MIGRACAO'")) return { rows: [{ TOTAL: 1 }] };
    if (sql.includes('from sgn_esc_migracao')) return { rows: [] };
    if (sql.includes('from user_tab_columns')) return { rows: columns };
    if (sql.includes('from user_sequences')) return { rows: [{ SEQUENCE_NAME: 'SGN_ESC_HORARIO_PADRAO_SEQ' }] };
    throw new Error(`SQL inesperado: ${sql}`);
  } };
  assert.deepEqual(await checkPrerequisites(connection, migration, 'ESCALAINT'),
    { schemaUser: 'ESCALAINT', alreadyApplied: false });
  columns = columns.filter((row) => row.COLUMN_NAME !== 'LOJA');
  await assert.rejects(checkPrerequisites(connection, migration, 'ESCALAINT'), /Dependencias da reparacao ausentes/);
});

test('replacement apprentice repair skips already nullable columns and supersedes the failed repair', async () => {
  const replacement = readMigration('20261125_reparar_jornadas_aprendiz_v2.sql');
  assert.match(replacement.sql, /nullable = 'N'/i);
  assert.match(replacement.sql, /for i in 1 \.\. v_colunas\.count loop/i);
  const publish = require('node:fs').readFileSync(require('node:path')
    .join(__dirname, '../scripts/publicar-oracle-linux.sh'), 'utf8');
  assert.match(publish, /reparar_jornadas_aprendiz\.sql.*reparar_jornadas_aprendiz_v2\.sql/s);
});
