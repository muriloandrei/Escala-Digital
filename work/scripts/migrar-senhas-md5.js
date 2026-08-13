const { closeOraclePool, oracledb, withConnection } = require('../src/db/oracle');
const { _private: authPrivate } = require('../src/services/authService');

const DEFAULTS = {
  sourceTable: process.env.LEGACY_PASSWORD_SOURCE_TABLE || '',
  sourceLoginColumn: process.env.LEGACY_PASSWORD_LOGIN_COLUMN || 'LOGIN',
  sourceMd5Column: process.env.LEGACY_PASSWORD_MD5_COLUMN || 'SENHA_MD5',
  sourceWhere: process.env.LEGACY_PASSWORD_SOURCE_WHERE || ''
};

function parseArgs(argv) {
  const args = {
    ...DEFAULTS,
    execute: false,
    overwrite: false,
    onlyLogin: ''
  };

  argv.forEach((arg) => {
    if (arg === '--execute') args.execute = true;
    else if (arg === '--overwrite') args.overwrite = true;
    else if (arg.startsWith('--source-table=')) args.sourceTable = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--source-login-column=')) args.sourceLoginColumn = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--source-md5-column=')) args.sourceMd5Column = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--source-where=')) args.sourceWhere = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--only-login=')) args.onlyLogin = arg.split('=').slice(1).join('=');
  });

  return args;
}

