const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.MANUAL_BASE_URL || 'http://localhost:3000';
const outDir = path.resolve(__dirname, '..', 'docs', 'manual-usuario-assets');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function waitForApp(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(900);
}

async function screenshot(page, name) {
  await waitForApp(page);
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
}

async function safeClick(page, selector) {
  const locator = page.locator(selector).first();
  if (await locator.count()) {
    await locator.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(600);
  }
}

async function login(page) {
  await page.goto(`${baseUrl}/login.html`, { waitUntil: 'domcontentloaded' });
  await screenshot(page, '01-login');
  await page.fill('input[name="login"], #login', process.env.MANUAL_LOGIN || 'admin');
  await page.fill('input[name="password"], #password', process.env.MANUAL_PASSWORD || 'admin123');
  await Promise.all([
    page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => {}),
    page.locator('button[type="submit"], button:has-text("Escala Inteligente"), button:has-text("Entrar")').first().click()
  ]);
  await waitForApp(page);
}

async function captureStaticPages(page) {
  const captures = [
    ['#/escalas-geradas', '02-escalas-geradas'],
    ['#/funcionarios', '03-funcionarios'],
    ['#/secoes', '04-secoes'],
    ['#/secoes/nova', '05-secao-formulario'],
    ['#/turnos-secao', '06-turnos-secao'],
    ['#/turnos-secao/novo', '07-turno-secao-formulario'],
    ['#/escalas-funcionarios', '08-escalas-funcionarios'],
    ['#/historico', '09-historico'],
    ['#/tipos-descanso', '10-tipos-descanso'],
    ['#/acessos', '11-controle-acesso'],
    ['#/roles', '12-perfis-acesso'],
    ['#/configuracoes', '13-configuracoes']
  ];

  for (const [hash, name] of captures) {
    await page.goto(`${baseUrl}/app${hash}`, { waitUntil: 'domcontentloaded' });
    await screenshot(page, name);
  }
}

async function captureCreationFlow(page) {
  await page.goto(`${baseUrl}/app#/escalas-geradas`, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
  await safeClick(page, '#goToTimelineBtn');
  await page.waitForSelector('#inputModal:not(.hidden)', { timeout: 10000 });
  await page.selectOption('#nova-escala-loja', { index: 0 }).catch(() => {});
  await page.selectOption('#nova-escala-mes', '11').catch(() => {});
  await page.selectOption('#nova-escala-ano', '2031').catch(async () => {
    const options = await page.locator('#nova-escala-ano option').evaluateAll(opts => opts.map(o => o.value));
    await page.selectOption('#nova-escala-ano', options[options.length - 1]);
  });
  await screenshot(page, '14-modal-criar-escala');
  await safeClick(page, '#inputModalConfirmBtn');
  await page.waitForSelector('#escala-criacao-page:not(.hidden)', { timeout: 15000 });
  await screenshot(page, '16-criacao-selecionar-secoes');

  const checkboxes = page.locator('#criacaoSecoesLista input[type="checkbox"]');
  const count = await checkboxes.count();
  for (let i = 0; i < count; i += 1) {
    await checkboxes.nth(i).check({ force: true }).catch(() => {});
  }
  await safeClick(page, '#gerarTimelineCriacaoBtn');
  await page.waitForSelector('#criacaoTimelineCard:not(.hidden)', { timeout: 10000 }).catch(() => {});
  await screenshot(page, '17-criacao-timeline-gerada');

  await safeClick(page, '#carregarFuncionariosCriacaoBtn');
  await page.waitForSelector('#esqueletoModal:not(.hidden)', { timeout: 12000 }).catch(() => {});
  await screenshot(page, '18-criacao-distribuir-funcionarios');

  await safeClick(page, '#autoDistribuirFolgasBtn');
  await page.waitForTimeout(1500);
  await screenshot(page, '19-criacao-folgas-distribuidas');

  await safeClick(page, '#gerarEscalaDetalhadaBtn');
  await page.waitForSelector('#detalhadaModal:not(.hidden)', { timeout: 12000 }).catch(() => {});
  await screenshot(page, '20-criacao-escala-detalhada');
}

async function main() {
  ensureDir(outDir);
  const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const launchOptions = fs.existsSync(chromePath)
    ? { headless: true, executablePath: chromePath }
    : { headless: true };
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1600, height: 960 }, deviceScaleFactor: 1 });

  await login(page);
  await captureStaticPages(page);
  await captureCreationFlow(page);

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
