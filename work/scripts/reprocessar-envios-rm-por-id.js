const { initOraclePool, closeOraclePool, withConnection, oracledb } = require('../src/db/oracle');
const { getEnv } = require('../src/config/env');
const rm = require('../src/services/rmIntegrationService');

const MOTIVOS = {
  'cabecalho-200': /HTTP 200 ao criar cabecalho da tabela de folga; detalhes nao reenviados/i,
  duplicada: /Chave duplicada/i
};

function parseArgs(args) {
  const idsArg = args.find((arg) => /^--ids=/.test(arg));
  const motivoArg = args.find((arg) => /^--motivo=/.test(arg));
  const apply = args.includes('--apply');
  const byArg = args.find((arg) => /^--by=[\w.@-]{2,80}$/.test(arg));
  const idsTexto = idsArg?.slice(6) || '';
  const motivo = motivoArg?.slice(9) || '';
  const ids = /^\d+(,\d+)*$/.test(idsTexto) ? idsTexto.split(',').map(Number) : [];
  if (!MOTIVOS[motivo] || !ids.length || ids.length > 100
    || ids.some((id) => !Number.isSafeInteger(id) || id < 1)
    || new Set(ids).size !== ids.length
    || (apply && !byArg) || (!apply && byArg)
    || args.length !== 2 + Number(apply) + Number(Boolean(byArg))) {
    throw new Error('Use --ids=ID,ID --motivo=cabecalho-200|duplicada [--apply --by=OPERADOR].');
  }
  return { ids, motivo, apply, operador: byArg?.slice(5) || null };
}

function avaliarEnvio(envio, plano, motivo) {
  if (!envio) return 'Envio nao encontrado.';
  if (String(envio.STATUS) !== 'INCERTO') return `Status atual ${envio.STATUS}; esperado INCERTO.`;
  if (!MOTIVOS[motivo].test(String(envio.ERRO || ''))) return 'Erro atual nao corresponde ao motivo selecionado.';
  if (plano.acao !== 'REPROCESSAR') return plano.motivo || `Acao atual ${plano.acao}; esperado REPROCESSAR.`;
  if (Number(plano.envio?.ENVIO_ID) !== Number(envio.ENVIO_ID)
    || Number(plano.revisao) !== Number(envio.REVISAO)) {
    return 'Revisao ou envio atual mudou; reprocessamento bloqueado.';
  }
  return null;
}

async function main() {
  const { ids, motivo, apply, operador } = parseArgs(process.argv.slice(2));
  if (apply && !getEnv().rm.enabled) throw new Error('Integracao RM desabilitada.');
  await initOraclePool();
  try {
    const binds = Object.fromEntries(ids.map((id, index) => [`id${index}`, id]));
    const placeholders = ids.map((_, index) => `:id${index}`).join(', ');
    const result = await withConnection((connection) => connection.execute(
      `select envio_id, loja, mes_ref, escfunc_id, revisao, status, erro
         from sgn_esc_rm_envio where envio_id in (${placeholders})`,
      binds, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ));
    const porId = new Map((result.rows || []).map((row) => [Number(row.ENVIO_ID), row]));
    const planos = [];
    for (const id of ids) {
      const envio = porId.get(id);
      const plano = envio && String(envio.STATUS) === 'INCERTO' && MOTIVOS[motivo].test(String(envio.ERRO || ''))
        ? await rm.prepararGrupoRmComErro(envio) : null;
      const bloqueio = avaliarEnvio(envio, plano, motivo);
      planos.push({ id, envio, bloqueio });
      console.log(`envio=${id} loja=${envio?.LOJA ?? '-'} revisao=${envio?.REVISAO ?? '-'} acao=${bloqueio ? 'BLOQUEADO' : 'APTO'}${bloqueio ? ` motivo=${bloqueio}` : ''}`);
    }
    const bloqueados = planos.filter((item) => item.bloqueio);
    console.log(`${apply ? 'APLICACAO' : 'PREVIA'} motivo=${motivo} operador=${operador || '-'} total=${ids.length} aptos=${ids.length - bloqueados.length} bloqueados=${bloqueados.length}.`);
    if (bloqueados.length) {
      process.exitCode = 1;
      return;
    }
    if (!apply) return;

    for (const { id, envio } of planos) {
      const resultado = await rm.reprocessarGrupoRmComErro(envio, {
        expectedEnvioId: id, expectedErro: String(envio.ERRO || '')
      });
      console.log(`envio=${id} resultado=${resultado.acao}${resultado.motivo ? ` motivo=${resultado.motivo}` : ''}`);
      if (resultado.acao !== 'ENVIADO') process.exitCode = 1;
    }
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Reprocessamento interrompido: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { parseArgs, avaliarEnvio, main };
