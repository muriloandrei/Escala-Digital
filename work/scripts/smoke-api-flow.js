#!/usr/bin/env node

const DEFAULT_BASE_URL = 'http://127.0.0.1:3000';
const DEFAULT_MONTH = '2028-01-01';

const baseUrl = (process.env.SMOKE_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
const login = process.env.SMOKE_LOGIN || 'admin';
const password = process.env.SMOKE_PASSWORD || 'admin123';
const lojaId = Number(process.env.SMOKE_LOJA_ID || 1);
const mesRef = process.env.SMOKE_MES_REF || DEFAULT_MONTH;
const allowWrite = process.env.SMOKE_ALLOW_WRITE === 'true' || /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i.test(baseUrl);

let cookieHeader = '';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function monthDays(mesRefValue) {
  const [year, month] = mesRefValue.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const days = [];

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, month - 1, day);
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const descanso = date.getDay() === 0 || date.getDay() === 6;

    days.push(descanso
      ? {
          data: iso,
          hrEnt1: null,
          hrSai1: null,
          hrEnt2: null,
          hrSai2: null,
          programacao: 'F',
          justificativa: 'Smoke test automatico'
        }
      : {
          data: iso,
          hrEnt1: '08:00',
          hrSai1: '12:00',
          hrEnt2: '13:10',
          hrSai2: '17:58',
          programacao: 'TRB',
          justificativa: 'Smoke test automatico'
        });
  }

  return days;
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    cookieHeader = setCookie.split(',').map((item) => item.split(';')[0]).join('; ');
  }

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch (_) {
      body = text;
    }
  }

  if (!response.ok) {
    const details = typeof body === 'string' ? body : JSON.stringify(body);
    throw new Error(`${options.method || 'GET'} ${path} retornou HTTP ${response.status}: ${details}`);
  }

  return body;
}

function first(array, label) {
  assert(Array.isArray(array) && array.length > 0, `${label} nao retornou registros.`);
  return array[0];
}

async function inativarEscalaSeExistir() {
  try {
    const resumo = await request(`/api/escalas/resumo?lojaId=${encodeURIComponent(lojaId)}&mesRef=${encodeURIComponent(mesRef)}`);
    if (Array.isArray(resumo.escalas) && resumo.escalas.length > 0) {
      await request('/api/escalas/inativar', {
        method: 'POST',
        body: { lojaId, mesRef }
      });
      return true;
    }
  } catch (error) {
    if (!/HTTP 404/.test(error.message)) throw error;
  }
  return false;
}

