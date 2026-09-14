const dotenv = require('dotenv');
const { closeOraclePool, oracledb, withConnection } = require('../src/db/oracle');

dotenv.config();

const VALID_SCOPES = new Set(['frente-caixa', 'todas']);

function normalizeMesRef(value) {
  const raw = String(value || '').trim();
  if (/^\d{4}-\d{2}$/.test(raw)) return `${raw}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw.slice(0, 7)}-01`;
  throw new Error('--mes deve estar no formato YYYY-MM ou YYYY-MM-DD.');
}

function parseArgs(argv) {
  const args = {
    apply: false,
    loja: null,
    mesRef: null,
    scope: 'frente-caixa',
    incluirFinalizadas: false
  };

  argv.forEach((arg) => {
    if (arg === '--apply') args.apply = true;
    else if (arg === '--dry-run') args.apply = false;
    else if (arg === '--incluir-finalizadas') args.incluirFinalizadas = true;
    else if (arg.startsWith('--loja=')) {
      const loja = Number(arg.slice('--loja='.length));
      if (!Number.isFinite(loja) || loja <= 0) throw new Error('--loja deve ser um numero positivo.');
      args.loja = loja;
    } else if (arg.startsWith('--mes=')) {
      args.mesRef = normalizeMesRef(arg.slice('--mes='.length));
    } else if (arg.startsWith('--scope=')) {
      const scope = arg.slice('--scope='.length).trim().toLowerCase();
      if (!VALID_SCOPES.has(scope)) throw new Error('--scope deve ser frente-caixa ou todas.');
      args.scope = scope;
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

function buildWhere(args, alias = 'p') {
  const binds = {};
  const filters = [
    `nvl(${alias}.ativa, 1) = 1`,
    `nvl(${alias}.oficializada, 0) = 1`
  ];

  if (!args.incluirFinalizadas) filters.push(`last_day(${alias}.mes_ref) >= trunc(sysdate)`);

  if (args.loja) {
    filters.push(`${alias}.loja = :loja`);
    binds.loja = args.loja;
  }

  if (args.mesRef) {
    filters.push(`trunc(${alias}.mes_ref, 'MM') = to_date(:mesRef, 'YYYY-MM-DD')`);
    binds.mesRef = args.mesRef;
  }

  if (args.scope === 'frente-caixa') {
    filters.push(`exists (
      select 1
        from sgn_esc_secao s
       where s.escsecao_id = ${alias}.escsecao_id
         and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
    )`);
  }

  return { whereSql: filters.join('\n       and '), binds };
}

async function imprimirPrevia(connection, args) {
  const { whereSql, binds } = buildWhere(args, 'p');
  const result = await connection.execute(
    `select p.loja,
            to_char(trunc(p.mes_ref, 'MM'), 'YYYY-MM') as mes_ref,
            nvl(s.cod_secao, '-') as cod_secao,
            nvl(s.descr, 'SEM SECAO') as secao,
            count(*) as cabecalhos,
            count(distinct p.escfunc_id) as funcionarios
       from sgn_esc_prog p
       left join sgn_esc_secao s on s.escsecao_id = p.escsecao_id
      where ${whereSql}
      group by p.loja, trunc(p.mes_ref, 'MM'), nvl(s.cod_secao, '-'), nvl(s.descr, 'SEM SECAO')
      order by p.loja, trunc(p.mes_ref, 'MM'), nvl(s.descr, 'SEM SECAO')`,
    binds,
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  console.log(`Modo: ${args.apply ? 'APLICAR' : 'PREVIA'}`);
  console.log(`Loja: ${args.loja || 'TODAS'}`);
  console.log(`Mes: ${args.mesRef ? args.mesRef.slice(0, 7) : 'TODOS NAO FINALIZADOS'}`);
  console.log(`Escopo: ${args.scope}`);
  console.log(`Inclui finalizadas: ${args.incluirFinalizadas ? 'S' : 'N'}`);

  if (!result.rows.length) {
    console.log('Nenhuma escala ativa oficializada encontrada para corrigir.');
    return 0;
  }

  console.table(result.rows.map((row) => ({
    loja: pick(row, 'LOJA', 'loja'),
    mes: pick(row, 'MES_REF', 'mes_ref'),
    secao: `${pick(row, 'COD_SECAO', 'cod_secao')} - ${pick(row, 'SECAO', 'secao')}`,
    funcionarios: Number(pick(row, 'FUNCIONARIOS', 'funcionarios') || 0),
    cabecalhos: Number(pick(row, 'CABECALHOS', 'cabecalhos') || 0)
  })));

  return result.rows.reduce((total, row) => total + Number(pick(row, 'CABECALHOS', 'cabecalhos') || 0), 0);
}

async function aplicarCorrecao(connection, args) {
  const { whereSql, binds } = buildWhere(args, 'p');
  const result = await connection.execute(
    `update sgn_esc_prog p
        set p.oficializada = 0
      where ${whereSql}`,
    binds,
    { autoCommit: false }
  );
  await connection.commit();
  return result.rowsAffected || 0;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  try {
    const total = await withConnection(async (connection) => {
      const encontrados = await imprimirPrevia(connection, args);
      if (!args.apply || encontrados === 0) return encontrados;
      const atualizados = await aplicarCorrecao(connection, args);
      console.log(`Cabecalhos corrigidos: ${atualizados}`);
      return atualizados;
    });

    if (!args.apply && total > 0) {
      console.log('Previa concluida. Reexecute com --apply para aplicar a correcao.');
    }
  } finally {
    await closeOraclePool();
  }
}

main().catch(async (error) => {
  console.error(error.message || error);
  await closeOraclePool().catch(() => {});
  process.exitCode = 1;
});
