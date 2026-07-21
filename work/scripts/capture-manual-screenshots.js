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

async function main() {
  ensureDir(outDir);
  const chromePath = process.env.CHROME_PATH || 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
  const launchOptions = fs.existsSync(chromePath)
    ? { headless: true, executablePath: chromePath }
    : { headless: true };
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1600, height: 960 }, deviceScaleFactor: 1 });

  await page.goto(`${baseUrl}/login.html`, { waitUntil: 'domcontentloaded' });
  await screenshot(page, '01-login');

  await page.fill('input[name="login"], #login', process.env.MANUAL_LOGIN || 'admin');
  await page.fill('input[name="password"], #password', process.env.MANUAL_PASSWORD || 'admin123');
  await Promise.all([
    page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => {}),
    page.locator('button[type="submit"], button:has-text("Escala Inteligente"), button:has-text("Entrar")').first().click()
  ]);
  await waitForApp(page);

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

  await page.goto(`${baseUrl}/app#/escalas-geradas`, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
  await safeClick(page, '#goToTimelineBtn');
  await screenshot(page, '14-modal-criar-escala');

  await safeClick(page, 'button:has-text("Abrir Escala")');
  await screenshot(page, '15-abrir-escala');

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


