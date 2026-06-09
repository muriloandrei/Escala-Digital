const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'js', 'app-original.js');
let source = fs.readFileSync(filePath, 'utf8');

const start = source.indexOf('        const validarTurnoSimples = (turno) => {');
const end = source.indexOf('        const hideInfoModal = () => {', start);

if (start === -1 || end === -1) {
  throw new Error('Nao foi possivel localizar validarTurnoSimples.');
}

const replacement = `        const validarTurnoSimples = (turno) => {
            return window.EscalaRulesCore.validarTurnoSimples(turno, {
                minIntervalo: regraMinIntervaloInput.value,
                maxIntervalo: regraMaxIntervaloInput.value,
                maxJornadaContinua: regraMaxJornadaContinuaInput.value
            });
        };

`;

source = `${source.slice(0, start)}${replacement}${source.slice(end)}`;
fs.writeFileSync(filePath, source, 'utf8');
console.log('validarTurnoSimples conectado ao EscalaRulesCore.');
