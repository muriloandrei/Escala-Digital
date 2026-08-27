#!/usr/bin/env node

const DEFAULT_BASE_URL = 'http://127.0.0.1:3000';
const baseUrl = (process.env.SMOKE_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
const password = process.env.SMOKE_PASSWORD || 'admin123';
const mesRef = process.env.SMOKE_MES_REF || '2026-08-01';

const profiles = [
  { login: 'admin', canCreate: true, canAccessUsers: true },
  { login: 'rh', canCreate: true, canAccessUsers: true },
  { login: 'lider', canCreate: false, canAccessUsers: false },
  { login: 'operador', canCreate: false, canAccessUsers: false }
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, options = {}, session) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(session.cookie ? { Cookie: session.cookie } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const setCookie = response.headers.get('set-cookie');
  if (setCookie) session.cookie = setCookie.split(',').map((item) => item.split(';')[0]).join('; ');

  const text = await response.text();
  let body = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }

  if (!response.ok) {
    const error = new Error(`${options.method || 'GET'} ${path} HTTP ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function expectStatus(path, expectedStatus, session, options = {}) {
  try {
    await request(path, options, session);
    assert(expectedStatus < 400, `${path} deveria retornar ${expectedStatus}, mas retornou sucesso`);
    return expectedStatus;
  } catch (error) {
    assert(error.status === expectedStatus, `${path} deveria retornar ${expectedStatus}, retornou ${error.status}: ${JSON.stringify(error.body)}`);
    return error.status;
  }
}

async function validateProfile(profile) {
  const session = { cookie: '' };
  await request('/api/auth/login', { method: 'POST', body: { login: profile.login, password } }, session);
  const me = await request('/api/auth/me', {}, session);
  const loja = Number(me.user.lojaPrincipal || me.user.lojas?.[0]);
  assert(loja, `${profile.login} nao possui loja principal`);

  const started = performance.now();
  const [lojas, secoes, turnos, funcionarios, resumo, regras] = await Promise.all([
    request('/api/catalog/lojas', {}, session),
    request(`/api/catalog/secoes?lojaId=${loja}`, {}, session),
    request(`/api/catalog/turnos-secao?lojaId=${loja}`, {}, session),
    request(`/api/catalog/funcionarios?lojaId=${loja}&mesRef=${mesRef}`, {}, session),
    request(`/api/escalas/resumo?lojaId=${loja}&mesRef=${mesRef}`, {}, session),
    request('/api/escalas/regras', {}, session)
  ]);

  assert(Array.isArray(lojas.lojas), `${profile.login}: lojas invalidas`);
  assert(Array.isArray(secoes.secoes), `${profile.login}: secoes invalidas`);
  assert(Array.isArray(turnos.turnos), `${profile.login}: turnos invalidos`);
  assert(Array.isArray(funcionarios.funcionarios), `${profile.login}: funcionarios invalidos`);
  assert(Array.isArray(resumo.escalas), `${profile.login}: resumo invalido`);
  assert(Array.isArray(regras.regras), `${profile.login}: regras invalidas`);

  await expectStatus('/api/escalas/liberar-mensal', profile.canCreate ? 400 : 403, session, {
    method: 'POST',
    body: profile.canCreate ? {} : { mesRef, lojas: [loja] }
  });

  if (profile.canAccessUsers) {
    await request('/api/acessos/usuarios?page=1&pageSize=5', {}, session);
  } else {
    await expectStatus('/api/acessos/usuarios?page=1&pageSize=5', 403, session);
  }

  return {
    login: profile.login,
    perfil: me.user.perfil,
    lojaPrincipal: loja,
    lojas: lojas.lojas.length,
    secoes: secoes.secoes.length,
    turnos: turnos.turnos.length,
    funcionarios: funcionarios.funcionarios.length,
    escalas: resumo.escalas.length,
    durationMs: Math.round(performance.now() - started)
  };
}

async function main() {
  const result = [];
  for (const profile of profiles) {
    result.push(await validateProfile(profile));
  }
  console.log(JSON.stringify({ ok: true, baseUrl, mesRef, perfis: result }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
