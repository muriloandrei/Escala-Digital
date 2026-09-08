const dotenv = require('dotenv');
const { initOraclePool, closeOraclePool, withConnection, oracledb } = require('../src/db/oracle');

dotenv.config();

function parseArgs(argv) {
  const args = { loja: 10, target: 20 };
  argv.forEach((arg) => {
    if (arg.startsWith('--loja=')) args.loja = Number(arg.slice('--loja='.length));
    if (arg.startsWith('--target=')) args.target = Number(arg.slice('--target='.length));
  });
  return args;
}

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
}

async function getTableColumns(connection, tableName) {
  const result = await connection.execute(
    `select column_name
       from user_tab_columns
      where table_name = :tableName`,
    { tableName: String(tableName || '').toUpperCase() },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return new Set(result.rows.map((row) => pick(row, 'COLUMN_NAME', 'column_name')));
}

async function ensureDtNascColumn(connection) {
  const columns = await getTableColumns(connection, 'SGN_ESC_FUNCIONARIO');
  if (columns.has('DT_NASC')) return;
  await connection.execute(`alter table SGN_ESC_FUNCIONARIO add (DT_NASC date)`);
}

async function getLojaCodcoligada(connection, loja) {
  const result = await connection.execute(
    `select codcoligada
       from sgn_esc_loja
      where loja = :loja`,
    { loja },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return Number(pick(result.rows[0], 'CODCOLIGADA', 'codcoligada') || 1);
}

async function listSecoesLoja(connection, loja) {
  const result = await connection.execute(
    `select escsecao_id, cod_secao, descr, codcoligada
       from sgn_esc_secao
      where codfilial = :loja
      order by cod_secao`,
    { loja },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return result.rows;
}

async function ensureFuncao(connection, { codcoligada, codFuncao, descr }) {
  const atual = await connection.execute(
    `select escfuncao_id
       from sgn_esc_funcao
      where codcoligada = :codcoligada
        and cod_funcao = :codFuncao`,
    { codcoligada, codFuncao },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const atualId = pick(atual.rows[0], 'ESCFUNCAO_ID', 'escfuncao_id');
  if (atualId) return Number(atualId);

  const created = await connection.execute(
    `insert into sgn_esc_funcao (escfuncao_id, codcoligada, cod_funcao, descr, status, dt_hr_incl)
     values ((select nvl(max(escfuncao_id), 0) + 1 from sgn_esc_funcao), :codcoligada, :codFuncao, :descr, 'A', sysdate)
     returning escfuncao_id into :id`,
    {
      codcoligada,
      codFuncao,
      descr,
      id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    }
  );
  return Number(created.outBinds.id[0]);
}

function getFuncaoParaSecao(secaoDescr) {
  const nome = String(secaoDescr || '').toUpperCase();
  if (nome.includes('FRENTE') || nome.includes('CAIXA')) {
    return { codFuncao: 'T902', descr: 'CAIXA' };
  }
  if (nome.includes('PADARIA')) {
    return { codFuncao: 'T903', descr: 'OPERADOR DE PADARIA' };
  }
  return { codFuncao: 'T901', descr: 'OPERADOR DE LOJA' };
}

function getHorarioParaSecao(secaoDescr, index) {
  const nome = String(secaoDescr || '').toUpperCase();
  if (nome.includes('FRENTE') || nome.includes('CAIXA')) {
    return index % 2 === 0
      ? { ent1: '07:30', sai1: '12:00', ent2: '13:10', sai2: '17:28' }
      : { ent1: '12:00', sai1: '16:00', ent2: '17:00', sai2: '20:48' };
  }
  if (nome.includes('PADARIA')) {
    return index % 2 === 0
      ? { ent1: '06:00', sai1: '11:00', ent2: '12:00', sai2: '14:48' }
      : { ent1: '12:00', sai1: '16:00', ent2: '17:00', sai2: '20:48' };
  }
  return index % 2 === 0
    ? { ent1: '08:00', sai1: '12:00', ent2: '13:00', sai2: '17:48' }
    : { ent1: '10:00', sai1: '14:00', ent2: '15:00', sai2: '19:48' };
}

function getNomeTeste(secaoDescr, index) {
  const bases = {
    MERCEARIA: ['MARCOS', 'JULIA', 'RENATO', 'BIANCA', 'DANIEL', 'LARISSA', 'RODRIGO', 'CAMILA'],
    PADARIA: ['PAULO', 'MARIANA', 'FELIPE', 'CAROLINA', 'VINICIUS', 'TALITA', 'GUSTAVO', 'PRISCILA'],
    CAIXA: ['ALICIA', 'BRUNO', 'NATALIA', 'DIEGO', 'FERNANDA', 'LEANDRO', 'PATRICIA', 'RAFAEL']
  };
  const secao = String(secaoDescr || '').toUpperCase();
  const grupo = secao.includes('FRENTE') || secao.includes('CAIXA') ? bases.CAIXA : secao.includes('PADARIA') ? bases.PADARIA : bases.MERCEARIA;
  const primeiroNome = grupo[(index - 1) % grupo.length];
  return `${primeiroNome} TESTE DASHBOARD ${String(index).padStart(2, '0')}`;
}

function getNascimento(index) {
  const datas = [
    '1995-09-07',
    '1992-09-15',
    '1989-10-12',
    '1998-11-20',
    '1990-12-25'
  ];
  return datas[(index - 1) % datas.length];
}

function getAdmissao(index) {
  const dias = [15, 35, 65, 82, 160, 260];
  return dias[(index - 1) % dias.length];
}

async function getActiveCount(connection, { loja, escsecaoId }) {
  const result = await connection.execute(
    `select count(*) as total
       from sgn_esc_funcionario
      where loja = :loja
        and escsecao_id = :escsecaoId
        and dt_demiss is null`,
    { loja, escsecaoId },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return Number(pick(result.rows[0], 'TOTAL', 'total') || 0);
}

async function chapaExists(connection, chapa) {
  const result = await connection.execute(
    `select count(*) as total
       from sgn_esc_funcionario
      where chapa = :chapa`,
    { chapa },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return Number(pick(result.rows[0], 'TOTAL', 'total') || 0) > 0;
}

async function criarFuncionario(connection, { loja, codcoligada, secao, escfuncaoId, index }) {
  const escsecaoId = Number(pick(secao, 'ESCSECAO_ID', 'escsecao_id'));
  const secaoDescr = pick(secao, 'DESCR', 'descr');
  let sufixo = index;
  let chapa = '';
  do {
    chapa = `D${String(escsecaoId).slice(-4)}${String(sufixo).padStart(2, '0')}`.slice(0, 8);
    sufixo += 1;
  } while (await chapaExists(connection, chapa));

  const horario = getHorarioParaSecao(secaoDescr, index);
  await connection.execute(
    `insert into sgn_esc_funcionario (
        escfunc_id, codcoligada, loja, chapa, nome, sexo, dt_nasc, dt_admiss, brigadista,
        escsecao_id, escfuncao_id, hr_ent1, hr_sai1, hr_ent2, hr_sai2, codfilial, dt_hr_incl
      ) values (
        (select nvl(max(escfunc_id), 0) + 1 from sgn_esc_funcionario), :codcoligada, :loja, :chapa, :nome, :sexo,
        to_date(:dtNasc, 'YYYY-MM-DD'), trunc(sysdate) - :diasAdmissao, :brigadista,
        :escsecaoId, :escfuncaoId, :hrEnt1, :hrSai1, :hrEnt2, :hrSai2, :loja, sysdate
      )`,
    {
      codcoligada,
      loja,
      chapa,
      nome: getNomeTeste(secaoDescr, index),
      sexo: index % 2 === 0 ? 'F' : 'M',
      dtNasc: getNascimento(index),
      diasAdmissao: getAdmissao(index),
      brigadista: index % 7 === 0 ? 'S' : 'N',
      escsecaoId,
      escfuncaoId,
      hrEnt1: horario.ent1,
      hrSai1: horario.sai1,
      hrEnt2: horario.ent2,
      hrSai2: horario.sai2
    }
  );
  return chapa;
}

async function marcarValidadoresDashboard(connection, { loja, secao }) {
  const escsecaoId = Number(pick(secao, 'ESCSECAO_ID', 'escsecao_id'));
  const result = await connection.execute(
    `select escfunc_id
       from sgn_esc_funcionario
      where loja = :loja
        and escsecao_id = :escsecaoId
        and dt_demiss is null
      order by case when chapa like 'D%' then 0 else 1 end, chapa
      fetch first 3 rows only`,
    { loja, escsecaoId },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const aniversarios = ['1995-09-07', '1992-09-15', '1989-09-23'];
  for (let index = 0; index < result.rows.length; index += 1) {
    await connection.execute(
      `update sgn_esc_funcionario
          set dt_admiss = trunc(sysdate) - :diasAdmissao,
              dt_nasc = to_date(:dtNasc, 'YYYY-MM-DD')
        where escfunc_id = :escfuncId`,
      {
        diasAdmissao: [12, 45, 78][index],
        dtNasc: aniversarios[index],
        escfuncId: Number(pick(result.rows[index], 'ESCFUNC_ID', 'escfunc_id'))
      }
    );
  }
  return result.rows.length;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.loja || !args.target) throw new Error('Informe --loja e --target validos.');

  await initOraclePool();
  const summary = await withConnection(async (connection) => {
    await ensureDtNascColumn(connection);
    const codcoligada = await getLojaCodcoligada(connection, args.loja);
    const secoes = await listSecoesLoja(connection, args.loja);
    const result = [];

    for (const secao of secoes) {
      const escsecaoId = Number(pick(secao, 'ESCSECAO_ID', 'escsecao_id'));
      const descr = pick(secao, 'DESCR', 'descr');
      const funcao = getFuncaoParaSecao(descr);
      const escfuncaoId = await ensureFuncao(connection, { codcoligada, ...funcao });
      let totalAtual = await getActiveCount(connection, { loja: args.loja, escsecaoId });
      let criados = 0;
      let index = 1;

      while (totalAtual < args.target) {
        await criarFuncionario(connection, { loja: args.loja, codcoligada, secao, escfuncaoId, index });
        criados += 1;
        totalAtual += 1;
        index += 1;
      }

      const validadores = await marcarValidadoresDashboard(connection, { loja: args.loja, secao });
      result.push({ secao: `${pick(secao, 'COD_SECAO', 'cod_secao')} - ${descr}`, total: totalAtual, criados, validadores });
    }

    await connection.commit();
    return result;
  });

  console.table(summary);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeOraclePool().catch(() => {});
  });
