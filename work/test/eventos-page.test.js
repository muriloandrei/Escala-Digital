const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('alteracoes separa eventos antes e depois da oficializacao', async () => {
  const ids = [
    'alteracoes-page', 'alteracoesLojaSelect', 'alteracoesMesInput', 'alteracoesSecaoSelect',
    'alteracoesAcaoSelect', 'alteracoesSituacaoSelect', 'alteracoesOrigemSelect',
    'alteracoesBuscaInput', 'alteracoesResumo', 'alteracoesLista',
    'alteracoesMaisBtn', 'alteracoesExportarBtn', 'alteracoesColaboradores',
    'alteracoesTotal', 'alteracoesManuais', 'alteracoesAntes', 'alteracoesDepois',
    'alteracoesPendenciasRm'
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, {
    value: '', textContent: '', innerHTML: '', listeners: {},
    addEventListener(name, callback) { this.listeners[name] = callback; },
    classList: { add() {}, toggle() {} }
  }]));
  elements.alteracoesLojaSelect.value = '35';
  elements.alteracoesMesInput.value = '2026-10';
  elements.alteracoesSecaoSelect.value = '2003';
  const window = {};
  const source = fs.readFileSync(path.join(__dirname, '../public/js/escala-eventos-page.js'), 'utf8');
  vm.runInNewContext(source, {
    window, document: { getElementById: (id) => elements[id] },
    URLSearchParams, encodeURIComponent, Date, Blob, setTimeout
  });
  const eventos = [
    { ACAO: 'EDITAR_DIA_ESCALA', SITUACAO: 'RASCUNHO', ORIGEM: 'USUARIO', ESCFUNC_ID: 1, DETALHE: {} },
    { ACAO: 'EDITAR_DIA_ESCALA', SITUACAO: 'POS_OFICIALIZACAO', ORIGEM: 'USUARIO', ESCFUNC_ID: 1, DETALHE: {} },
    { ACAO: 'OFICIALIZAR_ESCALA', SITUACAO: 'OFICIALIZADA', ORIGEM: 'SISTEMA', ESCFUNC_ID: 2, DETALHE: {} }
  ];
  const calls = [];
  let resumoServidor = null;
  const controller = window.EscalaEventosPage.create({
    apiRequest: async (url) => {
      calls.push(url);
      return url.includes('/rm/envios')
      ? { envios: [{ STATUS: 'PENDENTE' }, { STATUS: 'ENVIADO' }] }
      : { eventos, resumo: resumoServidor };
    },
    escapeHtml: String,
    showInfoModal() {},
    hasPermission: () => true
  });
  await controller.load();
  assert.match(calls[0], /escsecaoId=2003/);
  assert.equal(elements.alteracoesAntes.textContent, '1');
  assert.equal(elements.alteracoesDepois.textContent, '1');
  assert.equal(elements.alteracoesTotal.textContent, '3');
  assert.equal(elements.alteracoesPendenciasRm.textContent, '1');
  elements.alteracoesSituacaoSelect.value = 'POS_OFICIALIZACAO';
  elements.alteracoesSituacaoSelect.listeners.change();
  assert.equal(elements.alteracoesTotal.textContent, '1');
  assert.equal(elements.alteracoesAntes.textContent, '0');
  assert.equal(elements.alteracoesDepois.textContent, '1');
  elements.alteracoesSituacaoSelect.value = '';
  elements.alteracoesOrigemSelect.value = 'USUARIO';
  elements.alteracoesOrigemSelect.listeners.change();
  assert.equal(elements.alteracoesTotal.textContent, '2');
  assert.equal(elements.alteracoesManuais.textContent, '2');
  resumoServidor = { colaboradores: 12, total: 30, manuais: 8, antes: 10, depois: 4 };
  await controller.load();
  assert.equal(elements.alteracoesTotal.textContent, '30');
  assert.equal(elements.alteracoesColaboradores.textContent, '12');
  assert.equal(elements.alteracoesDepois.textContent, '4');
});

test('exportacao inclui eventos alem da primeira pagina e aplica busca', async () => {
  const ids = [
    'alteracoes-page', 'alteracoesLojaSelect', 'alteracoesMesInput', 'alteracoesSecaoSelect',
    'alteracoesAcaoSelect', 'alteracoesSituacaoSelect', 'alteracoesOrigemSelect',
    'alteracoesBuscaInput', 'alteracoesResumo', 'alteracoesLista',
    'alteracoesMaisBtn', 'alteracoesExportarBtn', 'alteracoesColaboradores',
    'alteracoesTotal', 'alteracoesManuais', 'alteracoesAntes', 'alteracoesDepois',
    'alteracoesPendenciasRm'
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, {
    value: '', textContent: '', innerHTML: '', listeners: {}, disabled: false,
    addEventListener(name, callback) { this.listeners[name] = callback; },
    classList: { add() {}, toggle() {} }
  }]));
  elements.alteracoesLojaSelect.value = '35';
  elements.alteracoesMesInput.value = '2026-10';
  elements.alteracoesSecaoSelect.value = '2003';
  elements.alteracoesBuscaInput.value = 'final';
  let exportedBlob;
  let clicked = false;
  const window = {};
  const source = fs.readFileSync(path.join(__dirname, '../public/js/escala-eventos-page.js'), 'utf8');
  vm.runInNewContext(source, {
    window,
    document: {
      getElementById: (id) => elements[id],
      createElement: () => ({ click() { clicked = true; } })
    },
    URL: { createObjectURL(blob) { exportedBlob = blob; return 'blob:test'; }, revokeObjectURL() {} },
    URLSearchParams, encodeURIComponent, Date, Blob, setTimeout: () => 0
  });
  const calls = [];
  window.EscalaEventosPage.create({
    apiRequest: async (url) => {
      calls.push(url);
      const offset = Number(new URL(url, 'http://localhost').searchParams.get('offset'));
      if (offset === 0) return { eventos: Array.from({ length: 500 }, (_, index) => ({
        ACAO: 'EDITAR_DIA_ESCALA', FUNCIONARIO_NOME: `Pessoa ${index}`, DETALHE: {}, LOJA: 35
      })) };
      return { eventos: [{ ACAO: 'EDITAR_DIA_ESCALA', FUNCIONARIO_NOME: 'Pessoa final', DETALHE: {}, LOJA: 35 }] };
    },
    escapeHtml: String,
    showInfoModal(message) { throw new Error(message); }
  });
  await elements.alteracoesExportarBtn.listeners.click();
  const csv = await exportedBlob.text();
  assert.equal(calls.length, 2);
  assert.match(calls[0], /escsecaoId=2003/);
  assert.match(calls[1], /escsecaoId=2003/);
  assert.match(csv, /Pessoa final/);
  assert.doesNotMatch(csv, /Pessoa 499/);
  assert.equal(clicked, true);
  assert.equal(elements.alteracoesExportarBtn.disabled, false);
});
