const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'js', 'app-original.js');
let source = fs.readFileSync(filePath, 'utf8');

const start = source.indexOf("        validarEscalaBtn.addEventListener('click', () => {");
const end = source.indexOf('        const validarSequenciaParaTraz =', start);

if (start === -1 || end === -1) {
  throw new Error('Nao foi possivel localizar listener de validacao.');
}

const replacement = `        validarEscalaBtn.addEventListener('click', () => {
            let allErrors = [];
            const ausenciasAplicadas = aplicarAusenciasNaDetalhada();
            allErrors = allErrors.concat(validarDescansos());
            allErrors = allErrors.concat(validarDiasConsecutivos());
            allErrors = allErrors.concat(validarJornada());
            
            if (allErrors.length > 0) {
                showInfoModal(allErrors, 'error');
            } else if (ausenciasAplicadas.length > 0) {
                showInfoModal(['Ausências aplicadas como folga obrigatória.', ...ausenciasAplicadas], 'success');
            } else {
                showInfoModal("A escala foi validada com sucesso. Nenhuma inconsistência encontrada.", 'success');
            }
        });
        
`;

source = `${source.slice(0, start)}${replacement}${source.slice(end)}`;
fs.writeFileSync(filePath, source, 'utf8');
console.log('Validacao agora aplica ausencias antes de validar.');
