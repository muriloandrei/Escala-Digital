const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { initOraclePool, closeOraclePool, withConnection, oracledb } = require('../src/db/oracle');

dotenv.config();

function parseArgs(argv) {
  const args = {
    apply: false,
    arquivo: '',
    perfis: ['GERENTE', 'LIDER', 'RH', 'OPERADOR'],
    includeAdmin: false,
    includeInativos: false
  };

  argv.forEach((arg) => {
    if (arg === '--apply') args.apply = true;
    else if (arg === '--dry-run') args.apply = false;
    else if (arg === '--include-admin') args.includeAdmin = true;
    else if (arg === '--include-inativos') args.includeInativos = true;
    else if (arg.startsWith('--arquivo=')) args.arquivo = arg.slice('--arquivo='.length);
    else if (arg.startsWith('--perfis=')) {
      args.perfis = arg.slice('--perfis='.length)
        .split(',')
        .map((perfil) => perfil.trim().toUpperCase())
        .filter(Boolean);
    }
  });

  return args;
}

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
}

function normalizarTexto(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

function parseLojas(value) {
  if (value === null || value === undefined || value === '') return [];
  return String(value)
    .split(',')
    .map((loja) => Number(String(loja).trim()))
    .filter(Boolean);
}

function inferirLojaUsuario(usuario) {
  const perfil = normalizarTexto(pick(usuario, 'PERFIL', 'perfil'));
  if (!['GERENTE', 'LIDER', 'RH', 'OPERADOR'].includes(perfil)) return null;

  const candidatos = [
    pick(usuario, 'LOGIN', 'login'),
    pick(usuario, 'NOME', 'nome')
  ].map(normalizarTexto);

  const padroes = [
    /\b(?:GERENTE|LIDER|RH|OPERADOR|LOJA)\s*0*(\d{1,4})\b/,
    /0*(\d{1,4})$/
  ];

  for (const texto of candidatos) {
    for (const padrao of padroes) {
      const match = texto.match(padrao);
      if (match) return Number(match[1]);
    }
  }

  return null;
}

function parseCsvLine(line) {
  const delimiter = line.includes(';') ? ';' : ',';
  const values = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === delimiter && !quoted) {
      values.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  values.push(current.trim());
  return values;
}

function carregarMapaArquivo(arquivo) {
  if (!arquivo) return new Map();
  const filePath = path.resolve(process.cwd(), arquivo);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return new Map();

  const header = parseCsvLine(lines[0]).map((column) => normalizarTexto(column));
  const idIndex = header.findIndex((column) => ['USUARIO_ID', 'ID'].includes(column));
  const loginIndex = header.findIndex((column) => column === 'LOGIN');
  const lojaIndex = header.findIndex((column) => ['LOJA', 'LOJA_ESPERADA'].includes(column));
  if (lojaIndex < 0 || (idIndex < 0 && loginIndex < 0)) {
    throw new Error('Arquivo CSV deve ter cabecalho LOGIN,LOJA ou USUARIO_ID,LOJA.');
  }

  const map = new Map();
  lines.slice(1).forEach((line) => {
    const values = parseCsvLine(line);
    const loja = Number(values[lojaIndex]);
    if (!loja) return;
    if (idIndex >= 0 && values[idIndex]) map.set(`ID:${Number(values[idIndex])}`, loja);
    if (loginIndex >= 0 && values[loginIndex]) map.set(`LOGIN:${normalizarTexto(values[loginIndex])}`, loja);
  });
  return map;
}

async function getTableColumns(connection, tableName) {
  const result = await connection.execute(
    `select column_name
       from user_tab_columns
      where table_name = :tableName
      union
      select column_name
       from all_tab_columns
      where table_name = :tableName
        and owner in (user, sys_context('USERENV', 'CURRENT_SCHEMA'))`,
    { tableName: String(tableName || '').toUpperCase() },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return new Set(result.rows.map((row) => pick(row, 'COLUMN_NAME', 'column_name')));
}

async function listarUsuarios(connection, hasLojaPrincipal) {
  const lojaPrincipalSelect = hasLojaPrincipal ? 'u.loja_principal' : 'cast(null as number) as loja_principal';
  const result = await connection.execute(
    `select
        u.usuario_id,
        u.login,
        u.nome,
        u.perfil,
        u.status,
        ${lojaPrincipalSelect},
        listagg(ul.loja, ',') within group (order by ul.loja) as lojas
       from sgn_esc_usuario u
       left join sgn_esc_usuario_loja ul on ul.usuario_id = u.usuario_id
      group by u.usuario_id, u.login, u.nome, u.perfil, u.status, ${lojaPrincipalSelect}
      order by lower(u.login), u.usuario_id`,
    {},
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return result.rows;
}

async function listarLojasValidas(connection) {
  const result = await connection.execute(
    'select loja from sgn_esc_loja',
    {},
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return new Set(result.rows.map((row) => Number(pick(row, 'LOJA', 'loja'))).filter(Boolean));
}

function resolverLojaEsperada(usuario, mapaArquivo) {
  const usuarioId = Number(pick(usuario, 'USUARIO_ID', 'usuario_id'));
  const login = normalizarTexto(pick(usuario, 'LOGIN', 'login'));
  return mapaArquivo.get(`ID:${usuarioId}`)
    || mapaArquivo.get(`LOGIN:${login}`)
    || inferirLojaUsuario(usuario);
}

function montarCandidatos({ usuarios, mapaArquivo, lojasValidas, args }) {
  return usuarios.map((usuario) => {
    const usuarioId = Number(pick(usuario, 'USUARIO_ID', 'usuario_id'));
    const login = pick(usuario, 'LOGIN', 'login');
    const nome = pick(usuario, 'NOME', 'nome');
    const perfil = normalizarTexto(pick(usuario, 'PERFIL', 'perfil'));
    const status = normalizarTexto(pick(usuario, 'STATUS', 'status'));
    const lojasAtuais = parseLojas(pick(usuario, 'LOJAS', 'lojas'));
    const lojaPrincipalAtual = Number(pick(usuario, 'LOJA_PRINCIPAL', 'loja_principal') || 0) || null;
    const lojaEsperada = resolverLojaEsperada(usuario, mapaArquivo);
    const lojaInvalida = lojaEsperada && !lojasValidas.has(Number(lojaEsperada));
    const perfilPermitido = args.includeAdmin || perfil !== 'ADMIN';
    const statusPermitido = args.includeInativos || status === 'A';
    const perfilNoFiltro = args.perfis.length === 0 || args.perfis.includes(perfil) || (args.includeAdmin && perfil === 'ADMIN');
    const deveAtualizar = Boolean(
      lojaEsperada
      && !lojaInvalida
      && perfilPermitido
      && statusPermitido
      && perfilNoFiltro
      && (lojasAtuais.length !== 1 || Number(lojasAtuais[0]) !== Number(lojaEsperada) || lojaPrincipalAtual !== Number(lojaEsperada))
    );

    return {
      usuarioId,
      login,
      nome,
      perfil,
      status,
      lojasAtuais,
      lojaPrincipalAtual,
      lojaEsperada: lojaEsperada || null,
      lojaInvalida,
      deveAtualizar
    };
  });
}

async function aplicarCorrecoes(connection, candidatos, hasLojaPrincipal) {
  for (const candidato of candidatos) {
    await connection.execute(
      'delete from sgn_esc_usuario_loja where usuario_id = :usuarioId',
      { usuarioId: candidato.usuarioId },
      { autoCommit: false }
    );
    await connection.execute(
      'insert into sgn_esc_usuario_loja (usuario_id, loja) values (:usuarioId, :loja)',
      { usuarioId: candidato.usuarioId, loja: candidato.lojaEsperada },
      { autoCommit: false }
    );
    if (hasLojaPrincipal) {
      await connection.execute(
        'update sgn_esc_usuario set loja_principal = :loja where usuario_id = :usuarioId',
        { usuarioId: candidato.usuarioId, loja: candidato.lojaEsperada },
        { autoCommit: false }
      );
    }
  }
  await connection.commit();
}

function imprimirResultado(candidatos, args) {
  const atualizar = candidatos.filter((candidato) => candidato.deveAtualizar);
  const invalidas = candidatos.filter((candidato) => candidato.lojaInvalida);
  const semLoja = candidatos.filter((candidato) => !candidato.lojaEsperada && candidato.perfil !== 'ADMIN');

  console.log(args.apply ? 'Modo: APLICAR' : 'Modo: PREVIA (nenhuma alteracao gravada)');
  console.table(atualizar.map((candidato) => ({
    usuarioId: candidato.usuarioId,
    login: candidato.login,
    nome: candidato.nome,
    perfil: candidato.perfil,
    status: candidato.status,
    lojasAtuais: candidato.lojasAtuais.join(',') || '-',
    lojaPrincipalAtual: candidato.lojaPrincipalAtual || '-',
    lojaEsperada: candidato.lojaEsperada
  })));
  console.log(`Usuarios a corrigir: ${atualizar.length}`);
  if (invalidas.length) {
    console.log(`Ignorados por loja inexistente em SGN_ESC_LOJA: ${invalidas.length}`);
  }
  if (semLoja.length) {
    console.log(`Sem loja inferida/mapeada: ${semLoja.length}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const mapaArquivo = carregarMapaArquivo(args.arquivo);

  await initOraclePool();
  try {
    await withConnection(async (connection) => {
      const usuarioColumns = await getTableColumns(connection, 'SGN_ESC_USUARIO');
      const hasLojaPrincipal = usuarioColumns.has('LOJA_PRINCIPAL');
      const [usuarios, lojasValidas] = await Promise.all([
        listarUsuarios(connection, hasLojaPrincipal),
        listarLojasValidas(connection)
      ]);
      const candidatos = montarCandidatos({ usuarios, mapaArquivo, lojasValidas, args });
      const atualizar = candidatos.filter((candidato) => candidato.deveAtualizar);
      imprimirResultado(candidatos, args);

      if (!args.apply || !atualizar.length) return;
      await aplicarCorrecoes(connection, atualizar, hasLojaPrincipal);
      console.log(`Correcoes gravadas com sucesso: ${atualizar.length}`);
    });
  } finally {
    await closeOraclePool();
  }
}

main().catch((error) => {
  console.error('Falha ao corrigir lojas dos usuarios:', error.message);
  process.exit(1);
});
