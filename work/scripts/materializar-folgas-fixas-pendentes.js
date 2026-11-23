const { withConnection, closeOraclePool, oracledb } = require('../src/db/oracle');
const { getOperationalPeriodIso } = require('../src/domain/operationalPeriod');
const escalaService = require('../src/services/escalaService');

function parseArgs(args) {
  const values = new Map();
  let apply = false;
  for (const arg of args) {
    if (arg === '--apply') { apply = true; continue; }
    const match = /^--(loja|mes|dia|chapas|by)=(.+)$/.exec(arg);
    if (!match || values.has(match[1])) throw new Error('Argumentos invalidos ou repetidos.');
    values.set(match[1], match[2]);
  }
  const loja = Number(values.get('loja'));
  const mesRef = values.get('mes');
  const dia = values.get('dia');
  const chapas = String(values.get('chapas') || '').split(',');
  const actor = values.get('by');
  if (!Number.isSafeInteger(loja) || loja < 1 || !/^\d{4}-\d{2}-01$/.test(mesRef || '')
    || !/^\d{4}-\d{2}-\d{2}$/.test(dia || '')
    || !chapas.length || chapas.some((chapa) => !/^\d{3}\.\d{4}$/.test(chapa))
    || new Set(chapas).size !== chapas.length
    || (apply && !/^[\w.@-]{2,80}$/.test(actor || '')) || (!apply && actor)) {
    throw new Error('Use --loja=313 --mes=2026-12-01 --dia=2026-12-06 --chapas=313.0290,313.0308 [--apply --by=OPERADOR].');
  }
  const periodo = getOperationalPeriodIso(mesRef);
  if (dia < periodo.inicio || dia > periodo.fim) throw new Error('Dia fora do periodo operacional informado.');
  return { loja, mesRef, dia, chapas, apply, actor };
}

function dateKey(value) {
  if (value instanceof Date) return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  return String(value || '').slice(0, 10);
}

function blocker({ funcionario, fixos, escala, ausencia, suspensao, dia, hojeIso }) {
  if (!funcionario) return 'Funcionario nao encontrado nesta loja.';
  if (fixos.length !== 1) return 'Esperado exatamente um fixo ativo na data.';
  if (String(fixos[0].PROGRAMACAO).toUpperCase() !== 'FXF') return 'Este reparo aceita apenas folga fixa FXF.';
  if (!escala?.dias?.length) return 'Funcionario sem dias na revisao ativa.';
  const diaGravado = escala.dias.find((item) => dateKey(item.DT) === dia);
  if (diaGravado) return String(diaGravado.PROGRAMACAO).toUpperCase() === 'FXF'
    ? 'JA_MATERIALIZADO' : 'Dia da revisao diverge da folga fixa.';
  if (Number(escala.header.OFICIALIZADA) === 1) return 'Revisao ativa ja oficializada.';
  if (Number(fixos[0].ESCSECAO_ID) !== Number(escala.header.ESCSECAO_ID)
    || Number(funcionario.ESCSECAO_ID) !== Number(escala.header.ESCSECAO_ID)) return 'Secao do fixo, cadastro e escala divergem.';
  if (!['A', 'F', 'P', 'Z'].includes(String(funcionario.STATUS || '').trim().toUpperCase())) return 'Funcionario inativo.';
  if (funcionario.DT_ADMISS && dia < dateKey(funcionario.DT_ADMISS)) return 'Dia anterior a admissao.';
  if (funcionario.DT_DEMISS && dia > dateKey(funcionario.DT_DEMISS)) return 'Dia posterior a demissao.';
  if (dia < hojeIso) return 'Dia retroativo requer analise individual.';
  if (ausencia) return 'Dia coberto por afastamento ou ferias.';
  if (suspensao) return 'Dia coberto por suspensao operacional.';
  return null;
}

