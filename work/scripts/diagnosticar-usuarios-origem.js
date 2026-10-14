const dotenv = require('dotenv');
const oracledb = require('oracledb');

function parseArgs(argv) {
  const sourceArg = argv.find((arg) => arg.startsWith('--source='));
  const targetArg = argv.find((arg) => arg.startsWith('--target-schema='));
  const limitArg = argv.find((arg) => arg.startsWith('--sample='));
  if (argv.length !== Number(Boolean(sourceArg)) + Number(Boolean(targetArg)) + Number(Boolean(limitArg))
      || (sourceArg && !/^[A-Za-z][A-Za-z0-9_$#]*(\.[A-Za-z][A-Za-z0-9_$#]*)?$/.test(sourceArg.slice(9)))
      || (targetArg && !/^[A-Za-z][A-Za-z0-9_$#]*$/.test(targetArg.slice(16)))) {
    throw new Error('Use [--source=SGN_USUARIO] [--target-schema=ESCALAINT] [--sample=1..50]. Este comando somente consulta o Oracle.');
  }
  const sample = limitArg ? Number(limitArg.slice(9)) : 20;
  if (!Number.isInteger(sample) || sample < 1 || sample > 50) {
    throw new Error('--sample deve estar entre 1 e 50.');
  }
  return {
    source: (sourceArg?.slice(9) || 'SGN_USUARIO').toUpperCase(),
    targetSchema: (targetArg?.slice(16) || 'ESCALAINT').toUpperCase(),
    sample
  };
}

function loginKey(value) {
  return String(value || '').trim().toUpperCase();
}

function lojaSugerida(login) {
  const match = loginKey(login).match(/(?:^|[^0-9])0*(\d{1,4})$/);
  return match ? Number(match[1]) : null;
}

function perfilSugerido(login) {
  const value = loginKey(login);
  if (value.startsWith('GERENTE')) return 'GERENTE';
  if (value.startsWith('LIDER')) return 'LIDER';
  if (value.startsWith('ADM')) return 'RH';
  return 'OPERADOR';
}

function isMd5(value) {
  return /^[a-f0-9]{32}$/i.test(String(value || '').trim());
}

function dateValue(value) {
  const date = value instanceof Date ? value : value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : null;
}

function analisar({ origem, destino, lojas, vinculos, secoes }) {
  const sourceByLogin = new Map();
  const targetByLogin = new Map();
  for (const row of origem) {
    const key = loginKey(row.LOGIN);
    if (!key) continue;
    if (!sourceByLogin.has(key)) sourceByLogin.set(key, []);
    sourceByLogin.get(key).push(row);
  }
  for (const row of destino) {
    const key = loginKey(row.LOGIN);
    if (!targetByLogin.has(key)) targetByLogin.set(key, []);
    targetByLogin.get(key).push(row);
  }
  const lojaSet = new Set(lojas.map((row) => Number(row.LOJA)));
  const lojaPorUsuario = new Map();
  for (const row of vinculos) {
    const id = Number(row.USUARIO_ID);
    if (!lojaPorUsuario.has(id)) lojaPorUsuario.set(id, new Set());
    lojaPorUsuario.get(id).add(Number(row.LOJA));
  }
  const secoesPorLoja = new Map(secoes.map((row) => [Number(row.LOJA), Number(row.TOTAL)]));
  const resultados = [];
  for (const [login, rows] of sourceByLogin) {
    const source = rows[0];
    const targets = targetByLogin.get(login) || [];
    const target = targets[0];
    const loja = lojaSugerida(login);
    const perfil = perfilSugerido(login);
    const currentStores = target ? [...(lojaPorUsuario.get(Number(target.USUARIO_ID)) || [])] : [];
    let senha = 'sem_data_comparavel';
    if (!isMd5(source.SENHA)) senha = 'formato_nao_suportado';
    else if (!target) senha = 'nova_conta';
    else if (isMd5(target.SENHA_HASH)) {
      senha = loginKey(source.SENHA) === loginKey(target.SENHA_HASH) ? 'md5_igual' : 'md5_diferente';
    } else if (dateValue(source.DT_HR_ULT_SENHA) !== null && dateValue(target.DT_HR_INCL) !== null) {
      senha = dateValue(source.DT_HR_ULT_SENHA) > dateValue(target.DT_HR_INCL)
        ? 'origem_posterior_ao_cadastro' : 'bcrypt_sem_linha_de_base';
    }
    resultados.push({
      login,
      existe: Boolean(target),
      statusOrigem: source.STATUS ?? null,
      nivelOrigem: source.NIVEL ?? null,
      configAbcOrigem: source.CONFIG_ABC ?? null,
      lojaIdOrigem: source.LOJA_ID ?? null,
      temLojaId2: Boolean(String(source.LOJA_ID2 || '').trim()),
      perfilAtual: target?.PERFIL || null,
      perfilSugerido: perfil,
      lojaSugerida: loja,
      lojaCadastrada: Boolean(loja && lojaSet.has(loja)),
      secoesAtivas: loja ? (secoesPorLoja.get(loja) || 0) : 0,
      lojasAtuais: currentStores.sort((a, b) => a - b),
      senha,
      dataSenhaOrigem: Boolean(dateValue(source.DT_HR_ULT_SENHA)),
      origemDuplicada: rows.length > 1,
      destinoDuplicado: targets.length > 1
    });
  }
  return resultados;
}

async function diagnosticar(connection, { source, targetSchema = 'ESCALAINT' }) {
  const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
  if (!/^[A-Za-z][A-Za-z0-9_$#]*(\.[A-Za-z][A-Za-z0-9_$#]*)?$/.test(source)) {
    throw new Error('Tabela de origem invalida.');
  }
  const target = /^[A-Za-z][A-Za-z0-9_$#]*$/.test(targetSchema) ? targetSchema.toUpperCase() : null;
  if (!target) throw new Error('Schema de destino invalido.');
  const [sourceOwner, sourceName] = source.includes('.') ? source.toUpperCase().split('.') : [null, source.toUpperCase()];
  const sourceColumns = await connection.execute(
    sourceOwner
      ? 'select column_name from all_tab_columns where owner = :owner and table_name = :tableName'
      : 'select column_name from user_tab_columns where table_name = :tableName',
    sourceOwner ? { owner: sourceOwner, tableName: sourceName } : { tableName: sourceName },
    options
  );
  const sourceColumnSet = new Set(sourceColumns.rows.map((row) => row.COLUMN_NAME));
  const statusSelect = sourceColumnSet.has('STATUS') ? 'status' : 'cast(null as varchar2(1)) as status';
  let origem;
  try {
    origem = (await connection.execute(
      `select usuario_id, login, senha, dt_hr_ult_senha, nivel, config_abc, loja_id, loja_id2, ${statusSelect}
         from ${source}`,
      {}, options
    )).rows;
  } catch (error) {
    if (error.errorNum === 942 || error.code === 'ORA-00942') {
      throw new Error(`Origem ${source} inacessivel ao usuario Oracle da Escala. Confira o schema e o grant SELECT.`);
    }
    throw error;
  }
  const destino = await connection.execute(`select usuario_id, login, perfil, senha_hash, dt_hr_incl from ${target}.sgn_esc_usuario`, {}, options);
  const lojas = await connection.execute(`select loja from ${target}.sgn_esc_loja`, {}, options);
  const vinculos = await connection.execute(`select usuario_id, loja from ${target}.sgn_esc_usuario_loja`, {}, options);
  const secaoColumns = await connection.execute("select column_name from all_tab_columns where owner = :targetSchema and table_name = 'SGN_ESC_SECAO' and column_name in ('CODFILIAL', 'LOJA', 'STATUS')", { targetSchema: target }, options);
  const columns = new Set(secaoColumns.rows.map((row) => row.COLUMN_NAME));
  const lojaColumn = columns.has('CODFILIAL') ? 'codfilial' : columns.has('LOJA') ? 'loja' : null;
  if (!lojaColumn) throw new Error('SGN_ESC_SECAO sem CODFILIAL/LOJA para conferir o escopo dos usuarios.');
  const statusFilter = columns.has('STATUS') ? "where nvl(status, 'A') = 'A'" : '';
  const secoes = await connection.execute(
    `select ${lojaColumn} as loja, count(*) as total from ${target}.sgn_esc_secao ${statusFilter} group by ${lojaColumn}`,
    {}, options
  );
  return {
    temStatusOrigem: sourceColumnSet.has('STATUS'),
    resultados: analisar({ origem, destino: destino.rows, lojas: lojas.rows, vinculos: vinculos.rows, secoes: secoes.rows })
  };
}

function imprimir({ resultados, temStatusOrigem }, sample) {
  const count = (predicate) => resultados.filter(predicate).length;
  console.log('DIAGNOSTICO SOMENTE LEITURA - nenhuma senha ou hash sera exibido.');
  console.log(`STATUS na origem: ${temStatusOrigem ? 'sim' : 'nao; criacao automatica deve permanecer bloqueada ate definir a regra de atividade'}`);
  console.log(`Logins de origem: ${resultados.length}`);
  console.log(`Status A na origem: ${count((row) => row.statusOrigem === 'A')}`);
  console.log(`Status diferente de A: ${count((row) => row.statusOrigem && row.statusOrigem !== 'A')}`);
  console.log(`Novos com perfil sugerido e loja cadastrada: ${count((row) => !row.existe && row.perfilSugerido && row.lojaCadastrada && row.secoesAtivas && row.senha === 'nova_conta' && !row.origemDuplicada && row.statusOrigem === 'A')}`);
  console.log(`Novos sem mapeamento seguro: ${count((row) => !row.existe && (!row.lojaCadastrada || !row.secoesAtivas || row.origemDuplicada || row.statusOrigem !== 'A' || row.senha !== 'nova_conta'))}`);
  console.log(`Existentes com loja divergente: ${count((row) => row.existe && row.lojaCadastrada && !row.lojasAtuais.includes(row.lojaSugerida))}`);
  console.log(`MD5 diferente no destino: ${count((row) => row.senha === 'md5_diferente')}`);
  console.log(`Bcrypt com troca possivel apos cadastro: ${count((row) => row.senha === 'origem_posterior_ao_cadastro')}`);
  console.log(`Hash origem invalido: ${count((row) => row.senha === 'formato_nao_suportado')}`);
  console.log(`Login duplicado na origem/destino: ${count((row) => row.origemDuplicada || row.destinoDuplicado)}`);
  console.log('Amostra para confirmar mapeamento (sem credenciais):');
  console.table(resultados.slice(0, sample));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  dotenv.config(process.env.ESCALA_ENV_FILE ? { path: process.env.ESCALA_ENV_FILE } : undefined);
  const missing = ['ORACLE_USER', 'ORACLE_PASSWORD', 'ORACLE_CONNECT_STRING'].filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Configure a conexao do schema de origem: ${missing.join(', ')}.`);
  const connection = await oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING
  });
  try {
    const resultado = await diagnosticar(connection, args);
    imprimir(resultado, args.sample);
  } finally {
    await connection.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Diagnostico interrompido: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { parseArgs, loginKey, lojaSugerida, perfilSugerido, analisar, diagnosticar, imprimir };
