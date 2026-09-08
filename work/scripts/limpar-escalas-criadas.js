const dotenv = require('dotenv');
const { closeOraclePool, oracledb, withConnection } = require('../src/db/oracle');

dotenv.config();

const VALID_SCOPES = new Set(['todas', 'frente-caixa', 'fora-frente-caixa']);

function parseArgs(argv) {
  const args = {
    apply: false,
    loja: null,
    mesRef: null,
    scope: 'todas',
    includeOficializadas: true,
    limparFixos: false
  };

  argv.forEach((arg) => {
    if (arg === '--apply') args.apply = true;
    else if (arg === '--dry-run') args.apply = false;
    else if (arg === '--somente-nao-oficializadas') args.includeOficializadas = false;
    else if (arg === '--limpar-fixos') args.limparFixos = true;
    else if (arg.startsWith('--loja=')) {
      const loja = Number(arg.slice('--loja='.length));
      if (!Number.isFinite(loja) || loja <= 0) throw new Error('--loja deve ser um numero positivo.');
      args.loja = loja;
    } else if (arg.startsWith('--mes=')) {
      args.mesRef = normalizeMesRef(arg.slice('--mes='.length));
    } else if (arg.startsWith('--scope=')) {
      const scope = arg.slice('--scope='.length).trim().toLowerCase();
      if (!VALID_SCOPES.has(scope)) {
        throw new Error('--scope deve ser todas, frente-caixa ou fora-frente-caixa.');
      }
      args.scope = scope;
    }
  });

  return args;
}

function normalizeMesRef(value) {
  const raw = String(value || '').trim();
  if (/^\d{4}-\d{2}$/.test(raw)) return `${raw}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw.slice(0, 7)}-01`;
  throw new Error('--mes deve estar no formato YYYY-MM ou YYYY-MM-DD.');
}

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
}

async function getColumns(connection, tableName) {
  const result = await connection.execute(
    `select column_name
       from user_tab_columns
      where table_name = :tableName`,
    { tableName: tableName.toUpperCase() },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return new Set(result.rows.map((row) => String(pick(row, 'COLUMN_NAME', 'column_name')).toUpperCase()));
}

async function assertSchema(connection, args) {
  const progColumns = await getColumns(connection, 'SGN_ESC_PROG');
  if (!progColumns.has('ATIVA')) {
    throw new Error('Coluna SGN_ESC_PROG.ATIVA nao encontrada. Rode a migration 20260630_add_prog_ativa.sql.');
  }

  if (args.limparFixos) {
    const fixoColumns = await getColumns(connection, 'SGN_ESC_FIXO_ESCALA');
    if (!fixoColumns.has('STATUS')) {
      throw new Error('Coluna SGN_ESC_FIXO_ESCALA.STATUS nao encontrada.');
    }
  }
}

function buildProgWhere(args, alias = 'p') {
  const binds = {};
  const filters = [`nvl(${alias}.ativa, 1) = 1`];

  if (args.loja) {
    filters.push(`${alias}.loja = :loja`);
    binds.loja = args.loja;
  }

  if (args.mesRef) {
    filters.push(`trunc(${alias}.mes_ref, 'MM') = to_date(:mesRef, 'YYYY-MM-DD')`);
    binds.mesRef = args.mesRef;
  }

  if (!args.includeOficializadas) {
    filters.push(`nvl(${alias}.oficializada, 0) = 0`);
  }

  if (args.scope === 'frente-caixa') {
    filters.push(`exists (
      select 1
        from sgn_esc_secao s
       where s.escsecao_id = ${alias}.escsecao_id
         and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
    )`);
  } else if (args.scope === 'fora-frente-caixa') {
    filters.push(`not exists (
      select 1
        from sgn_esc_secao s
       where s.escsecao_id = ${alias}.escsecao_id
         and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
    )`);
  }

  return { whereSql: filters.join('\n       and '), binds };
}

function buildFixoWhere(args, alias = 'f') {
  const binds = {};
  const filters = [`nvl(${alias}.status, 'A') = 'A'`];

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
  } else if (args.scope === 'fora-frente-caixa') {
    filters.push(`not exists (
      select 1
        from sgn_esc_secao s
       where s.escsecao_id = ${alias}.escsecao_id
         and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
    )`);
  }

  return { whereSql: filters.join('\n       and '), binds };
}

async function countScalar(connection, sql, binds) {
  const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
  return Number(pick(result.rows[0], 'TOTAL', 'total') || 0);
}

