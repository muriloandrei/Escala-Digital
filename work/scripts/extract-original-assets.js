const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'views', 'app-original.html');
const cssPath = path.join(root, 'public', 'css', 'app-original.css');
const mainJsPath = path.join(root, 'public', 'js', 'app-original.js');
const licenseJsPath = path.join(root, 'public', 'js', 'license-lock.js');

let html = fs.readFileSync(htmlPath, 'utf8');

if (html.includes('/css/app-original.css') && html.includes('/js/app-original.js')) {
  console.log('Assets ja extraidos.');
  process.exit(0);
}

const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1].trim());
if (styles.length === 0) {
  throw new Error('Nenhum bloco CSS inline encontrado.');
}

fs.mkdirSync(path.dirname(cssPath), { recursive: true });
fs.writeFileSync(cssPath, `${styles.join('\n\n/* ---- bloco CSS extraido ---- */\n\n')}\n`, 'utf8');

let styleIndex = 0;
html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, () => {
  if (styleIndex === 0) {
    styleIndex += 1;
    return '<link rel="stylesheet" href="/css/app-original.css">';
  }
  styleIndex += 1;
  return '';
});

const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1].trim());
if (scripts.length !== 2) {
  throw new Error(`Esperava 2 scripts inline, encontrei ${scripts.length}.`);
}

fs.mkdirSync(path.dirname(mainJsPath), { recursive: true });
fs.writeFileSync(mainJsPath, `${scripts[0]}\n`, 'utf8');
fs.writeFileSync(licenseJsPath, `${scripts[1]}\n`, 'utf8');

let scriptIndex = 0;
html = html.replace(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi, () => {
  if (scriptIndex === 0) {
    scriptIndex += 1;
    return '<script src="/js/app-original.js"></script>';
  }
  scriptIndex += 1;
  return '<script src="/js/license-lock.js"></script>';
});

fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`Extraidos ${styles.length} bloco(s) CSS e ${scripts.length} script(s).`);
