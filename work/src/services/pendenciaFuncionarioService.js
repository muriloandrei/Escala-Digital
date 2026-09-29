const { withConnection, oracledb } = require('../db/oracle');

async function assertSchema(connection) {
  const result = await connection.execute(
    "select count(*) as total from user_tables where table_name = 'SGN_ESC_PENDENCIA_FUNC'",
    {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  if (Number(result.rows[0]?.TOTAL || 0) > 0) return;
  const error = new Error('Pendencias operacionais indisponiveis. Execute a migration 20260929_pendencia_operacional_funcionario.sql.');
  error.statusCode = 503;
  throw error;
}

async function reconciliarComCadastro(connection, lojaId) {
  await connection.execute(
    `update sgn_esc_pendencia_func p
        set status = 'C', dt_hr_encerr = sysdate, origem_conciliacao =
          case when trunc(nvl(p.dt_fim, sysdate)) < trunc(sysdate) then 'PRAZO'
               when p.tipo = 'DESLIGAMENTO' then 'RM_DESLIGAMENTO'
               else 'RM_TRANSFERENCIA' end
      where p.loja = :lojaId and p.status = 'P'
        and (p.dt_fim < trunc(sysdate)
          or exists (
            select 1 from sgn_esc_funcionario f
             where f.escfunc_id = p.escfunc_id
               and ((p.tipo = 'DESLIGAMENTO' and f.dt_demiss is not null)
                 or (p.tipo = 'TRANSFERENCIA' and f.loja <> p.loja))
          ))`,
    { lojaId }, { autoCommit: true }
  );
}

async function listar({ lojaId, incluirEncerradas = false }) {
  return withConnection(async (connection) => {
    await assertSchema(connection);
    await reconciliarComCadastro(connection, lojaId);
    const result = await connection.execute(
      `select p.escpend_id, p.loja, p.escfunc_id, p.tipo, p.dt_inicio, p.dt_fim,
              p.justificativa, p.status, p.usuario_id, p.usuario_login, p.dt_hr_incl,
              p.usuario_encerramento, p.dt_hr_encerr, p.origem_conciliacao,
              f.chapa, f.nome, f.escsecao_id, f.loja as loja_atual
         from sgn_esc_pendencia_func p
         left join sgn_esc_funcionario f on f.escfunc_id = p.escfunc_id
        where p.loja = :lojaId ${incluirEncerradas ? '' : "and p.status = 'P'"}
        order by p.dt_hr_incl desc, p.escpend_id desc`,
      { lojaId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows || [];
  });
}

async function listarIdsSuspensos({ lojaId, inicio, fim }) {
  return withConnection(async (connection) => {
    await assertSchema(connection);
    await reconciliarComCadastro(connection, lojaId);
    const result = await connection.execute(
      `select escfunc_id from sgn_esc_pendencia_func
        where loja = :lojaId and status = 'P'
          and dt_inicio <= to_date(:fim, 'YYYY-MM-DD')
          and (dt_fim is null or dt_fim >= to_date(:inicio, 'YYYY-MM-DD'))`,
      { lojaId, inicio, fim }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return new Set((result.rows || []).map((row) => Number(row.ESCFUNC_ID)));
  });
}

async function contarDiasProgramados(connection, { lojaId, escfuncId, inicio, fim }) {
  const columns = await connection.execute(
    "select column_name from user_tab_columns where table_name = 'SGN_ESC_PROG' and column_name = 'ATIVA'",
    {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const ativaSql = columns.rows.length ? 'and nvl(p.ativa, 1) = 1' : '';
  const ativaInnerSql = columns.rows.length ? 'and nvl(px.ativa, 1) = 1' : '';
  const result = await connection.execute(
    `select count(*) as dias_programados, count(distinct p.mes_ref) as meses_impactados
       from sgn_esc_prog p
       join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
      where p.loja = :lojaId and p.escfunc_id = :escfuncId
        and d.dt between to_date(:inicio, 'YYYY-MM-DD') and to_date(:fim, 'YYYY-MM-DD')
        and nvl(d.programacao, 'TRB') = 'TRB'
        ${ativaSql}
        and p.revisao = (
          select max(px.revisao) from sgn_esc_prog px
           where px.loja = p.loja and px.mes_ref = p.mes_ref
             and px.escfunc_id = p.escfunc_id ${ativaInnerSql}
        )`,
    { lojaId, escfuncId, inicio, fim: fim || '9999-12-31' }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return {
    diasProgramados: Number(result.rows[0]?.DIAS_PROGRAMADOS || 0),
    mesesImpactados: Number(result.rows[0]?.MESES_IMPACTADOS || 0)
  };
}

async function criar({ lojaId, escfuncId, tipo, inicio, fim = null, justificativa, usuario }) {
  return withConnection(async (connection) => {
    try {
      await assertSchema(connection);
      await reconciliarComCadastro(connection, lojaId);
      const funcionario = await connection.execute(
        `select escfunc_id, loja, dt_demiss from sgn_esc_funcionario
          where escfunc_id = :escfuncId and loja = :lojaId for update wait 5`,
        { lojaId, escfuncId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (!funcionario.rows.length || funcionario.rows[0].DT_DEMISS) {
        const error = new Error('Funcionario ativo nao encontrado nesta loja. Confira a carga do RM.');
        error.statusCode = 404;
        throw error;
      }
      const aberta = await connection.execute(
        "select escpend_id from sgn_esc_pendencia_func where escfunc_id = :escfuncId and status = 'P'",
        { escfuncId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (aberta.rows.length) {
        const error = new Error('Ja existe uma pendencia operacional aberta para este funcionario.');
        error.statusCode = 409;
        throw error;
      }
      const impacto = await contarDiasProgramados(connection, { lojaId, escfuncId, inicio, fim });
      const insert = await connection.execute(
        `insert into sgn_esc_pendencia_func (
           escpend_id, loja, escfunc_id, tipo, dt_inicio, dt_fim, justificativa,
           status, usuario_id, usuario_login, dt_hr_incl
         ) values (
           sgn_esc_pendencia_func_seq.nextval, :lojaId, :escfuncId, :tipo,
           to_date(:inicio, 'YYYY-MM-DD'), to_date(:fim, 'YYYY-MM-DD'), :justificativa,
           'P', :usuarioId, :usuarioLogin, sysdate
         ) returning escpend_id into :id`,
        {
          lojaId, escfuncId, tipo, inicio, fim, justificativa,
          usuarioId: usuario?.sub ? Number(usuario.sub) : null,
          usuarioLogin: String(usuario?.login || '').slice(0, 100) || null,
          id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        }, { autoCommit: false }
      );
      await connection.commit();
      return { id: insert.outBinds.id[0], impacto };
    } catch (error) {
      await connection.rollback();
      if (error?.errorNum === 1) {
        const conflict = new Error('Ja existe uma pendencia operacional aberta para este funcionario.');
        conflict.statusCode = 409;
        throw conflict;
      }
      throw error;
    }
  });
}

async function encerrar({ lojaId, pendenciaId, usuario }) {
  return withConnection(async (connection) => {
    await assertSchema(connection);
    const result = await connection.execute(
      `update sgn_esc_pendencia_func
          set status = 'X', dt_hr_encerr = sysdate,
              usuario_encerramento = :usuarioLogin, origem_conciliacao = 'MANUAL'
        where escpend_id = :pendenciaId and loja = :lojaId and status = 'P'`,
      { lojaId, pendenciaId, usuarioLogin: String(usuario?.login || '').slice(0, 100) || null },
      { autoCommit: true }
    );
    return Number(result.rowsAffected || 0) > 0;
  });
}

module.exports = { listar, listarIdsSuspensos, criar, encerrar };
