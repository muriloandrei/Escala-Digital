const bcrypt = require('bcryptjs');
const { withConnection, closeOraclePool, oracledb } = require('../src/db/oracle');
const { getEnv } = require('../src/config/env');

function isBcryptHash(value) {
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(String(value || ''));
}

async function main() {
  const login = process.argv[2];
  const password = process.argv[3];

  if (!login || !password) {
    console.error('Uso: node scripts/check-oracle-login.js admin admin123');
    process.exit(1);
  }

  const env = getEnv();
  if (env.dbDriver !== 'oracle') {
    console.error(`DB_DRIVER atual: ${env.dbDriver}. Configure DB_DRIVER=oracle no .env do servidor.`);
    process.exit(1);
  }

  await withConnection(async (connection) => {
    const schema = await connection.execute(
      `select sys_context('USERENV', 'CURRENT_SCHEMA') as current_schema from dual`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log(`Schema conectado: ${schema.rows[0]?.CURRENT_SCHEMA || '(desconhecido)'}`);

    const userResult = await connection.execute(
      `select usuario_id, login, nome, senha_hash, perfil, status
       from sgn_esc_usuario
       where upper(login) = upper(:login)`,
      { login },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const user = userResult.rows[0];
    if (!user) {
      console.log(`Usuario nao encontrado em SGN_ESC_USUARIO: ${login}`);
      return;
    }

    console.log(`Usuario encontrado: ${user.LOGIN}`);
    console.log(`Nome: ${user.NOME || '(sem nome)'}`);
    console.log(`Perfil: ${user.PERFIL || '(sem perfil)'}`);
    console.log(`Status: ${user.STATUS || '(sem status)'}`);

    const validHash = isBcryptHash(user.SENHA_HASH);
    console.log(`SENHA_HASH bcrypt valido: ${validHash ? 'sim' : 'nao'}`);

    if (validHash) {
      const matches = await bcrypt.compare(password, user.SENHA_HASH);
      console.log(`Senha informada confere: ${matches ? 'sim' : 'nao'}`);
    }

    const stores = await connection.execute(
      `select loja
       from sgn_esc_usuario_loja
       where usuario_id = :usuarioId
       order by loja`,
      { usuarioId: user.USUARIO_ID },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log(`Lojas vinculadas: ${stores.rows.map((row) => row.LOJA).join(', ') || '(nenhuma)'}`);
  });
}

main()
  .catch((error) => {
    console.error('Falha no diagnostico de login Oracle:');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeOraclePool();
  });
