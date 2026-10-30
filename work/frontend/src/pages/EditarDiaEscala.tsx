import { useState } from 'react';
import { ApiError, getJson, postJson, type DiaEscala, type Funcionario } from '../api';
import { createOperationId } from '../operationId';
import { autofillStandardHours } from '../shiftAutofill';
import { validateStandardHours } from '../shiftValidation';
import { apprenticeHoursFromStart, autofillApprenticeHours, validateApprenticeHours } from '../apprenticeHours';

type Shift = { hrEnt1: string; hrSai1: string; hrEnt2: string; hrSai2: string };
export type PayloadDay = {
  data: string;
  hrEnt1: string | null;
  hrSai1: string | null;
  hrEnt2: string | null;
  hrSai2: string | null;
  programacao: string;
  justificativa: string | null;
};

function dateOnly(value: string) {
  return String(value || '').slice(0, 10);
}

function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function isRest(day: DiaEscala) {
  return String(day.PROGRAMACAO || 'TRB').toUpperCase() !== 'TRB';
}

export function toPayloadDay(day: DiaEscala): PayloadDay {
  const rest = isRest(day);
  return {
    data: dateOnly(day.DT),
    hrEnt1: rest ? null : day.HR_ENT1 || null,
    hrSai1: rest ? null : day.HR_SAI1 || null,
    hrEnt2: rest ? null : day.HR_ENT2 || null,
    hrSai2: rest ? null : day.HR_SAI2 || null,
    programacao: rest ? String(day.PROGRAMACAO || 'F').toUpperCase() : 'TRB',
    justificativa: day.JUSTIFICATIVA_ALTERACAO || null,
  };
}

