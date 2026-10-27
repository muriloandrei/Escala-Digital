const { initOraclePool, closeOraclePool, withConnection, oracledb } = require('../src/db/oracle');

function parseArgs(args) {
  if (args.length !== 2 || !/^--loja=[1-9]\d*$/.test(args[0])
      || !/^--mes=\d{4}-(0[1-9]|1[0-2])$/.test(args[1])) {
    throw new Error('Use --loja=NUMERO --mes=AAAA-MM. Consulta somente de leitura.');
  }
  const loja = Number(args[0].slice(7));
  if (!Number.isSafeInteger(loja)) throw new Error('Numero de loja invalido.');
  return { loja, mesRef: `${args[1].slice(6)}-01` };
}

async function diagnosticar(connection, { loja, mesRef }) {
  const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
  const binds = { loja, mesRef };
  const flag = await connection.execute(
    'select todas_secoes_habilitadas from sgn_esc_loja where loja = :loja',
    { loja }, options
  );
  if (!flag.rows.length) throw new Error(`Loja ${loja} nao cadastrada.`);

  const leaders = await connection.execute(
      `select u.usuario_id, u.login, u.nome, u.status
         from sgn_esc_usuario u
         join sgn_esc_usuario_loja ul on ul.usuario_id = u.usuario_id
        where ul.loja = :loja and upper(trim(u.perfil)) = 'LIDER'
        order by u.login`, { loja }, options
    );
  const sections = await connection.execute(
      `select s.escsecao_id, s.cod_secao, s.descr, s.status,
              (select count(*) from sgn_esc_funcionario f
                where f.escsecao_id = s.escsecao_id and f.loja = :loja
                  and f.dt_demiss is null
                  and upper(trim(nvl(f.status, 'A'))) in ('A', 'F', 'P')) as funcionarios_aptos,
              (select count(distinct p.escfunc_id) from sgn_esc_prog p
                where p.escsecao_id = s.escsecao_id and p.loja = :loja
                  and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
                  and nvl(p.ativa, 1) = 1) as funcionarios_com_escala
         from sgn_esc_secao s
        where s.codfilial = :loja
        order by s.cod_secao`, binds, options
    );
  const grants = await connection.execute(
      `select us.usuario_id, us.escsecao_id, us.status
         from sgn_esc_usuario_secao us
         join sgn_esc_secao s on s.escsecao_id = us.escsecao_id
        where s.codfilial = :loja`, { loja }, options
    );

  const enabled = Number(flag.rows[0].TODAS_SECOES_HABILITADAS) === 1;
  const sectionsById = new Map(sections.rows.map((section) => [Number(section.ESCSECAO_ID), section]));
  const grantsByUser = new Map();
  for (const grant of grants.rows) {
    const userId = Number(grant.USUARIO_ID);
    if (!grantsByUser.has(userId)) grantsByUser.set(userId, []);
    const section = sectionsById.get(Number(grant.ESCSECAO_ID));
    if (section) grantsByUser.get(userId).push({
      secaoId: Number(section.ESCSECAO_ID),
      codigo: section.COD_SECAO,
      secao: section.DESCR,
      vinculoAtivo: grant.STATUS === 'A',
      secaoDisponivel: section.STATUS === 'A' || (enabled
        && !/(^|\.)02\.012$/.test(String(section.COD_SECAO || ''))
        && Number(section.FUNCIONARIOS_APTOS) > 0),
      funcionariosComEscala: Number(section.FUNCIONARIOS_COM_ESCALA)
    });
  }

  return {
    loja, mesRef, todasSecoesHabilitadas: enabled,
    lideres: leaders.rows.map((leader) => ({
      usuarioId: Number(leader.USUARIO_ID), login: leader.LOGIN,
      status: leader.STATUS, secoes: grantsByUser.get(Number(leader.USUARIO_ID)) || []
    }))
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await initOraclePool();
  try {
    console.log(JSON.stringify(await withConnection((connection) => diagnosticar(connection, args)), null, 2));
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) main().catch((error) => {
  console.error(`Diagnostico interrompido: ${error.message}`);
  process.exitCode = 1;
});

module.exports = { parseArgs, diagnosticar };
