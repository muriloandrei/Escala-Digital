const fs = require('node:fs');
const path = require('node:path');
const { getEnv } = require('../src/config/env');
const { initOraclePool, closeOraclePool, withConnection, oracledb } = require('../src/db/oracle');

async function main() {
  const expectedLogin = String(process.argv[2] || 'murilo.jesus').trim().toLowerCase();
  const { ui } = getEnv();
  if (!expectedLogin || !ui.reactDefault || ui.reactAllowedLogins.length !== 1 || ui.reactAllowedLogins[0] !== expectedLogin) {
    throw new Error(`Configure REACT_DEFAULT_UI=true e REACT_ALLOWED_LOGINS=${expectedLogin} (sem outros usuarios).`);
  }

  const dist = path.join(__dirname, '..', 'dist', 'react');
  const assets = path.join(dist, 'assets');
  const files = fs.existsSync(assets) ? fs.readdirSync(assets) : [];
  if (!fs.existsSync(path.join(dist, 'index.html')) || !files.some((file) => file.endsWith('.js')) || !files.some((file) => file.endsWith('.css'))) {
    throw new Error('Build React ausente. Execute npm run build:client no diretorio work.');
  }

  await initOraclePool();
  try {
    const result = await withConnection((connection) => connection.execute(
      `select login, status from sgn_esc_usuario where upper(login) = upper(:login)`,
      { login: expectedLogin }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ));
    const user = result.rows?.[0];
    if (!user || String(user.STATUS).trim().toUpperCase() !== 'A') {
      throw new Error(`Usuario ${expectedLogin} inexistente ou inativo no Oracle.`);
    }
    console.log(`Canario React pronto: ${user.LOGIN} ativo, build presente e allowlist exclusiva.`);
  } finally {
    await closeOraclePool();
  }
}

main().catch((error) => {
  console.error(`Preflight React falhou: ${error.message}`);
  process.exitCode = 1;
});
