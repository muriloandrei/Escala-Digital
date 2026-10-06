const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { getEnv } = require('../src/config/env');
const { initOraclePool, closeOraclePool, withConnection, oracledb } = require('../src/db/oracle');

const migrationNames = [
  '20260929_registro_migrations.sql',
  '20260929_pendencia_operacional_funcionario.sql',
  '20260929_eventos_escala.sql',
  '20260929_pendencias_envio_rm.sql',
  '20260930_rm_envio_escopo_unique.sql',
  '20260930_treinamento_progresso.sql',
  '20261001_evento_subsecao.sql',
  '20261001_treinamento_tour_v2.sql',
  '20261001_transferencia_subsecao_agendada.sql',
  '20261005_auditoria_mes_revisao.sql',
  '20261006_treinamento_tour_v3.sql'
];

function parseSinglePlsqlBlock(source) {
  const lines = String(source).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim().split('\n');
  if (lines[0].trim().toLowerCase() === 'set define off') lines.shift();
  while (lines.length && !lines[0].trim()) lines.shift();
  if (lines.pop()?.trim() !== '/') throw new Error('Migration deve terminar com uma unica linha / do SQL*Plus.');
  const sql = lines.join('\n').trim();
  if (!/^(declare|begin)\b/i.test(sql) || !/\bend;\s*$/i.test(sql)
      || lines.some((line) => /^\s*(?:\/\s*$|@|set\s|prompt\s|spool\s|connect\s|whenever\s)/i.test(line))) {
    throw new Error('Formato nao suportado: esperado um unico bloco PL/SQL sem outros comandos SQL*Plus.');
  }
  return sql;
}

function readMigration(name) {
  if (!migrationNames.includes(name)) throw new Error('Migration fora da lista aprovada para este executor.');
  const root = path.resolve(__dirname, '..');
  const source = fs.readFileSync(path.join(root, 'db', 'migrations', name));
  const mirror = fs.readFileSync(path.join(root, 'docker', 'oracle', 'migrations', name));
  const checksum = (value) => crypto.createHash('sha256').update(value).digest('hex');
  if (checksum(source) !== checksum(mirror)) throw new Error('SQL divergente entre db/migrations e docker/oracle/migrations.');
  return { name, checksum: checksum(source), sql: parseSinglePlsqlBlock(source.toString('utf8')) };
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length < 2 || args[0] !== '--name' || !migrationNames.includes(args[1])) {
    throw new Error('Use --name NOME.sql [--apply --by OPERADOR], com um dos arquivos aprovados.');
  }
  const tail = args.slice(2);
  if (!tail.length) return { name: args[1], apply: false };
  if (tail.length !== 3 || tail[0] !== '--apply' || tail[1] !== '--by'
      || !/^[\w.@-]{1,100}$/.test(tail[2])) {
    throw new Error('Para executar, use --apply --by OPERADOR. Sem --apply o comando apenas consulta o banco.');
  }
  return { name: args[1], apply: true, by: tail[2] };
}

async function checkPrerequisites(connection, migration, expectedOracleUser) {
  const expectedUser = expectedOracleUser.toUpperCase();
  const userResult = await connection.execute('select user as schema_user from dual', {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
  const schemaUser = String(userResult.rows[0]?.SCHEMA_USER || '').toUpperCase();
  if (schemaUser !== expectedUser) throw new Error(`Schema conectado ${schemaUser} difere de ORACLE_USER ${expectedUser}.`);
  const base = await connection.execute(
    "select count(*) as total from user_tables where table_name in ('SGN_ESC_PROG', 'SGN_ESC_FUNCIONARIO')",
    {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  if (Number(base.rows[0]?.TOTAL) !== 2) throw new Error('Tabelas base da escala ausentes neste schema; confira ORACLE_USER.');
  const ledgerResult = await connection.execute(
    "select count(*) as total from user_tables where table_name = 'SGN_ESC_MIGRACAO'",
    {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const hasLedger = Number(ledgerResult.rows[0]?.TOTAL) > 0;
  if (!hasLedger && migration.name !== migrationNames[0]) {
    throw new Error('Aplique primeiro 20260929_registro_migrations.sql.');
  }
  const applied = new Map();
  if (hasLedger) {
    const result = await connection.execute(
      'select arquivo, checksum_sha256 from sgn_esc_migracao',
      {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    for (const row of result.rows) applied.set(row.ARQUIVO, row.CHECKSUM_SHA256);
  }
  const current = applied.get(migration.name);
  if (current && current !== migration.checksum) throw new Error('Migration registrada com checksum diferente; investigue antes de prosseguir.');
  if (!current) {
    const index = migrationNames.indexOf(migration.name);
    for (const previousName of migrationNames.slice(0, index)) {
      if (applied.get(previousName) !== readMigration(previousName).checksum) {
        throw new Error(`Migration anterior sem registro confirmado: ${previousName}.`);
      }
    }
  }
  if (!current && migration.name === '20260930_rm_envio_escopo_unique.sql') {
    const duplicate = await connection.execute(
      `select count(*) as total from (
         select 1 from sgn_esc_rm_envio
         group by loja, mes_ref, escsecao_id, escfunc_id, revisao
         having count(*) > 1
       )`,
      {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (Number(duplicate.rows[0]?.TOTAL) > 0) throw new Error('Ha duplicatas na chave da fila RM; nao aplique a restricao antes de investigar.');
  }
  return { schemaUser, alreadyApplied: Boolean(current) };
}

async function main() {
  const args = parseArgs(process.argv);
  const migration = readMigration(args.name);
  await initOraclePool();
  try {
    await withConnection(async (connection) => {
      const status = await checkPrerequisites(connection, migration, getEnv().oracle.user);
      console.log(`Schema: ${status.schemaUser}; arquivo: ${migration.name}; SHA-256: ${migration.checksum}`);
      if (status.alreadyApplied) {
        console.log('Ja registrada com checksum identico. Nenhuma alteracao executada.');
        return;
      }
      if (!args.apply) {
        console.log('Preflight aprovado. Nenhuma alteracao executada; use --apply --by OPERADOR para aplicar.');
        return;
      }
      console.log('Aplicando um bloco PL/SQL. DDL Oracle pode fazer commit implicito.');
      await connection.execute(migration.sql);
      try {
        await connection.execute(
          `insert into sgn_esc_migracao (arquivo, checksum_sha256, aplicado_por)
           values (:arquivo, :checksum, :aplicadoPor)`,
          { arquivo: migration.name, checksum: migration.checksum, aplicadoPor: args.by },
          { autoCommit: false }
        );
        await connection.commit();
      } catch (error) {
        throw new Error(`SQL executado, mas o registro falhou: ${error.message}. O DDL pode ter sido confirmado; investigue antes de repetir.`);
      }
      console.log(`Aplicada e registrada: ${migration.name}.`);
    });
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Migration interrompida: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { migrationNames, parseSinglePlsqlBlock, parseArgs, readMigration, checkPrerequisites };
