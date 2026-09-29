const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('invalid modal values keep the editor open until corrected', async () => {
  const elements = new Map();
  const createElement = () => {
    const classes = new Set();
    const element = {
      children: [],
      dataset: {},
      classList: {
        add: (name) => classes.add(name),
        remove: (name) => classes.delete(name),
        contains: (name) => classes.has(name)
      },
      appendChild(child) { child.parentElement = this; this.children.push(child); },
      querySelectorAll() { return []; },
      addEventListener() {},
      setAttribute(name, value) { this[name] = value; }
    };
    Object.defineProperty(element, 'id', {
      set(value) { this._id = value; elements.set(value, this); },
      get() { return this._id; }
    });
    return element;
  };
  const createNamed = (id) => {
    const element = createElement();
    element.id = id;
    return element;
  };
  const modal = createNamed('inputModal');
  modal.classList.add('hidden');
  createNamed('inputModalTitle');
  const body = createNamed('inputModalBody');
  const confirm = createNamed('inputModalConfirmBtn');
  const cancel = createNamed('inputModalCancelBtn');
  const actions = createElement();
  actions.appendChild(confirm);
  actions.appendChild(cancel);
  const window = {};
  const document = {
    getElementById: (id) => elements.get(id) || null,
    createElement
  };
  const source = fs.readFileSync(path.join(__dirname, '../public/js/modal-service.js'), 'utf8');
  vm.runInNewContext(source, { window, document });

  const pending = window.EscalaModal.showInputModal({
    title: 'Horarios',
    inputs: [{ id: 'HR_ENT1', label: 'Entrada 1', type: 'time', value: '08:00', required: true }],
    validate: (values) => values.HR_ENT1 === '09:00' ? [] : ['Horario invalido.']
  });
  assert.equal(modal.classList.contains('hidden'), false);
  confirm.onclick();
  assert.equal(modal.classList.contains('hidden'), false);
  assert.equal(body.children.at(-1).textContent, 'Horario invalido.');
  assert.equal(elements.get('HR_ENT1').value, '08:00');

  elements.get('HR_ENT1').value = '09:00';
  confirm.onclick();
  assert.equal(modal.classList.contains('hidden'), true);
  assert.deepEqual({ ...await pending }, { HR_ENT1: '09:00' });
});
