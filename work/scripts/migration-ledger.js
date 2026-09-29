const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { initOraclePool, closeOraclePool, withConnection, oracledb } = require('../src/db/oracle');

const folder = path.resolve(__dirname, '../db/migrations');
const files = fs.readdirSync(folder).filter((name) => name.endsWith('.sql')).sort();
const checksum = (name) => crypto.createHash('sha256').update(fs.readFileSync(path.join(folder, name))).digest('hex');

function getArg(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? null : process.argv[index + 1];
}

async function main() {
  const mode = process.argv[2];
  if (!['status', 'record'].includes(mode)) throw new Error('Use status ou record.');
  const name = getArg('--name');
  if (mode === 'record' && (!files.includes(name) || !process.argv.includes('--confirm-applied'))) {
    throw new Error('Informe --name com um arquivo versionado e --confirm-applied somente depois de aplicar o SQL no banco.');
  }
  await initOraclePool();
  try {
    await withConnection(async (connection) => {
      const exists = await connection.execute(
        "select count(*) as total from user_tables where table_name = 'SGN_ESC_MIGRACAO'",
        {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (!Number(exists.rows[0]?.TOTAL)) {
        throw new Error('Registro de migrations ausente. Aplique 20260929_registro_migrations.sql antes de usar este comando.');
      }
      if (mode === 'record') {
        const appliedBy = String(getArg('--by') || process.env.USER || process.env.USERNAME || 'operador').slice(0, 100);
        await connection.execute(
          `insert into sgn_esc_migracao (arquivo, checksum_sha256, aplicado_por)
           values (:arquivo, :checksum, :aplicadoPor)`,
          { arquivo: name, checksum: checksum(name), aplicadoPor: appliedBy },
          { autoCommit: false }
        );
        await connection.commit();
        console.log(`Registrada a execucao confirmada de ${name}.`);
        return;
      }
      const result = await connection.execute(
        'select arquivo, checksum_sha256, aplicado_em, aplicado_por from sgn_esc_migracao order by arquivo',
        {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const applied = new Map(result.rows.map((row) => [row.ARQUIVO, row]));
      let pending = 0;
      let divergent = 0;
      for (const file of files) {
        const row = applied.get(file);
        const state = !row ? 'SEM_REGISTRO' : row.CHECKSUM_SHA256 === checksum(file) ? 'CONFIRMADA' : 'DIVERGENTE';
        if (state === 'SEM_REGISTRO') pending += 1;
        if (state === 'DIVERGENTE') divergent += 1;
        console.log(`${state.padEnd(13)} ${file}`);
      }
      for (const file of applied.keys()) {
        if (!files.includes(file)) { divergent += 1; console.log(`FORA_DO_REPO  ${file}`); }
      }
      console.log(`${files.length} migrations versionadas; ${pending} sem registro; ${divergent} divergentes.`);
      if (pending || divergent) process.exitCode = 1;
    });
  } finally {
    await closeOraclePool();
  }
}

main().catch((error) => { console.error(`Falha no registro de migrations: ${error.message}`); process.exitCode = 1; });
