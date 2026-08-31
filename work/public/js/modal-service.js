(function () {
  const getElements = () => ({
    infoModal: document.getElementById('infoModal'),
    infoModalHeader: document.getElementById('infoModalHeader'),
    infoModalTitle: document.getElementById('infoModalTitle'),
    infoMessagesList: document.getElementById('infoMessagesList'),
    closeInfoModalBtn: document.getElementById('closeInfoModalBtn'),
    inputModal: document.getElementById('inputModal'),
    inputModalTitle: document.getElementById('inputModalTitle'),
    inputModalBody: document.getElementById('inputModalBody'),
    inputModalConfirmBtn: document.getElementById('inputModalConfirmBtn'),
    inputModalCancelBtn: document.getElementById('inputModalCancelBtn'),
    inputModalPanel: document.getElementById('inputModalPanel')
  });

  const showInfoModal = (messages, type = 'info') => {
    const { infoModal, infoModalHeader, infoModalTitle, infoMessagesList } = getElements();
    if (!infoModal || !infoModalHeader || !infoModalTitle || !infoMessagesList) return;

    infoMessagesList.innerHTML = '';
    const panel = infoModal.querySelector('.modal-content') || infoModal.querySelector('div');
    panel?.classList.add('info-modal-wide');

    if (type === 'error') {
      infoModalHeader.className = 'flex justify-between items-center p-4 text-white rounded-t-lg bg-red-500';
      infoModalTitle.textContent = 'Atencao: Erros Encontrados';
    } else if (type === 'success') {
      infoModalHeader.className = 'flex justify-between items-center p-4 text-white rounded-t-lg bg-green-500';
      infoModalTitle.textContent = 'Sucesso';
    } else {
      infoModalHeader.className = 'flex justify-between items-center p-4 text-white rounded-t-lg bg-blue-500';
      infoModalTitle.textContent = 'Informacao';
    }

    const list = Array.isArray(messages) ? messages : [messages];
    list.forEach((message) => {
      const li = document.createElement('li');
      li.textContent = message;
      infoMessagesList.appendChild(li);
    });

    infoModal.classList.remove('hidden');
  };

  const hideInfoModal = () => {
    getElements().infoModal?.classList.add('hidden');
  };

  const setInputBaseProps = (field, input) => {
    field.id = input.id;
    field.required = Boolean(input.required);
    field.dataset.requiredOriginal = input.required ? '1' : '0';
    if (input.placeholder) field.placeholder = input.placeholder;
    field.className = input.className || 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm';
    return field;
  };

  const showInputModal = (config) => {
    const {
      inputModal,
      inputModalTitle,
      inputModalBody,
      inputModalConfirmBtn,
      inputModalCancelBtn,
      inputModalPanel
    } = getElements();

    if (!inputModal || !inputModalTitle || !inputModalBody || !inputModalConfirmBtn || !inputModalCancelBtn) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const inputs = config.inputs || [];
      const secondaryActions = config.secondaryActions || [];
      const basePanelClass = 'bg-white rounded-lg shadow-xl w-11/12 max-w-sm flex flex-col';
      const hasWideInput = inputs.some((input) => input.type === 'checkbox-group');
      const panelClass = (config.panelClass || basePanelClass).trim();

      if (inputModalPanel) {
        inputModalPanel.className = hasWideInput ? `${panelClass} input-modal-wide` : panelClass;
      }

      inputModalTitle.textContent = config.title;
      inputModalConfirmBtn.textContent = config.confirmText || 'Confirmar';

      if (config.cancelText === '') {
        inputModalCancelBtn.classList.add('hidden');
      } else {
        inputModalCancelBtn.classList.remove('hidden');
        inputModalCancelBtn.textContent = config.cancelText || 'Cancelar';
      }

      inputModalBody.innerHTML = '';
      const actionsContainer = inputModalConfirmBtn.parentElement;
      actionsContainer?.querySelectorAll('[data-extra-modal-action]').forEach((button) => button.remove());

      const appendField = (input, field) => {
        const wrapper = document.createElement('div');
        wrapper.dataset.fieldWrapper = input.id;
        if (input.dependsOn) wrapper.dataset.dependsOn = input.dependsOn;
        if (input.showWhen) wrapper.dataset.showWhen = Array.isArray(input.showWhen) ? input.showWhen.join('|') : String(input.showWhen);
        if (input.wrapperClass) wrapper.className = input.wrapperClass;

        const label = document.createElement('label');
        label.className = 'block text-sm font-medium text-gray-700';
        label.textContent = input.label;

        wrapper.appendChild(label);
        wrapper.appendChild(field);
        inputModalBody.appendChild(wrapper);
        return wrapper;
      };

      inputs.forEach((input) => {
        if (input.type === 'message') {
          const p = document.createElement('p');
          p.textContent = input.text;
          p.className = input.className || 'text-gray-700';
          inputModalBody.appendChild(p);
          return;
        }

        if (input.type === 'html') {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = input.html || '';
          inputModalBody.appendChild(wrapper);
          return;
        }

        if (input.type === 'select') {
          const selectEl = setInputBaseProps(document.createElement('select'), input);
          (input.options || []).forEach((option) => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            if (String(option.value) === String(input.value || '')) optionEl.selected = true;
            selectEl.appendChild(optionEl);
          });
          appendField(input, selectEl);
          return;
        }

        if (input.type === 'checkbox-group') {
          const wrapper = document.createElement('div');
          wrapper.id = input.id;
          wrapper.dataset.inputType = 'checkbox-group';
          wrapper.dataset.requiredOriginal = input.required ? '1' : '0';
          wrapper.className = 'mt-2 max-h-64 overflow-auto rounded-md border border-gray-200 bg-white p-3 space-y-2';

          (input.options || []).forEach((option) => {
            const row = document.createElement('label');
            row.className = 'flex items-start gap-2 text-sm text-gray-700';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = option.value;
            checkbox.checked = input.value ? input.value.map(String).includes(String(option.value)) : option.checked !== false;
            checkbox.className = 'mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500';
            const span = document.createElement('span');
            span.textContent = option.label;
            row.appendChild(checkbox);
            row.appendChild(span);
            wrapper.appendChild(row);
          });

          appendField(input, wrapper);
          return;
        }

        if (input.type === 'choice-group') {
          const wrapper = document.createElement('div');
          wrapper.id = input.id;
          wrapper.dataset.inputType = 'choice-group';
          wrapper.dataset.requiredOriginal = input.required ? '1' : '0';
          wrapper.className = 'choice-group mt-2';
          Object.defineProperty(wrapper, 'value', {
            get() { return wrapper.dataset.value || ''; }
          });

          (input.options || []).forEach((option) => {
            const row = document.createElement('label');
            row.className = 'choice-pill';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = input.id;
            radio.value = option.value;
            radio.checked = String(option.value) === String(input.value || '');
            if (radio.checked) wrapper.dataset.value = option.value;
            radio.addEventListener('change', () => {
              wrapper.dataset.value = radio.value;
              wrapper.dispatchEvent(new Event('change'));
            });
            const span = document.createElement('span');
            span.textContent = option.label;
            row.appendChild(radio);
            row.appendChild(span);
            wrapper.appendChild(row);
          });

          if (!wrapper.dataset.value && input.options?.[0]) wrapper.dataset.value = input.options[0].value;
          appendField(input, wrapper);
          return;
        }

        if (input.type === 'textarea') {
          const textareaEl = setInputBaseProps(document.createElement('textarea'), input);
          textareaEl.rows = input.rows || 3;
          textareaEl.value = input.value || '';
          appendField(input, textareaEl);
          return;
        }

        const inputEl = setInputBaseProps(document.createElement('input'), input);
        inputEl.type = input.type;
        inputEl.value = input.value || '';
        appendField(input, inputEl);
      });

      const applyConditionalFields = () => {
        inputModalBody.querySelectorAll('[data-depends-on]').forEach((wrapper) => {
          const controller = document.getElementById(wrapper.dataset.dependsOn);
          const allowed = String(wrapper.dataset.showWhen || '').split('|').filter(Boolean);
          const visible = controller && !controller.disabled && allowed.includes(String(controller.value));
          wrapper.classList.toggle('hidden', !visible);
          wrapper.querySelectorAll('input, select, textarea').forEach((field) => {
            field.disabled = !visible;
            field.required = visible && field.dataset.requiredOriginal === '1';
          });
        });
      };

      inputModalBody.querySelectorAll('select, [data-input-type="choice-group"]').forEach((select) => select.addEventListener('change', applyConditionalFields));
      applyConditionalFields();
      if (typeof config.onRender === 'function') config.onRender(inputModalBody);

      const hideModal = () => {
        inputModal.classList.add('hidden');
        inputModalConfirmBtn.onclick = null;
        inputModalCancelBtn.onclick = null;
        actionsContainer?.querySelectorAll('[data-extra-modal-action]').forEach((button) => button.remove());
        if (inputModalPanel) inputModalPanel.className = basePanelClass;
      };

      const collectValues = () => {
        const values = {};
        let allValid = true;

        inputs.forEach((input) => {
          if (input.type === 'message' || input.type === 'html') return;
          const inputEl = document.getElementById(input.id);
          if (!inputEl || inputEl.disabled) return;

          if (input.type === 'checkbox-group') {
            const checked = Array.from(inputEl.querySelectorAll('input[type="checkbox"]:checked')).map((checkbox) => checkbox.value);
            if (input.required && checked.length === 0) allValid = false;
            values[input.id] = checked;
            return;
          }

          if (input.type === 'choice-group') {
            if (input.required && !inputEl.value) allValid = false;
            values[input.id] = inputEl.value;
            return;
          }

          if (inputEl.required && !String(inputEl.value || '').trim()) allValid = false;
          values[input.id] = inputEl.value;
        });

        return { values, allValid };
      };

      secondaryActions.forEach((action) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.extraModalAction = action.id || 'secondary';
        button.className = action.className || 'input-modal-secondary-action px-4 py-2 rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-semibold transition';
        button.textContent = action.label || 'Ação';
        button.onclick = () => {
          const { values, allValid } = collectValues();
          if (!allValid) {
            showInfoModal('Por favor, preencha todos os campos obrigatorios.', 'error');
            return;
          }
          hideModal();
          resolve({ ...values, _modalAction: button.dataset.extraModalAction });
        };
        actionsContainer?.insertBefore(button, inputModalCancelBtn);
      });

      inputModalConfirmBtn.onclick = () => {
        const { values, allValid } = collectValues();
        if (allValid) {
          hideModal();
          resolve(secondaryActions.length ? { ...values, _modalAction: 'confirm' } : values);
        } else {
          showInfoModal('Por favor, preencha todos os campos obrigatorios.', 'error');
        }
      };

      inputModalCancelBtn.onclick = () => {
        hideModal();
        resolve(null);
      };

      inputModal.classList.remove('hidden');
    });
  };

  const init = () => {
    const { infoModal, closeInfoModalBtn } = getElements();
    closeInfoModalBtn?.addEventListener('click', hideInfoModal);
    infoModal?.addEventListener('click', (event) => {
      if (event.target === infoModal) hideInfoModal();
    });
  };

  init();

  window.EscalaModal = {
    showInfoModal,
    hideInfoModal,
    showInputModal
  };
})();
