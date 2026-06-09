(function initEscalaRulesCore(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }
  root.EscalaRulesCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : window, function buildEscalaRulesCore() {
  const timeToMinutes = (timeString) => {
    if (!timeString || typeof timeString !== 'string' || !timeString.match(/^\d{2}:\d{2}$/)) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (totalMinutes) => {
    if (isNaN(totalMinutes) || totalMinutes < 0) return '00:00';
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const hoursToMinutes = (hours) => {
    return parseFloat(hours) * 60;
  };

  const calcularTurno = (turno) => {
    const inicioMin = timeToMinutes(turno.inicio);
    const fimMin = timeToMinutes(turno.fim);
    const inicioIntervaloMin = timeToMinutes(turno.inicioIntervalo);
    const fimIntervaloMin = timeToMinutes(turno.fimIntervalo);
    const duracaoIntervalo = fimIntervaloMin - inicioIntervaloMin;
    const trabalhadas = (fimMin - inicioMin) - duracaoIntervalo;

    return {
      inicioMin,
      fimMin,
      inicioIntervaloMin,
      fimIntervaloMin,
      duracaoIntervalo,
      trabalhadas
    };
  };

  const validarTurnoSimples = (turno, regras) => {
    let errors = [];
    const calculo = calcularTurno(turno);
    const regraMinIntervalo = timeToMinutes(regras.minIntervalo);
    const regraMaxIntervalo = timeToMinutes(regras.maxIntervalo);
    const regraMaxJornadaContinua = timeToMinutes(regras.maxJornadaContinua);

    if (calculo.inicioIntervaloMin > 0 || calculo.fimIntervaloMin > 0) {
      if (calculo.duracaoIntervalo <= 0) {
        errors.push('O fim do intervalo deve ser maior que o início do intervalo.');
      }
      if (calculo.inicioIntervaloMin < calculo.inicioMin || calculo.fimIntervaloMin > calculo.fimMin) {
        errors.push('O período de intervalo deve estar contido dentro do período do turno.');
      }
      if (calculo.duracaoIntervalo < regraMinIntervalo) {
        errors.push(`A duração do intervalo (${minutesToTime(calculo.duracaoIntervalo)}) é menor que o mínimo permitido (${regras.minIntervalo}).`);
      }
      if (calculo.duracaoIntervalo > regraMaxIntervalo) {
        errors.push(`A duração do intervalo (${minutesToTime(calculo.duracaoIntervalo)}) é maior que o máximo permitido (${regras.maxIntervalo}).`);
      }
      const jornadaAntesIntervalo = calculo.inicioIntervaloMin - calculo.inicioMin;
      const jornadaDepoisIntervalo = calculo.fimMin - calculo.fimIntervaloMin;
      if (jornadaAntesIntervalo > regraMaxJornadaContinua || jornadaDepoisIntervalo > regraMaxJornadaContinua) {
        errors.push(`A jornada contínua máxima de ${regras.maxJornadaContinua} foi excedida.`);
      }
    }

    return errors;
  };

  return {
    timeToMinutes,
    minutesToTime,
    hoursToMinutes,
    calcularTurno,
    validarTurnoSimples
  };
});
