const REGRAS_VIGENTES = [
  { codigo: 'DOMINGO_1X1', titulo: 'Domingo 1x1', descricao: 'O colaborador nao deve trabalhar dois domingos consecutivos.' },
  { codigo: 'INTERJORNADA_11H', titulo: 'Interjornada minima', descricao: 'Entre o fim de um dia trabalhado e o inicio do proximo deve haver ao menos 11 horas.' },
  { codigo: 'DESCANSO_POS_FOLGA_35H', titulo: 'Descanso apos folga', descricao: 'Ao retornar de uma ou mais folgas, o descanso minimo acumulado deve ser de 35 horas.' },
  { codigo: 'MAX_5_DIAS_CONSECUTIVOS', titulo: 'Limite 5x2', descricao: 'No regime 5x2, o colaborador nao deve trabalhar mais que 5 dias consecutivos.' },
  { codigo: 'MAX_2_FOLGAS_SEMANA', titulo: 'Limite semanal de folgas', descricao: 'O colaborador nao deve ter mais que 2 folgas na mesma semana, contando domingo.' },
  { codigo: 'JORNADA_08H48', titulo: 'Jornada padrao', descricao: 'Dias trabalhados devem ter jornada total de 08:48.' },
  { codigo: 'INTERVALO_01H10', titulo: 'Intervalo minimo', descricao: 'Dias trabalhados devem ter intervalo minimo de 01:10.' },
  { codigo: 'MAX_06H_CONTINUAS', titulo: 'Jornada continua maxima', descricao: 'Nenhum periodo continuo de trabalho deve passar de 06:00.' },
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

function minutesToTime(value) {
  const safeValue = Math.max(0, Number(value) || 0);
  const hours = Math.floor(safeValue / 60);
  const minutes = safeValue % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function isDescanso(dia) {
  return String(dia?.programacao || dia?.PROGRAMACAO || 'TRB').trim().toUpperCase() !== 'TRB';
}

function isFolgaSemanal(dia) {
  const programacao = String(dia?.programacao || dia?.PROGRAMACAO || 'TRB').trim().toUpperCase();
  return programacao === 'F' || programacao === 'FOLGA' || programacao === 'FXF' || programacao === 'FOLGA_FIXA';
}

function getWeekKey(dataIso) {
  const date = new Date(`${formatDate(dataIso)}T00:00:00`);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
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
    return errors;
  }
  const intervalo = horario.retornoIntervalo - horario.saidaIntervalo;
  const primeiraJornada = horario.saidaIntervalo - horario.entrada;
  const segundaJornada = horario.saida - horario.retornoIntervalo;
  const jornada = primeiraJornada + segundaJornada;
  if (intervalo <= 0 || primeiraJornada <= 0 || segundaJornada <= 0) {
    errors.push(`${funcionarioLabel}: jornada ou intervalo invalido em ${data}.`);
  }
  if (jornada !== 528) {
    errors.push(`${funcionarioLabel}: jornada total deve ser 08:48 em ${data}. Atual: ${minutesToTime(jornada)}.`);
  }
  if (intervalo < 70) {
    errors.push(`${funcionarioLabel}: intervalo menor que 01:10 em ${data}. Atual: ${minutesToTime(intervalo)}.`);
  }
  if (primeiraJornada > 360 || segundaJornada > 360) {
    errors.push(`${funcionarioLabel}: jornada continua maior que 06:00 em ${data}.`);
  }
  return errors;
}

function validarRegrasFuncionario(funcionario) {
  const label = funcionario.nome || funcionario.NOME || funcionario.chapa || funcionario.CHAPA || funcionario.escfuncId || 'Funcionario';
  const dias = [...(funcionario.dias || [])].sort((a, b) => formatDate(a.data || a.DT).localeCompare(formatDate(b.data || b.DT)));
  const errors = [];
  let ultimoTrabalho = null;
  let ultimoDomingoTrabalhado = null;
  let diasTrabalhadosConsecutivos = 0;
  const maxDiasConsecutivos = Number(funcionario.maxDiasConsecutivos || 5);
  const folgasPorSemana = new Map();

  for (const dia of dias) {
    const dataIso = formatDate(dia.data || dia.DT);
    const data = new Date(`${dataIso}T00:00:00`);
    const descanso = isDescanso(dia);
    errors.push(...validarTurnoDia(label, dia));

    if (isFolgaSemanal(dia)) {
      const weekKey = getWeekKey(dataIso);
      const totalFolgasSemana = (folgasPorSemana.get(weekKey) || 0) + 1;
      folgasPorSemana.set(weekKey, totalFolgasSemana);
      if (totalFolgasSemana > 2) {
        errors.push(`${label}: Dia ${Number(dataIso.slice(8, 10))}: possui ${totalFolgasSemana} folgas na semana iniciada em ${weekKey}; limite permitido: 2, contando domingo.`);
      }
    }

    if (descanso) {
      diasTrabalhadosConsecutivos = 0;
      continue;
    }

    diasTrabalhadosConsecutivos += 1;
    if (diasTrabalhadosConsecutivos > maxDiasConsecutivos) {
      errors.push(`${label}: trabalhou ${diasTrabalhadosConsecutivos} dias consecutivos ate ${dataIso}; limite permitido no 5x2: ${maxDiasConsecutivos}.`);
    }

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

module.exports = { REGRAS_VIGENTES, validateEscalaPayload, validarRegrasFuncionario, timeToMinutes, minutesToTime };