async function main() {
  assert(allowWrite, 'Smoke com escrita bloqueado. Use SMOKE_ALLOW_WRITE=true para executar fora de localhost.');

  const report = [];
  await request('/api/auth/login', { method: 'POST', body: { login, password } });
  report.push('login');

  const me = await request('/api/auth/me');
  assert(me.user?.login, 'Sessao autenticada nao retornou usuario.');
  report.push('sessao');

  const health = await request('/health');
  assert(health.status === 'ok', 'Health check nao retornou ok.');
  report.push('health');

  const perfis = await request('/api/acessos/perfis');
  assert(Array.isArray(perfis.perfis), 'Perfis de acesso nao retornaram lista.');
  assert(Array.isArray(first(perfis.perfis, 'perfis').PERMISSOES), 'Perfil nao retornou permissoes.');
  report.push('permissoes');

  const secoes = await request(`/api/catalog/lojas/${lojaId}/secoes`);
  first(secoes.secoes, 'secoes');
  const turnos = await request(`/api/catalog/lojas/${lojaId}/turnos-secao`);
  const turno = first(turnos.turnos, 'turnos por secao');
  const funcionarios = await request(`/api/catalog/lojas/${lojaId}/funcionarios`);
  const funcionario = first(
    funcionarios.funcionarios.filter((item) => Number(item.ESCSECAO_ID) === Number(turno.ESCSECAO_ID)),
    'funcionarios da secao do turno'
  );
  const tipos = await request('/api/catalog/tipos-descanso');
  assert(Array.isArray(tipos.tipos), 'Tipos de descanso nao retornaram lista.');
  const regras = await request('/api/escalas/regras');
  assert(Array.isArray(regras.regras) && regras.regras.length >= 6, 'Regras vigentes incompletas.');
  report.push('catalogos');

  await inativarEscalaSeExistir();

  const payload = {
    lojaId,
    mesRef,
    oficializada: 0,
    funcionarios: [{
      escfuncId: Number(funcionario.ESCFUNC_ID),
      chapa: String(funcionario.CHAPA),
      nome: String(funcionario.NOME),
      escsecaoId: Number(funcionario.ESCSECAO_ID),
      escfuncaoId: Number(funcionario.ESCFUNCAO_ID),
      escsecaoTurnoId: Number(turno.ESCSECAOTURNO_ID),
      dias: monthDays(mesRef)
    }]
  };

  const validacaoInicial = await request('/api/escalas/validar', { method: 'POST', body: payload });
  assert(validacaoInicial.ok === true, `Validacao inicial falhou: ${JSON.stringify(validacaoInicial.errors || [])}`);
  report.push('validacao inicial');

  const saved = await request('/api/escalas', { method: 'POST', body: payload });
  assert(saved.saved?.length === 1, 'Salvamento inicial nao retornou 1 escala.');
  report.push('salvar escala');

  const resumo = await request(`/api/escalas/resumo?lojaId=${lojaId}&mesRef=${encodeURIComponent(mesRef)}`);
  assert(resumo.escalas?.length === 1, 'Resumo nao encontrou a escala salva.');
  assert(resumo.escalas[0].STATUS === 'AGENDADA', `Status esperado AGENDADA, recebido ${resumo.escalas[0].STATUS}.`);

  const mensal = await request(`/api/escalas/mensal?lojaId=${lojaId}&mesRef=${encodeURIComponent(mesRef)}`);
  assert(mensal.escala?.dias?.length >= 28, 'Consulta mensal nao retornou dias da escala.');
  report.push('consultas escala');

  const revisaoPayload = JSON.parse(JSON.stringify(payload));
  revisaoPayload.justificativa = 'Smoke test revisao individual';
  revisaoPayload.funcionarios[0].dias[3] = {
    ...revisaoPayload.funcionarios[0].dias[3],
    hrEnt1: null,
    hrSai1: null,
    hrEnt2: null,
    hrSai2: null,
    programacao: 'F',
    justificativa: 'Smoke test revisao individual'
  };

  const validacaoRevisao = await request('/api/escalas/validar', { method: 'POST', body: revisaoPayload });
  assert(validacaoRevisao.ok === true, `Validacao da revisao falhou: ${JSON.stringify(validacaoRevisao.errors || [])}`);
  const revisao = await request('/api/escalas/funcionario/revisao', { method: 'POST', body: revisaoPayload });
  assert(revisao.saved?.length === 1, 'Revisao individual nao foi salva.');
  assert(Number(revisao.saved[0].revisao) === 1, `Revisao esperada 1, recebida ${revisao.saved[0].revisao}.`);
  report.push('revisao individual');

  const historico = await request(`/api/escalas/historico?lojaId=${lojaId}&mesRef=${encodeURIComponent(mesRef)}`);
  assert(Array.isArray(historico.historico) && historico.historico.length >= 2, 'Historico nao registrou criacao/revisao.');
  report.push('auditoria');

  const oficializar = await request('/api/escalas/oficializar', { method: 'POST', body: { lojaId, mesRef } });
  assert(oficializar.ok === true, 'Oficializacao nao retornou ok.');
  report.push('oficializacao');

  const rmLogs = await request(`/api/escalas/rm/logs?lojaId=${lojaId}&mesRef=${encodeURIComponent(mesRef)}`);
  assert(Array.isArray(rmLogs.logs), 'Logs RM nao retornaram lista.');
  report.push('rm logs');

  const inativar = await request('/api/escalas/inativar', { method: 'POST', body: { lojaId, mesRef } });
  assert(inativar.ok === true, 'Inativacao nao retornou ok.');
  const resumoFinal = await request(`/api/escalas/resumo?lojaId=${lojaId}&mesRef=${encodeURIComponent(mesRef)}`);
  assert((resumoFinal.escalas || []).length === 0, 'Escala inativada continuou aparecendo no resumo.');
  report.push('inativacao');

  console.log(JSON.stringify({
    ok: true,
    baseUrl,
    lojaId,
    mesRef,
    usuario: me.user.login,
    funcionario: `${funcionario.CHAPA} - ${funcionario.NOME}`,
    etapas: report
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
