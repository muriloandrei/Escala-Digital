const fs = require('node:fs');
const path = require('node:path');
const { getEnv } = require('../src/config/env');
const { withConnection, closeOraclePool, oracledb } = require('../src/db/oracle');
const { readMigration } = require('./apply-oracle-migration');

const migrationName = '20261126_jornada_8h24_todas_lojas.sql';
const sqlFile = path.join(__dirname, '..', 'db', 'scripts', 'converter_jornada_8h48_para_8h24_dezembro_2026.sql');

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0) return { apply: false };
  if (args.length === 2 && args[0] === '--apply' && /^--by=[a-zA-Z0-9._-]{2,80}$/.test(args[1])) {
    return { apply: true, by: args[1].slice(5) };
  }
  throw new Error('Use sem argumentos para previa ou --apply --by=OPERADOR para executar.');
}

function loadBlock(apply) {
  const source = fs.readFileSync(sqlFile, 'utf8');
  const match = source.match(/^declare\b[\s\S]*^end;\s*\n\/\s*$/mi);
  const marker = 'v_aplicar constant number := 0;';
  if (!match || source.split(marker).length !== 2) throw new Error('Script SQL de conversao fora do formato esperado.');
  const block = match[0].replace(/\n\/\s*$/, '').trim();
  if (!block.includes(marker)) throw new Error('Marcador de previa ausente no bloco SQL.');
  return apply ? block.replace(marker, 'v_aplicar constant number := 1;') : block;
}

async function assertDatabaseReady(connection, expectedSchema = getEnv().oracle.user) {
  const expected = expectedSchema.toUpperCase();
  const schema = await connection.execute('select user as schema_user from dual', {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
  if (String(schema.rows[0]?.SCHEMA_USER || '').toUpperCase() !== expected) {
    throw new Error(`Schema Oracle inesperado; esperado ${expected}.`);
  }
  const migration = readMigration(migrationName);
  const ledger = await connection.execute(
    'select checksum_sha256 from sgn_esc_migracao where arquivo = :name',
    { name: migrationName }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  if (ledger.rows[0]?.CHECKSUM_SHA256 !== migration.checksum) {
    throw new Error(`Confirme a migration ${migrationName} no Oracle antes da conversao.`);
  }
}

async function run({ apply, by }) {
  try {
    await withConnection(async (connection) => {
      await assertDatabaseReady(connection);
      await connection.execute('begin dbms_output.enable(null); end;');
      console.log(`${apply ? 'APLICACAO' : 'PREVIA'} da conversao 08:48 -> 08:24${by ? `; operador=${by}` : ''}.`);
      await connection.execute(loadBlock(apply), {}, { autoCommit: false });
      for (;;) {
        const result = await connection.execute('begin dbms_output.get_line(:line, :status); end;', {
          line: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 },
          status: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        });
        if (result.outBinds.status !== 0) break;
        console.log(result.outBinds.line);
      }
    });
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) {
  Promise.resolve().then(() => parseArgs(process.argv)).then(run)
    .catch((error) => { console.error(`Conversao interrompida: ${error.message}`); process.exitCode = 1; });
}

module.exports = { parseArgs, loadBlock, assertDatabaseReady, run };