function assertIdentifier(value, label, allowSchema = false) {
  const pattern = allowSchema
    ? /^[A-Za-z][A-Za-z0-9_$#]*(\.[A-Za-z][A-Za-z0-9_$#]*)?$/
    : /^[A-Za-z][A-Za-z0-9_$#]*$/;
  if (!pattern.test(String(value || ''))) {
    throw new Error(`${label} invalido: ${value || '(vazio)'}`);
  }
  return String(value).toUpperCase();
}

function isMd5Hex(value) {
  return /^[a-f0-9]{32}$/i.test(String(value || '').trim());
}

function normalizeLogin(value) {
  return String(value || '').trim().toUpperCase();
}

async function listarSenhasLegadas(connection, args) {
  const sourceTable = assertIdentifier(args.sourceTable, 'Tabela origem', true);
  const sourceLoginColumn = assertIdentifier(args.sourceLoginColumn, 'Coluna login origem');
  const sourceMd5Column = assertIdentifier(args.sourceMd5Column, 'Coluna MD5 origem');
  const whereParts = [`${sourceLoginColumn} is not null`, `${sourceMd5Column} is not null`];
  const binds = {};

  if (args.sourceWhere) whereParts.push(`(${args.sourceWhere})`);
  if (args.onlyLogin) {
    whereParts.push(`upper(trim(to_char(${sourceLoginColumn}))) = :onlyLogin`);
    binds.onlyLogin = normalizeLogin(args.onlyLogin);
  }

  const result = await connection.execute(
    `select
        trim(to_char(${sourceLoginColumn})) as login,
        lower(trim(to_char(${sourceMd5Column}))) as senha_md5
       from ${sourceTable}
      where ${whereParts.join(' and ')}`,
    binds,
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const map = new Map();
  const invalidos = [];
  result.rows.forEach((row) => {
    const login = normalizeLogin(row.LOGIN);
    const md5 = String(row.SENHA_MD5 || '').trim().toLowerCase();
    if (!login || !isMd5Hex(md5)) {
      invalidos.push(login || '(sem login)');
      return;
    }
    if (!map.has(login)) map.set(login, md5);
  });

  return { senhas: map, invalidos };
}

async function listarUsuariosDestino(connection, onlyLogin) {
  const binds = {};
  const where = onlyLogin ? 'where upper(trim(login)) = :onlyLogin' : '';
  if (onlyLogin) binds.onlyLogin = normalizeLogin(onlyLogin);

  const result = await connection.execute(
    `select usuario_id, login, senha_hash, status
       from sgn_esc_usuario
       ${where}
      order by login`,
    binds,
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows.map((row) => ({
    usuarioId: Number(row.USUARIO_ID),
    login: String(row.LOGIN || ''),
    loginKey: normalizeLogin(row.LOGIN),
    senhaHash: String(row.SENHA_HASH || ''),
    status: String(row.STATUS || '')
  }));
}

async function montarAtualizacoes(connection, args) {
  const { senhas, invalidos } = await listarSenhasLegadas(connection, args);
  const usuarios = await listarUsuariosDestino(connection, args.onlyLogin);
  const usuariosPorLogin = new Map(usuarios.map((usuario) => [usuario.loginKey, usuario]));
  const atualizacoes = [];
  const ignorados = [];
  const semUsuario = [];

  for (const [loginKey, md5] of senhas.entries()) {
    const usuario = usuariosPorLogin.get(loginKey);
    if (!usuario) {
      semUsuario.push(loginKey);
      continue;
    }
    if (authPrivate.isSupportedPasswordHash(usuario.senhaHash) && !args.overwrite) {
      ignorados.push(usuario.login);
      continue;
    }
    atualizacoes.push({
      usuarioId: usuario.usuarioId,
      login: usuario.login,
      senhaHash: md5
    });
  }

  return {
    atualizacoes,
    ignorados,
    semUsuario,
    invalidos,
    origem: senhas.size,
    usuariosDestino: usuarios.length
  };
}

async function aplicarAtualizacoes(connection, atualizacoes) {
  if (!atualizacoes.length) return 0;
  const result = await connection.executeMany(
    `update sgn_esc_usuario
        set senha_hash = :senhaHash
      where usuario_id = :usuarioId`,
    atualizacoes.map((item) => ({
      usuarioId: item.usuarioId,
      senhaHash: item.senhaHash
    })),
    { autoCommit: false }
  );
  return result.rowsAffected || 0;
}

function imprimirResumo(resultado, args, rowsAffected = 0) {
  console.log(`Modo: ${args.execute ? 'EXECUCAO' : 'SIMULACAO'}`);
  console.log(`Origem: ${args.sourceTable}`);
  console.log(`Usuarios destino lidos: ${resultado.usuariosDestino}`);
  console.log(`Logins com MD5 validos na origem: ${resultado.origem}`);
  console.log(`Atualizacoes ${args.execute ? 'aplicadas' : 'previstas'}: ${args.execute ? rowsAffected : resultado.atualizacoes.length}`);
  console.log(`Ignorados por ja terem hash suportado: ${resultado.ignorados.length}`);
  console.log(`Sem usuario correspondente: ${resultado.semUsuario.length}`);
  console.log(`Registros com MD5 invalido: ${resultado.invalidos.length}`);

  resultado.atualizacoes.slice(0, 20).forEach((item) => {
    console.log(`- ${item.login}: sera gravado com MD5 legado para upgrade automatico no primeiro login`);
  });
  if (resultado.atualizacoes.length > 20) {
    console.log(`... ${resultado.atualizacoes.length - 20} atualizacao(oes) omitida(s) no resumo.`);
  }

  if (!args.execute) {
    console.log('');
    console.log('Nenhuma alteracao foi aplicada. Use --execute para gravar MD5 puro. Use --overwrite para substituir hashes ja existentes.');
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.sourceTable) {
    throw new Error('Informe a tabela origem com --source-table=NOME_TABELA ou LEGACY_PASSWORD_SOURCE_TABLE no .env.');
  }

  await withConnection(async (connection) => {
    const resultado = await montarAtualizacoes(connection, args);
    if (!args.execute) {
      imprimirResumo(resultado, args);
      return;
    }
    try {
      const rowsAffected = await aplicarAtualizacoes(connection, resultado.atualizacoes);
      await connection.commit();
      imprimirResumo(resultado, args, rowsAffected);
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeOraclePool();
  });