export function EditarDiaEscala({
  lojaId,
  mesRef,
  employee,
  day,
  days,
  holidayName,
  onClose,
  onSaved,
}: {
  lojaId: string;
  mesRef: string;
  employee: Funcionario;
  day: DiaEscala;
  days: DiaEscala[];
  holidayName?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const apprentice = /APRENDIZ/i.test(employee.FUNCAO_DESCR || '');
  const reference = days.find((item) => !isRest(item) && item.HR_ENT1) || day;
  const [mode, setMode] = useState<'TRB' | 'F'>(isRest(day) ? 'F' : 'TRB');
  const [shift, setShift] = useState<Shift>(() => {
    if (apprentice) {
      const hours = apprenticeHoursFromStart((isRest(day) ? reference.HR_ENT1 : day.HR_ENT1) || employee.HR_ENT1 || '08:00')
        || apprenticeHoursFromStart('08:00')!;
      return { hrEnt1: hours.HR_ENT1, hrSai1: hours.HR_SAI1, hrEnt2: '', hrSai2: '' };
    }
    return {
      hrEnt1: (isRest(day) ? reference.HR_ENT1 : day.HR_ENT1) || '08:00',
      hrSai1: (isRest(day) ? reference.HR_SAI1 : day.HR_SAI1) || '12:00',
      hrEnt2: (isRest(day) ? reference.HR_ENT2 : day.HR_ENT2) || '13:10',
      hrSai2: (isRest(day) ? reference.HR_SAI2 : day.HR_SAI2) || '17:58',
    };
  });
  const [justification, setJustification] = useState(day.JUSTIFICATIVA_ALTERACAO || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);

  const date = dateOnly(day.DT);
  const protectedDay = Boolean(
    day.AUSENCIA_OBRIGATORIA ||
      day.FIXO_ESCALA ||
      ['FER', 'AFA'].includes(String(day.PROGRAMACAO || '').toUpperCase()),
  );
  const editable = date >= localToday() && !protectedDay && Number.isInteger(Number(day.REVISAO));

  function setHour(key: keyof Shift, value: string) {
    const field = ({ hrEnt1: 'HR_ENT1', hrSai1: 'HR_SAI1', hrEnt2: 'HR_ENT2', hrSai2: 'HR_SAI2' } as const)[key];
    const next = apprentice ? autofillApprenticeHours(field as 'HR_ENT1' | 'HR_SAI1', value)
      : autofillStandardHours({ HR_ENT1: shift.hrEnt1, HR_SAI1: shift.hrSai1,
        HR_ENT2: shift.hrEnt2, HR_SAI2: shift.hrSai2 }, field, value);
    if (!next) { setError(apprentice ? 'O horário não cabe no mesmo dia mantendo 05:15 de trabalho.' : 'O horário não cabe no mesmo dia mantendo 08:48 de trabalho e 01:10 de intervalo.'); return; }
    setShift({ hrEnt1: next.HR_ENT1, hrSai1: next.HR_SAI1, hrEnt2: next.HR_ENT2, hrSai2: next.HR_SAI2 });
    setError('');
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editable || busy || uncertain) return;
    if (mode === 'TRB') {
      const hours = { HR_ENT1: shift.hrEnt1, HR_SAI1: shift.hrSai1, HR_ENT2: shift.hrEnt2, HR_SAI2: shift.hrSai2 };
      const invalid = apprentice ? validateApprenticeHours(hours) : validateStandardHours(hours);
      if (invalid) { setError(invalid); return; }
    }
    const form = new FormData(event.currentTarget);
    const submitted = (key: keyof Shift) => (apprentice ? shift[key] : String(form.get(key) || ''));
    const changed: PayloadDay = {
      data: date,
      hrEnt1: mode === 'F' ? null : submitted('hrEnt1') || null,
      hrSai1: mode === 'F' ? null : submitted('hrSai1') || null,
      hrEnt2: mode === 'F' || apprentice ? null : submitted('hrEnt2') || null,
      hrSai2: mode === 'F' || apprentice ? null : submitted('hrSai2') || null,
      programacao: mode === 'F' && isRest(day) ? String(day.PROGRAMACAO || 'F').toUpperCase() : mode,
      justificativa: String(form.get('justificativa') || '').trim() || null,
    };
    if (JSON.stringify(changed) === JSON.stringify(toPayloadDay(day))) {
      setError('Nenhuma alteração neste dia.');
      return;
    }
    let operacaoId: string;
    try { operacaoId = createOperationId(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Identificador indisponível.'); return; }
    setBusy(true);
    setError('');
    const payload = {
      lojaId: Number(lojaId),
      mesRef,
      operacaoId,
      edicaoPontual: true,
      funcionarios: [
        {
          escfuncId: Number(employee.ESCFUNC_ID),
          revisaoBase: Number(day.REVISAO),
          chapa: employee.CHAPA,
          nome: employee.NOME,
          funcao: employee.FUNCAO_DESCR || null,
          escsecaoId: employee.ESCSECAO_ID,
          escfuncaoId: employee.ESCFUNCAO_ID,
          aprendiz: apprentice,
          dias: [changed],
        },
      ],
      oficializada: 0,
    };
    try {
      let saved: { saved: { revisao: number }[] };
      try {
        saved = await postJson('/api/escalas/funcionarios/revisao', payload);
      } catch (reason) {
        if (!(reason instanceof ApiError) || reason.status >= 500) {
          const confirmation = await getJson<{ confirmada: boolean }>(
            `/api/escalas/operacoes/${payload.operacaoId}?${new URLSearchParams({ lojaId, mesRef })}`,
          ).catch(() => null);
          if (confirmation?.confirmada) {
            onSaved();
            return;
          }
          setUncertain(true);
          setError(
            'Não foi possível confirmar se o rascunho foi gravado. Recarregue a escala antes de tentar novamente.',
          );
          return;
        }
        throw reason;
      }
      if (saved.saved?.length !== 1) {
        setUncertain(true);
        throw new Error('O banco não confirmou a revisão. Recarregue a escala antes de editar novamente.');
      }
      try {
        const readback = await getJson<{ escala: { dias: DiaEscala[] } }>(
          `/api/escalas/mensal?${new URLSearchParams({ lojaId, mesRef })}`,
        );
        const recorded = readback.escala.dias.find(
          (item) => Number(item.ESCFUNC_ID) === Number(employee.ESCFUNC_ID) && dateOnly(item.DT) === date,
        );
        const actual = recorded ? toPayloadDay(recorded) : null;
        const fields: (keyof PayloadDay)[] = ['data', 'programacao', 'hrEnt1', 'hrSai1', 'hrEnt2', 'hrSai2'];
        if (
          Number(recorded?.REVISAO) !== Number(saved.saved[0].revisao) ||
          !actual ||
          fields.some((field) => actual[field] !== changed[field])
        ) {
          throw new Error('A leitura de volta não confirmou a revisão gravada.');
        }
      } catch {
        setUncertain(true);
        throw new Error(
          'A leitura de volta não confirmou a revisão gravada. Recarregue a escala antes de editar novamente.',
        );
      }
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar a edição.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="confirm-backdrop"
      role="presentation"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !busy) onClose();
      }}
    >
      <form
        className="confirm-dialog day-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-editor-title"
        onSubmit={save}
      >
        <h2 id="day-editor-title">
          Editar {new Date(`${date}T00:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
        </h2>
        <p>
          <strong>{employee.NOME}</strong> · {employee.CHAPA}
        </p>
        {holidayName && <div className="notice warning" role="status">Feriado nacional: {holidayName}.</div>}
        {!editable ? (
          <div className="notice error" role="alert">
            Este dia é anterior a hoje, protegido ou não tem revisão disponível para edição.
          </div>
        ) : (
          <>
            <div className="segmented day-editor-mode" role="group" aria-label="Programação do dia">
              <button
                type="button"
                className={mode === 'TRB' ? 'selected' : ''}
                onClick={() => {
                  setMode('TRB');
                }}
              >
                Trabalho
              </button>
              <button
                type="button"
                className={mode === 'F' ? 'selected' : ''}
                onClick={() => {
                  setMode('F');
                }}
              >
                Folga
              </button>
            </div>
            {mode === 'TRB' && (
              <div className="day-editor-times">
                {(
                  (apprentice ? [
                    ['hrEnt1', 'Entrada'],
                    ['hrSai1', 'Saída'],
                  ] : [
                    ['hrEnt1', 'Entrada'],
                    ['hrSai1', 'Saída intervalo'],
                    ['hrEnt2', 'Retorno'],
                    ['hrSai2', 'Saída'],
                  ]) as readonly (readonly [keyof Shift, string])[]
                ).map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      type="time"
                      name={key}
                      value={shift[key]}
                      onInput={(event) => setHour(key, event.currentTarget.value)}
                      onChange={(event) => setHour(key, event.target.value)}
                      required
                    />
                  </label>
                ))}
              </div>
            )}
            <label className="day-editor-justification">
              Justificativa
              <input
                name="justificativa"
                value={justification}
                maxLength={500}
                onInput={(event) => setJustification(event.currentTarget.value)}
                onChange={(event) => setJustification(event.target.value)}
                placeholder="Opcional"
              />
            </label>
          </>
        )}
        {error && (
          <div className="notice error" role="alert">
            {error}
          </div>
        )}
        <div className="confirm-actions">
          <button className="button secondary" type="button" disabled={busy} onClick={onClose}>
            Cancelar
          </button>
          <button className="button primary" type="submit" disabled={!editable || busy || uncertain}>
            {busy ? 'Salvando...' : 'Salvar rascunho'}
          </button>
        </div>
      </form>
    </div>
  );
}
