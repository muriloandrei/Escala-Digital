const REGRAS_VIGENTES = [
  { codigo: 'DOMINGO_1X1', titulo: 'Domingo 1x1', descricao: 'O colaborador nao deve trabalhar dois domingos consecutivos.' },
  { codigo: 'INTERJORNADA_11H', titulo: 'Interjornada minima', descricao: 'Entre o fim de um dia trabalhado e o inicio do proximo deve haver ao menos 11 horas.' },
  { codigo: 'DESCANSO_POS_FOLGA_35H', titulo: 'Descanso apos folga', descricao: 'Ao retornar de uma ou mais folgas, o descanso minimo acumulado deve ser de 35 horas.' },
  { codigo: 'JORNADA_SIMPLES', titulo: 'Jornada e intervalo', descricao: 'Horarios devem ser completos, ordenados e com intervalo coerente.' },
  { codigo: 'SEM_REGRA_FOLGAS_SEGUIDAS', titulo: 'Folgas seguidas', descricao: 'Nao ha bloqueio automatico para duas folgas seguidas; o sistema valida descanso e domingo.' }
];

function timeToMinutes(value) {
  const text = String(value || '');
  if (!/^\d{2}:\d{2}$/.test(text)) return null;
  const [hours, minutes] = text.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatDate(value) {
  return String(value || '').slice(0, 10);
}

function isDescanso(dia) {
  return String(dia?.programacao || dia?.PROGRAMACAO || 'TRB').trim().toUpperCase() !== 'TRB';
}

function getHorarioDia(dia) {
  return {
    entrada: timeToMinutes(dia.hrEnt1 ?? dia.HR_ENT1),
    saidaIntervalo: timeToMinutes(dia.hrSai1 ?? dia.HR_SAI1),
    retornoIntervalo: timeToMinutes(dia.hrEnt2 ?? dia.HR_ENT2),
    saida: timeToMinutes(dia.hrSai2 ?? dia.HR_SAI2)
  };
}

function validarTurnoDia(funcionarioLabel, dia) {
  if (isDescanso(dia)) return [];
  const data = formatDate(dia.data || dia.DT);
  const horario = getHorarioDia(dia);
  const errors = [];

  if ([horario.entrada, horario.saidaIntervalo, horario.retornoIntervalo, horario.saida].some((value) => value === null)) {
    errors.push(`${funcionarioLabel}: horario incompleto em ${data}.`);
    return errors;
  }
  if (!(horario.entrada < horario.saidaIntervalo && horario.saidaIntervalo < horario.retornoIntervalo && horario.retornoIntervalo < horario.saida)) {
    errors.push(`${funcionarioLabel}: horarios fora de ordem em ${data}.`);
  }
  const intervalo = horario.retornoIntervalo - horario.saidaIntervalo;
  const jornada = (horario.saida - horario.entrada) - intervalo;
  if (intervalo <= 0 || jornada <= 0) {
    errors.push(`${funcionarioLabel}: jornada ou intervalo invalido em ${data}.`);
  }
  return errors;
}

function validarRegrasFuncionario(funcionario) {
  const label = funcionario.nome || funcionario.NOME || funcionario.chapa || funcionario.CHAPA || funcionario.escfuncId || 'Funcionario';
  const dias = [...(funcionario.dias || [])].sort((a, b) => formatDate(a.data || a.DT).localeCompare(formatDate(b.data || b.DT)));
  const errors = [];
  let ultimoTrabalho = null;
  let ultimoDomingoTrabalhado = null;

  for (const dia of dias) {
    const dataIso = formatDate(dia.data || dia.DT);
    const data = new Date(`${dataIso}T00:00:00`);
    const descanso = isDescanso(dia);
    errors.push(...validarTurnoDia(label, dia));

    if (descanso) continue;

    const horario = getHorarioDia(dia);
    if (ultimoTrabalho && horario.entrada !== null && ultimoTrabalho.saida !== null) {
      const diffDias = Math.round((data - ultimoTrabalho.data) / 86400000);
      const descansoMin = ((diffDias - 1) * 1440) + (1440 - ultimoTrabalho.saida) + horario.entrada;
      if (diffDias === 1 && descansoMin < 660) {
        errors.push(`${label}: interjornada menor que 11h entre ${ultimoTrabalho.dataIso} e ${dataIso}.`);
      }
      if (diffDias > 1 && descansoMin < 2100) {
        errors.push(`${label}: descanso apos folga menor que 35h entre ${ultimoTrabalho.dataIso} e ${dataIso}.`);
      }
    }

    if (data.getDay() === 0) {
      if (ultimoDomingoTrabalhado) {
        const diffDomingos = Math.round((data - ultimoDomingoTrabalhado) / 86400000);
        if (diffDomingos === 7) {
          errors.push(`${label}: trabalhou dois domingos consecutivos (${formatDate(ultimoDomingoTrabalhado.toISOString())} e ${dataIso}).`);
        }
      }
      ultimoDomingoTrabalhado = data;
    }

    ultimoTrabalho = { data, dataIso, saida: horario.saida };
  }

  return errors;
}

function validateEscalaPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return ['Payload da escala invalido.'];
  }

  const errors = [];
  if (!payload.lojaId) errors.push('Loja obrigatoria.');
  if (!payload.mesRef) errors.push('Mes de referencia obrigatorio.');
  if (!Array.isArray(payload.funcionarios)) errors.push('Lista de funcionarios obrigatoria.');
  if (Array.isArray(payload.funcionarios)) {
    payload.funcionarios.forEach((funcionario) => {
      errors.push(...validarRegrasFuncionario(funcionario));
    });
  }

  return errors;
}

module.exports = { REGRAS_VIGENTES, validateEscalaPayload, validarRegrasFuncionario };
