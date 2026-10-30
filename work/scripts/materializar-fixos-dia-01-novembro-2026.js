const { withConnection, closeOraclePool, oracledb } = require('../src/db/oracle');
const { completarDomingoNovembro2026, getEscalaFuncionarioAtual } = require('../src/services/escalaService');

const MES_REF = '2026-11-01';
const DIA = '2026-11-01';

function parseArgs(args) {
  const lojaArg = args.find((arg) => /^--loja=[1-9]\d*$/.test(arg));
  const all = args.includes('--all');
  const apply = args.includes('--apply');
  const actorArg = args.find((arg) => /^--by=[\w.@-]{2,80}$/.test(arg));
  if (args.length !== 1 + Number(apply) + Number(Boolean(actorArg)) || Boolean(lojaArg) === all
    || (apply && !actorArg) || (!apply && actorArg)) {
    throw new Error('Use --loja=NUMERO ou --all [--apply --by=OPERADOR].');
  }
  return { loja: lojaArg ? Number(lojaArg.slice(7)) : null, apply, actor: actorArg?.slice(5) || null };
}

async function loadPending(connection, loja) {
  const result = await connection.execute(
    `select fx.loja, fx.escfunc_id, fx.escsecao_id, p.escfuncao_id, fx.programacao,
            fx.hr_ent1, fx.hr_sai1, fx.hr_ent2, fx.hr_sai2, fx.justificativa,
            p.escsecao_id as secao_escala, p.oficializada, p.revisao,
            f.chapa, f.status as funcionario_status,
            to_char(f.dt_demiss, 'YYYY-MM-DD') as dt_demiss,
            (select count(*) from sgn_esc_prog duplicada
              where duplicada.loja = p.loja and duplicada.mes_ref = p.mes_ref
                and duplicada.escfunc_id = p.escfunc_id and duplicada.revisao = p.revisao
                and nvl(duplicada.ativa, 1) = 1) as programacoes_na_revisao,
            case when exists (select 1 from sgn_esc_ausencia a
              where a.escfunc_id = fx.escfunc_id
                and fx.dt between trunc(a.dt_inic) and trunc(nvl(a.dt_fim, date '2099-12-31')))
              then 1 else 0 end as ausencia_01,
            case when exists (select 1 from sgn_esc_pendencia_func sp
              where sp.escfunc_id = fx.escfunc_id and sp.loja = fx.loja
                and sp.status = 'P' and sp.dt_inicio <= fx.dt
                and (sp.dt_fim is null or sp.dt_fim >= fx.dt))
              then 1 else 0 end as suspensao_01,
            (select count(*) from sgn_esc_fixo_escala duplicado
              where duplicado.loja = fx.loja and duplicado.mes_ref = fx.mes_ref
                and duplicado.escfunc_id = fx.escfunc_id and duplicado.dt = fx.dt) as fixos_na_data
       from sgn_esc_fixo_escala fx
       join sgn_esc_prog p on p.loja = fx.loja and p.mes_ref = fx.mes_ref
        and p.escfunc_id = fx.escfunc_id and nvl(p.ativa, 1) = 1
        and p.revisao = (select max(px.revisao) from sgn_esc_prog px
          where px.loja = p.loja and px.mes_ref = p.mes_ref
            and px.escfunc_id = p.escfunc_id and nvl(px.ativa, 1) = 1)
       join sgn_esc_funcionario f on f.escfunc_id = fx.escfunc_id
       join sgn_esc_secao s on s.escsecao_id = p.escsecao_id
      where fx.mes_ref = date '2026-11-01' and fx.dt = date '2026-11-01'
        and nvl(fx.status, 'A') = 'A'
        and not regexp_like(trim(nvl(s.cod_secao, ' ')), '(^|[.])01[.]001$')
        and (:loja is null or fx.loja = :loja)
        and exists (select 1 from sgn_esc_prog_dia d where d.escprog_id = p.escprog_id)
        and not exists (select 1 from sgn_esc_prog_dia d
          where d.escprog_id = p.escprog_id and d.dt = date '2026-11-01')
      order by fx.loja, fx.escfunc_id`,
    { loja }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return result.rows || [];
}

function blocker(row) {
  if (Number(row.FIXOS_NA_DATA) !== 1) return 'Mais de um fixo registrado para o dia.';
  if (Number(row.PROGRAMACOES_NA_REVISAO) !== 1) return 'Mais de uma programacao ativa na revisao atual.';
  if (Number(row.ESCSECAO_ID) !== Number(row.SECAO_ESCALA)) return 'Secao do fixo difere da escala ativa.';
  if (row.DT_DEMISS && row.DT_DEMISS < DIA) return 'Funcionario desligado antes de 01/11.';
  if (!['A', 'F', 'P'].includes(String(row.FUNCIONARIO_STATUS || '').trim().toUpperCase())) return 'Funcionario inativo.';
  if (Number(row.AUSENCIA_01) || Number(row.SUSPENSAO_01)) return 'Ausencia ou suspensao em 01/11 requer revisao individual.';
  if (!['FXF', 'TRB'].includes(String(row.PROGRAMACAO || '').toUpperCase())) return 'Programacao do fixo invalida.';
  return null;
}

function dateKey(value) {
  if (value instanceof Date) return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  return String(value || '').slice(0, 10);
}

function dayFromRow(row) {
  return { data: dateKey(row.DT), programacao: row.PROGRAMACAO,
    hrEnt1: row.HR_ENT1, hrSai1: row.HR_SAI1, hrEnt2: row.HR_ENT2, hrSai2: row.HR_SAI2 };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const pending = await withConnection((connection) => loadPending(connection, args.loja));
    const plans = pending.map((row) => ({ row, motivo: blocker(row) }));
    console.log(JSON.stringify({ modo: args.apply ? 'APLICACAO' : 'PREVIA', mesRef: MES_REF,
      dia: DIA, total: plans.length, aptos: plans.filter((plan) => !plan.motivo).length,
      bloqueados: plans.filter((plan) => plan.motivo).map(({ row, motivo }) => ({ loja: row.LOJA,
        chapa: row.CHAPA, motivo })),
      detalhes: plans.map(({ row, motivo }) => ({ loja: row.LOJA, chapa: row.CHAPA,
        escfuncId: row.ESCFUNC_ID, programacao: row.PROGRAMACAO, revisao: row.REVISAO,
        oficializada: Number(row.OFICIALIZADA) === 1, acao: motivo ? 'BLOQUEADA' : 'MATERIALIZAR' })) }, null, 2));
    if (!args.apply) return;
    let applied = 0;
    let failed = 0;
    for (const { row, motivo } of plans) {
      if (motivo) continue;
      try {
        const atual = await getEscalaFuncionarioAtual({ lojaId: Number(row.LOJA), mesRef: MES_REF,
          escfuncId: Number(row.ESCFUNC_ID) });
        if (!atual || Number(atual.revisao) !== Number(row.REVISAO)
          || Number(atual.header.ESCSECAO_ID) !== Number(row.SECAO_ESCALA)
          || atual.dias.some((day) => dateKey(day.DT) === DIA)) {
          throw new Error('Escala mudou desde a previa; execute novamente.');
        }
        const dias = [dayFromRow({ DT: DIA, PROGRAMACAO: row.PROGRAMACAO,
          HR_ENT1: row.HR_ENT1, HR_SAI1: row.HR_SAI1, HR_ENT2: row.HR_ENT2,
          HR_SAI2: row.HR_SAI2 }), ...atual.dias.map(dayFromRow)]
          .sort((left, right) => left.data.localeCompare(right.data));
        await completarDomingoNovembro2026({ lojaId: Number(row.LOJA), mesRef: MES_REF,
          funcionarios: [{ escfuncId: Number(row.ESCFUNC_ID),
            escsecaoId: Number(row.ESCSECAO_ID), escfuncaoId: Number(row.ESCFUNCAO_ID),
            chapa: row.CHAPA, revisaoBase: Number(row.REVISAO), dias }],
          oficializada: 0, actor: { login: args.actor }, acao: 'MATERIALIZAR_FIXO_DOMINGO_NOVEMBRO_2026' });
        applied += 1;
      } catch (error) {
        failed += 1;
        console.error(`FALHA loja=${row.LOJA} chapa=${row.CHAPA}: ${error.message}`);
      }
    }
    console.log(`Materializadas: ${applied}; bloqueadas: ${plans.filter((plan) => plan.motivo).length}; falhas: ${failed}.`);
    if (failed || plans.some((plan) => plan.motivo)) process.exitCode = 1;
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) main().catch((error) => {
  console.error(`Correcao interrompida: ${error.message}`);
  process.exitCode = 1;
});

module.exports = { parseArgs, blocker };