async function loadCandidate({ loja, mesRef, dia, chapa, hojeIso }) {
  const result = await withConnection(async (connection) => {
    const employee = await connection.execute(
      `select escfunc_id, escsecao_id, chapa, nome, status, dt_admiss, dt_demiss
         from sgn_esc_funcionario where loja = :loja and chapa = :chapa`,
      { loja, chapa }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const funcionario = employee.rows.length === 1 ? employee.rows[0] : null;
    if (!funcionario) return { funcionario: null, ausente: employee.rows.length > 1 ? 'Cadastro duplicado.' : null };
    const absence = await connection.execute(
      `select count(*) as total from sgn_esc_ausencia
        where escfunc_id = :escfuncId and to_date(:dia, 'YYYY-MM-DD') between trunc(dt_inic) and trunc(nvl(dt_fim, date '2099-12-31'))`,
      { escfuncId: funcionario.ESCFUNC_ID, dia }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const suspension = await connection.execute(
      `select count(*) as total from sgn_esc_pendencia_func
        where loja = :loja and escfunc_id = :escfuncId and status = 'P'
          and dt_inicio <= to_date(:dia, 'YYYY-MM-DD')
          and (dt_fim is null or dt_fim >= to_date(:dia, 'YYYY-MM-DD'))`,
      { loja, escfuncId: funcionario.ESCFUNC_ID, dia }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return { funcionario, ausencia: Number(absence.rows[0]?.TOTAL) > 0,
      suspensao: Number(suspension.rows[0]?.TOTAL) > 0 };
  });
  if (result.ausente) return { chapa, motivo: result.ausente };
  if (!result.funcionario) return { chapa, motivo: 'Funcionario nao encontrado nesta loja.' };
  const escfuncId = Number(result.funcionario.ESCFUNC_ID);
  const [fixos, escala] = await Promise.all([
    escalaService.listFixosEscala({ lojaId: loja, mesRef }),
    escalaService.getEscalaFuncionarioAtual({ lojaId: loja, mesRef, escfuncId })
  ]);
  const fixosDia = fixos.filter((fixo) => Number(fixo.ESCFUNC_ID) === escfuncId && dateKey(fixo.DT) === dia);
  const motivo = blocker({ ...result, fixos: fixosDia, escala, dia, hojeIso });
  return { chapa, escfuncId, revisao: escala?.revisao ?? null, fixo: fixosDia[0] || null, motivo };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const hojeIso = dateKey(new Date());
    const plans = [];
    for (const chapa of args.chapas) plans.push(await loadCandidate({ ...args, chapa, hojeIso }));
    console.log(JSON.stringify({ modo: args.apply ? 'APLICACAO' : 'PREVIA', loja: args.loja,
      mesRef: args.mesRef, dia: args.dia, planos: plans.map(({ chapa, escfuncId, revisao, motivo }) =>
        ({ chapa, escfuncId, revisao, acao: motivo === 'JA_MATERIALIZADO' ? 'JA_MATERIALIZADO'
          : motivo ? 'BLOQUEADO' : 'MATERIALIZAR', motivo: motivo === 'JA_MATERIALIZADO' ? null : motivo })) }, null, 2));
    if (!args.apply) return;
    if (plans.some((plan) => plan.motivo && plan.motivo !== 'JA_MATERIALIZADO')) {
      throw new Error('Ha candidatos bloqueados. Nenhuma alteracao executada.');
    }
    for (const plan of plans) {
      if (plan.motivo === 'JA_MATERIALIZADO') continue;
      const fixo = plan.fixo;
      await escalaService.saveFixoEscala({ lojaId: args.loja, mesRef: args.mesRef,
        escfuncId: plan.escfuncId, escsecaoId: Number(fixo.ESCSECAO_ID),
        expectedRevision: plan.revisao, expectedFixo: fixo, actor: { login: args.actor },
        data: { DT: args.dia, PROGRAMACAO: 'FXF', JUSTIFICATIVA: fixo.JUSTIFICATIVA } });
      const atual = await escalaService.getEscalaFuncionarioAtual({ lojaId: args.loja,
        mesRef: args.mesRef, escfuncId: plan.escfuncId });
      const gravado = atual?.dias?.find((item) => dateKey(item.DT) === args.dia);
      if (!gravado || String(gravado.PROGRAMACAO).toUpperCase() !== 'FXF') {
        throw new Error(`Fixo de ${plan.chapa} nao confirmado na revisao ativa; confira o banco.`);
      }
      console.log(`MATERIALIZADO chapa=${plan.chapa} revisao=${atual.revisao} dia=${args.dia}`);
    }
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) main().catch((error) => {
  console.error(`Materializacao interrompida: ${error.message}`);
  process.exitCode = 1;
});

module.exports = { parseArgs, blocker };
