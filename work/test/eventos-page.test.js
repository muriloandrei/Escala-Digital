const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('alteracoes separa eventos antes e depois da oficializacao', async () => {
  const ids = [
    'alteracoes-page', 'alteracoesLojaSelect', 'alteracoesMesInput',
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
  const controller = window.EscalaEventosPage.create({
    apiRequest: async (url) => url.includes('/rm/envios')
      ? { envios: [{ STATUS: 'PENDENTE' }, { STATUS: 'ENVIADO' }] }
      : { eventos },
    escapeHtml: String,
    showInfoModal() {},
    hasPermission: () => true
  });
  await controller.load();
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
});
