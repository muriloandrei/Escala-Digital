const { createHash } = require('node:crypto');
const { initOraclePool, closeOraclePool } = require('../src/db/oracle');
const { getEnv } = require('../src/config/env');
const { getOperationalPeriodIso } = require('../src/domain/operationalPeriod');
const rm = require('../src/services/rmIntegrationService');
const audit = require('../src/services/auditService');

function parseArgs(args) {
  const lojaArg = args.find((arg) => /^--loja=[1-9]\d*$/.test(arg));
  const mesArg = args.find((arg) => /^--mes=\d{4}-(0[1-9]|1[0-2])$/.test(arg));
  const snapshotArg = args.find((arg) => /^--snapshot=[0-9a-f]{64}$/.test(arg));
  const byArg = args.find((arg) => /^--by=[\w.@-]{2,80}$/.test(arg));
  const apply = args.includes('--apply');
  if (!lojaArg || !mesArg || args.length !== 2 + (apply ? 3 : 0)
    || (apply && (!snapshotArg || !byArg)) || (!apply && (snapshotArg || byArg))) {
    throw new Error('Use --loja=306 --mes=2026-11 [--apply --by=OPERADOR --snapshot=SHA_DA_PREVIA].');
  }
  return { lojaId: Number(lojaArg.slice(7)), mesRef: `${mesArg.slice(6)}-01`, apply,
    operador: byArg?.slice(5) || null, snapshot: snapshotArg?.slice(11) || null };
}

function snapshotCandidatos(candidatos) {
  const resumo = candidatos.map((item) => [Number(item.ESCFUNC_ID), item.CHAPA,
    Number(item.ESCSECAO_ID), Number(item.REVISAO), Number(item.OFICIALIZADA),
    Number(item.DIAS), Number(item.FOLGAS), item.BLOQUEIO || '']);
  return createHash('sha256').update(JSON.stringify(resumo)).digest('hex');
}

async function main() {
  const { lojaId, mesRef, apply, operador, snapshot } = parseArgs(process.argv.slice(2));
  if (apply && !getEnv().rm.enabled) throw new Error('Integracao RM desabilitada.');
  await initOraclePool();
  try {
    const periodo = getOperationalPeriodIso(mesRef);
    const candidatos = await rm.listarCandidatosReenvioRm({ lojaId, mesRef });
    const hash = snapshotCandidatos(candidatos);
    console.log(`${apply ? 'APLICACAO' : 'PREVIA'} loja=${lojaId} mes=${mesRef} periodo=${periodo.inicio}..${periodo.fim} candidatos=${candidatos.length} snapshot=${hash}`);
    if (apply && hash !== snapshot) throw new Error('Candidatos ou revisoes mudaram desde a previa. Nenhum envio iniciado.');
    const resumo = { enviados: 0, falhas: 0, bloqueados: 0 };
    for (const item of candidatos) {
      const base = `escfunc=${item.ESCFUNC_ID} chapa=${item.CHAPA} revisao=${item.REVISAO} oficializada=${item.OFICIALIZADA} dias=${item.DIAS} folgas=${item.FOLGAS}`;
      if (item.BLOQUEIO) {
        resumo.bloqueados += 1;
        console.log(`${base} BLOQUEADO ${item.BLOQUEIO}`);
        continue;
      }
      if (!apply) {
        console.log(`${base} APTO`);
        continue;
      }
      try {
        const resultado = await rm.reenviarRevisaoAtualRm({ lojaId, mesRef,
          escfuncId: Number(item.ESCFUNC_ID), revisaoEsperada: Number(item.REVISAO) });
        await audit.registerAudit({ action: 'REENVIAR_REVISAO_RM', user: { login: operador, perfil: 'OPERADOR' },
          lojaId, mesRef, revisao: Number(item.REVISAO), details: { escfuncId: item.ESCFUNC_ID,
            chapa: item.CHAPA, status: resultado.status, oficializada: resultado.oficializada,
            erros: resultado.erros?.join('; ') || null } });
        resumo[resultado.status === 'ENVIADO' ? 'enviados' : 'falhas'] += 1;
        console.log(`${base} ${resultado.status}${resultado.erros?.length ? ` ${resultado.erros.join('; ')}` : ''}`);
      } catch (error) {
        resumo.falhas += 1;
        console.log(`${base} FALHA ${error.message}`);
      }
    }
    console.log(`Resumo: ${JSON.stringify(resumo)}. ${apply ? 'Confira as falhas antes de repetir.' : 'Nenhum envio executado.'}`);
    if (apply && (resumo.falhas || resumo.bloqueados)) process.exitCode = 1;
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Reenvio interrompido: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { parseArgs, snapshotCandidatos, main };
