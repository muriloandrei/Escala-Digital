const baseUrl = (process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const password = process.env.SMOKE_PASSWORD || 'admin123';
const allowedLogin = process.env.SMOKE_REACT_ALLOWED_LOGIN || 'admin';
const deniedLogin = process.env.SMOKE_REACT_DENIED_LOGIN || 'operador';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function check(login, allowed) {
  const auth = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password })
  });
  assert(auth.status === 200, `Login ${login} retornou ${auth.status}.`);
  const cookie = auth.headers.get('set-cookie')?.split(';')[0];
  assert(cookie, `Login ${login} nao retornou cookie de sessao.`);
  const body = await auth.json();
  assert(body.startPath === (allowed ? '/nova' : '/app#/escalas-geradas'), `Destino incorreto para ${login}.`);

  const headers = { Cookie: cookie };
  const me = await fetch(`${baseUrl}/api/auth/me`, { headers });
  assert(me.status === 200 && (await me.json()).reactUiAllowed === allowed, `Elegibilidade incorreta para ${login}.`);
  const page = await fetch(`${baseUrl}/nova/escalas-liberadas`, { headers, redirect: 'manual' });
  assert(page.status === (allowed ? 200 : 302), `Acesso direto incorreto para ${login}: ${page.status}.`);
  if (!allowed) {
    assert(page.headers.get('location') === '/app#/escalas-geradas', `Redirecionamento incorreto para ${login}.`);
    const asset = await fetch(`${baseUrl}/nova/assets/teste.js`, { headers, redirect: 'manual' });
    assert(asset.status === 403, `Assets React acessiveis por ${login}: ${asset.status}.`);
  }
  return { login, startPath: body.startPath, directStatus: page.status };
}

Promise.all([check(allowedLogin, true), check(deniedLogin, false)])
  .then((results) => console.log(JSON.stringify({ ok: true, results }, null, 2)))
  .catch((error) => { console.error(error.message); process.exitCode = 1; });