async function collectResumo(connection, args) {
  const { whereSql, binds } = buildProgWhere(args, 'p');
  const rows = await connection.execute(
    `select p.loja,
            to_char(trunc(p.mes_ref, 'MM'), 'YYYY-MM') as mes_ref,
            nvl(s.cod_secao, '-') as cod_secao,
            nvl(s.descr, 'SEM SECAO') as secao,
            count(*) as registros,
            count(distinct p.escfunc_id) as funcionarios,
            sum(case when nvl(p.oficializada, 0) = 1 then 1 else 0 end) as oficializadas
       from sgn_esc_prog p
       left join sgn_esc_secao s on s.escsecao_id = p.escsecao_id
      where ${whereSql}
      group by p.loja, trunc(p.mes_ref, 'MM'), nvl(s.cod_secao, '-'), nvl(s.descr, 'SEM SECAO')
      order by p.loja, trunc(p.mes_ref, 'MM'), nvl(s.descr, 'SEM SECAO')`,
    binds,
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return rows.rows;
}

async function imprimirPrevia(connection, args) {
  const prog = buildProgWhere(args, 'p');
  const fixo = buildFixoWhere(args, 'f');
  const oficializadasArgs = { ...args, includeOficializadas: true };
  const oficializadas = buildProgWhere(oficializadasArgs, 'p');
  const progCount = await countScalar(connection, `select count(*) as total from sgn_esc_prog p where ${prog.whereSql}`, prog.binds);
  const diaCount = await countScalar(
    connection,
    `select count(*) as total
       from sgn_esc_prog_dia d
      where exists (
        select 1
          from sgn_esc_prog p
         where p.escprog_id = d.escprog_id
           and ${prog.whereSql}
      )`,
    prog.binds
  );
  const oficializadasCount = await countScalar(
    connection,
    `select count(*) as total
       from sgn_esc_prog p
      where ${oficializadas.whereSql}
        and nvl(p.oficializada, 0) = 1`,
    oficializadas.binds
  );
  const fixoCount = args.limparFixos
    ? await countScalar(connection, `select count(*) as total from sgn_esc_fixo_escala f where ${fixo.whereSql}`, fixo.binds)
    : 0;

  console.log(`Modo: ${args.apply ? 'APLICAR' : 'PREVIA'}`);
  console.log(`Loja: ${args.loja || 'TODAS'}`);
  console.log(`Mes: ${args.mesRef ? args.mesRef.slice(0, 7) : 'TODOS'}`);
  console.log(`Escopo: ${args.scope}`);
  console.log(`Inclui oficializadas: ${args.includeOficializadas ? 'S' : 'N'}`);
  console.log(`Limpar fixos: ${args.limparFixos ? 'S' : 'N'}`);
  console.log(`Cabecalhos ativos encontrados: ${progCount}`);
  console.log(`Dias vinculados encontrados: ${diaCount}`);
  console.log(`Cabecalhos oficializados ativos no filtro loja/mes: ${oficializadasCount}`);
  console.log(`Fixos ativos encontrados: ${fixoCount}`);

  const resumo = await collectResumo(connection, args);
  if (resumo.length) {
    console.table(resumo.map((row) => ({
      loja: pick(row, 'LOJA', 'loja'),
      mes: pick(row, 'MES_REF', 'mes_ref'),
      secao: `${pick(row, 'COD_SECAO', 'cod_secao')} - ${pick(row, 'SECAO', 'secao')}`,
      funcionarios: Number(pick(row, 'FUNCIONARIOS', 'funcionarios') || 0),
      registros: Number(pick(row, 'REGISTROS', 'registros') || 0),
      oficializadas: Number(pick(row, 'OFICIALIZADAS', 'oficializadas') || 0)
    })));
  }

  return { progCount, fixoCount };
}

async function aplicarLimpeza(connection, args) {
  const prog = buildProgWhere(args, 'p');
  const progResult = await connection.execute(
    `update sgn_esc_prog p
        set p.ativa = 0
      where ${prog.whereSql}`,
    prog.binds,
    { autoCommit: false }
  );

  let fixoRows = 0;
  if (args.limparFixos) {
    const fixo = buildFixoWhere(args, 'f');
    const fixoResult = await connection.execute(
      `update sgn_esc_fixo_escala f
          set f.status = 'I'
        where ${fixo.whereSql}`,
      fixo.binds,
      { autoCommit: false }
    );
    fixoRows = fixoResult.rowsAffected || 0;
  }

  await connection.commit();
  return {
    escalas: progResult.rowsAffected || 0,
    fixos: fixoRows
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await withConnection(async (connection) => {
    await assertSchema(connection, args);
    const { progCount } = await imprimirPrevia(connection, args);

    if (!args.apply) {
      console.log('');
      console.log('Nenhuma alteracao aplicada. Use --apply para inativar as escalas encontradas.');
      return;
    }

    if (!progCount && !args.limparFixos) {
      console.log('');
      console.log('Nenhuma escala ativa encontrada para o escopo informado.');
      return;
    }

    const result = await aplicarLimpeza(connection, args);
    console.log('');
    console.log(`Escalas inativadas: ${result.escalas}`);
    console.log(`Fixos inativados: ${result.fixos}`);
  });
}

main()
  .catch((error) => {
    console.error(`Falha ao limpar escalas criadas: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeOraclePool();
  });
