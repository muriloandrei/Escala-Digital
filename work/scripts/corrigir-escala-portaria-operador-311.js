const { getEnv } = require('../src/config/env');
const { withConnection, closeOraclePool, oracledb } = require('../src/db/oracle');
const escalaEventService = require('../src/services/escalaEventService');
const monthlyReleaseService = require('../src/services/monthlyReleaseService');

const LOJA = 311;
const MES_REF = '2026-11-01';
const ESCFUNC_ID = 21632;
const ESCPROG_ID = 80715;
const SECAO_ANTIGA = 5444;
const SECAO_ATUAL = 5442;

function parseArgs(args) {
  if (!args.length) return { apply: false, actor: null };
  if (args.length === 2 && args[0] === '--apply' && /^--by=[\w.@-]{2,80}$/.test(args[1])) {
    return { apply: true, actor: args[1].slice(5) };
  }
  throw new Error('Use sem argumentos para previa, ou --apply --by=OPERADOR para aplicar.');
}

async function loadState(connection) {
  const source = await connection.execute(
    `select p.escprog_id, p.escfunc_id, p.loja, to_char(p.mes_ref, 'YYYY-MM-DD') as mes_ref,
            p.escsecao_id, p.revisao, p.ativa, p.oficializada,
            antiga.cod_secao as secao_antiga_codigo, antiga.codfilial as filial_antiga,
            fn_antiga.descr as funcao_programada,
            f.loja as loja_atual, f.escsecao_id as secao_atual_id,
            f.status as funcionario_status, f.dt_demiss,
            atual.cod_secao as secao_atual_codigo, atual.codfilial as filial_atual,
            atual.status as secao_atual_status, fn_atual.descr as funcao_atual,
            (select count(*) from sgn_esc_prog_dia d where d.escprog_id = p.escprog_id) as dias,
            (select count(*) from sgn_esc_prog_dia d
              where d.escprog_id = p.escprog_id and d.dt >= trunc(sysdate)) as dias_futuros
       from sgn_esc_prog p
       join sgn_esc_funcionario f on f.escfunc_id = p.escfunc_id
       join sgn_esc_secao antiga on antiga.escsecao_id = p.escsecao_id
       join sgn_esc_secao atual on atual.escsecao_id = f.escsecao_id
       left join sgn_esc_funcao fn_antiga on fn_antiga.escfuncao_id = p.escfuncao_id
       left join sgn_esc_funcao fn_atual on fn_atual.escfuncao_id = f.escfuncao_id
      where p.escprog_id = :escprogId`,
    { escprogId: ESCPROG_ID }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const active = await connection.execute(
    `select p.escprog_id, p.escsecao_id, p.revisao, p.oficializada,
            (select count(*) from sgn_esc_prog_dia d where d.escprog_id = p.escprog_id) as dias
       from sgn_esc_prog p
      where p.escfunc_id = :escfuncId and p.loja = :loja
        and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD') and nvl(p.ativa, 1) = 1
      order by p.revisao desc, p.escprog_id desc`,
    { escfuncId: ESCFUNC_ID, loja: LOJA, mesRef: MES_REF }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return { source: source.rows[0] || null, active: active.rows || [] };
}

function evaluateState({ source, active }) {
  const blockers = [];
  if (!source) return { action: 'BLOQUEADA', blockers: [`Programacao ${ESCPROG_ID} nao encontrada.`] };
  const is = (value, expected) => value !== null && value !== undefined && Number(value) === expected;
  const role = (value) => String(value || '').trim().toUpperCase();
  if (!is(source.ESCPROG_ID, ESCPROG_ID) || !is(source.ESCFUNC_ID, ESCFUNC_ID) || !is(source.LOJA, LOJA)
      || source.MES_REF !== MES_REF || !is(source.ESCSECAO_ID, SECAO_ANTIGA)
      || !is(source.REVISAO, 17) || !is(source.OFICIALIZADA, 0)
      || String(source.SECAO_ANTIGA_CODIGO || '').trim() !== '311.02.012'
      || !is(source.FILIAL_ANTIGA, LOJA) || role(source.FUNCAO_PROGRAMADA) !== 'PORTEIRO') {
    blockers.push('Identidade ou estado da programacao antiga divergiu da previa aprovada.');
  }
  if (!is(source.LOJA_ATUAL, LOJA) || !is(source.SECAO_ATUAL_ID, SECAO_ATUAL)
      || String(source.SECAO_ATUAL_CODIGO || '').trim() !== '311.02.002'
      || !is(source.FILIAL_ATUAL, LOJA) || role(source.SECAO_ATUAL_STATUS) !== 'A'
      || role(source.FUNCAO_ATUAL) !== 'OPERADOR DE SUPERMERCADO'
      || role(source.FUNCIONARIO_STATUS) !== 'A' || source.DT_DEMISS) {
    blockers.push('Cadastro atual nao corresponde ao Operador ativo da secao 5442.');
  }
  if (!is(source.DIAS, 35)) blockers.push('Os 35 dias originais nao estao intactos.');
  if (blockers.length) return { action: 'BLOQUEADA', blockers };

  if (is(source.ATIVA, 1)) {
    if (!is(source.DIAS_FUTUROS, 35)) blockers.push('Nem todos os dias originais ainda sao futuros.');
    if (active.length !== 1 || !is(active[0]?.ESCPROG_ID, ESCPROG_ID)) {
      blockers.push('Existe outra programacao ativa para o funcionario em novembro.');
    }
    return { action: blockers.length ? 'BLOQUEADA' : 'DESATIVAR_E_GERAR', blockers };
  }
  if (!is(source.ATIVA, 0)) {
    return { action: 'BLOQUEADA', blockers: ['Estado ATIVA da programacao antiga nao reconhecido.'] };
  }
  if (active.length === 0) return { action: 'GERAR', blockers: [] };
  if (active.length === 1 && is(active[0].ESCSECAO_ID, SECAO_ATUAL)
      && Number(active[0].DIAS) > 0 && !is(active[0].OFICIALIZADA, 1)) {
    return { action: 'CONCLUIDA', blockers: [] };
  }
  return { action: 'BLOQUEADA', blockers: ['Programacao ativa inesperada apos a desativacao.'] };
}

async function deactivateSource(connection, actor, appendEvent = escalaEventService.appendEvent) {
  try {
    await connection.execute(
      'select escprog_id from sgn_esc_prog where escprog_id = :escprogId for update',
      { escprogId: ESCPROG_ID }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await connection.execute(
      'select escfunc_id from sgn_esc_funcionario where escfunc_id = :escfuncId for update',
      { escfuncId: ESCFUNC_ID }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const state = await loadState(connection);
    const review = evaluateState(state);
    if (review.action !== 'DESATIVAR_E_GERAR') {
      if (review.action === 'GERAR' || review.action === 'CONCLUIDA') return review.action;
      throw new Error(review.blockers.join(' '));
    }
    const changed = await connection.execute(
      `update sgn_esc_prog set ativa = 0
        where escprog_id = :escprogId and ativa = 1 and oficializada = 0`,
      { escprogId: ESCPROG_ID }, { autoCommit: false }
    );
    if (changed.rowsAffected !== 1) throw new Error('Programacao antiga mudou antes da desativacao.');
    await appendEvent(connection, {
      operacaoId: escalaEventService.createOperationId(), lojaId: LOJA, mesRef: MES_REF,
      escfuncId: ESCFUNC_ID, escsecaoId: SECAO_ATUAL,
      revisaoAnterior: 17, revisaoNova: null,
      actor: { login: actor }, acao: 'INATIVAR_ESCALA_FUNCAO', origem: 'SISTEMA', situacao: 'RASCUNHO',
      detalhe: {
        motivo: 'Cadastro atual mudou de Porteiro para Operador de Supermercado.',
        escprogId: ESCPROG_ID, diasPreservados: 35,
        secaoAntigaId: SECAO_ANTIGA, secaoAtualId: SECAO_ATUAL
      }
    });
    await connection.commit();
    return 'GERAR';
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const expectedSchema = getEnv().oracle.user.toUpperCase();
    const state = await withConnection(async (connection) => {
      const schema = await connection.execute('select user as schema_user from dual', {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT });
      if (String(schema.rows[0]?.SCHEMA_USER || '').toUpperCase() !== expectedSchema
          || expectedSchema !== 'ESCALAINT') throw new Error('Conexao Oracle nao esta no schema ESCALAINT.');
      return loadState(connection);
    });
    const review = evaluateState(state);
    console.log(JSON.stringify({ modo: args.apply ? 'APLICACAO' : 'PREVIA',
      loja: LOJA, mesRef: MES_REF, escfuncId: ESCFUNC_ID,
      origemId: ESCPROG_ID, secaoAtualId: SECAO_ATUAL,
      acao: review.action, blockers: review.blockers }, null, 2));
    if (review.blockers.length || !args.apply || review.action === 'CONCLUIDA') {
      if (review.blockers.length) process.exitCode = 1;
      return;
    }

    const action = await withConnection((connection) => deactivateSource(connection, args.actor));
    if (action === 'CONCLUIDA') return;
    console.log('Programacao antiga preservada como inativa. Gerando a escala na secao atual...');
    const generated = await monthlyReleaseService.gerarEscalaSecao({
      lojaId: LOJA, mesRef: MES_REF, escsecaoId: SECAO_ATUAL,
      escfuncIds: [ESCFUNC_ID], actor: { login: args.actor }
    });
    if (!generated.criada || generated.funcionarios !== 1) {
      throw new Error(`Geracao nao concluida: ${generated.motivo || 'resultado inesperado'}. A escala antiga permanece inativa; repita este comando depois de corrigir a causa.`);
    }
    const finalState = await withConnection(loadState);
    const finalReview = evaluateState(finalState);
    if (finalReview.action !== 'CONCLUIDA') {
      throw new Error('Geracao retornou sucesso, mas a nova escala nao passou na verificacao. Revise antes de repetir.');
    }
    console.log(JSON.stringify({ resultado: 'CONCLUIDA', funcionarios: generated.funcionarios,
      criticas: generated.criticas?.length || 0,
      primeirasCriticas: (generated.criticas || []).slice(0, 10) }, null, 2));
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) {
  main().catch((error) => { console.error(`Correcao interrompida: ${error.message}`); process.exitCode = 1; });
}

module.exports = { parseArgs, evaluateState, deactivateSource };
