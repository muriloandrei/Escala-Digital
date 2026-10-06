const fs = require('node:fs');
const path = require('node:path');
const { getEnv } = require('../src/config/env');
const { initOraclePool, closeOraclePool, withConnection, oracledb } = require('../src/db/oracle');

async function main() {
  const expectedLogins = [...new Set(String(process.argv[2] || '*')
    .split(',').map((login) => login.trim().toLowerCase()).filter(Boolean))];
  const allUsers = expectedLogins.length === 1 && expectedLogins[0] === '*';
  const { ui } = getEnv();
  if (!expectedLogins.length || !ui.reactDefault || ui.reactAllowedLogins.length !== expectedLogins.length
      || expectedLogins.some((login) => !ui.reactAllowedLogins.includes(login))) {
    throw new Error(`Configure REACT_DEFAULT_UI=true e REACT_ALLOWED_LOGINS=${expectedLogins.join(',')} (sem outros usuarios).`);
  }

  const dist = path.join(__dirname, '..', 'dist', 'react');
  const assets = path.join(dist, 'assets');
  const files = fs.existsSync(assets) ? fs.readdirSync(assets) : [];
  if (!fs.existsSync(path.join(dist, 'index.html')) || !files.some((file) => file.endsWith('.js')) || !files.some((file) => file.endsWith('.css'))) {
    throw new Error('Build React ausente. Execute npm run build:client no diretorio work.');
  }

  await initOraclePool();
  try {
    const constraint = await withConnection((connection) => connection.execute(
      `select search_condition_vc from user_constraints
       where constraint_name = 'SGN_ESC_TREINAMENTO_ETAPA_CK'`,
      {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ));
    if (!/ETAPA\s+BETWEEN\s+0\s+AND\s+16/i.test(String(constraint.rows?.[0]?.SEARCH_CONDITION_VC || ''))) {
      throw new Error('Migration 20261006_treinamento_tour_v3.sql pendente no Oracle.');
    }
    if (allUsers) {
      const result = await withConnection((connection) => connection.execute(
        `select count(*) as total from sgn_esc_usuario where upper(trim(status)) = 'A'`,
        {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      ));
      if (Number(result.rows?.[0]?.TOTAL || 0) < 1) {
        throw new Error('Nenhum usuario ativo encontrado no Oracle.');
      }
      console.log('Rollout React pronto: todos os usuarios autenticados, build presente e banco acessivel.');
      return;
    }
    for (const login of expectedLogins) {
      const result = await withConnection((connection) => connection.execute(
        `select login, status from sgn_esc_usuario where upper(login) = upper(:login)`,
        { login }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      ));
      const user = result.rows?.[0];
      if (!user || String(user.STATUS).trim().toUpperCase() !== 'A') {
        throw new Error(`Usuario ${login} inexistente ou inativo no Oracle.`);
      }
    }
    console.log(`Canario React pronto: ${expectedLogins.join(', ')} ativos, build presente e allowlist exclusiva.`);
  } finally {
    await closeOraclePool();
  }
}

main().catch((error) => {
  console.error(`Preflight React falhou: ${error.message}`);
  process.exitCode = 1;
});
