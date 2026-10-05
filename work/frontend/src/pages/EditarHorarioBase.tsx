import { useState } from 'react';
import { patchJson, postJson, type DiaEscala, type Funcionario } from '../api';
import { autofillStandardHours } from '../shiftAutofill';
import { validateStandardHours } from '../shiftValidation';

type Impact = { diasAlterados: number; diasManuais: number; possuiEscala: boolean; mesesImpactados: string[]; mesesParaReoficializar: string[] };

export function EditarHorarioBase({ employee, lojaId, initialMonth, currentDay, onClose, onSaved }: {
  employee: Funcionario;
  lojaId: string;
  initialMonth: string;
  currentDay?: DiaEscala;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [month, setMonth] = useState(initialMonth);
  const [hours, setHours] = useState({
    HR_ENT1: employee.HR_ENT1 || currentDay?.HR_ENT1 || '', HR_SAI1: employee.HR_SAI1 || currentDay?.HR_SAI1 || '',
    HR_ENT2: employee.HR_ENT2 || currentDay?.HR_ENT2 || '', HR_SAI2: employee.HR_SAI2 || currentDay?.HR_SAI2 || '',
  });
  const [impact, setImpact] = useState<Impact | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const payload = () => ({ lojaId: Number(lojaId), escfuncId: Number(employee.ESCFUNC_ID),
    mesRef: `${month}-01`, aplicarNaEscala: true, ...hours });

  async function preview() {
    const invalid = validateStandardHours(hours);
    if (invalid) { setError(invalid); return; }
    setBusy(true); setError('');
    try {
      const result = await postJson<{ impacto: Impact }>('/api/escalas/funcionario/horario/preview', payload());
      setImpact(result.impacto);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível validar o horário.'); }
    finally { setBusy(false); }
  }

  async function save() {
    if (!impact) return;
    setBusy(true); setError('');
    try {
      const result = await patchJson<{ diasAlterados: number; mesesAtualizados: string[]; mesesParaReoficializar: string[] }>(
        '/api/escalas/funcionario/horario', payload());
      onSaved(`Horário-base de ${employee.NOME} atualizado${result.diasAlterados ? ` · ${result.diasAlterados} dia(s) em ${result.mesesAtualizados.length} mês(es) ajustado(s)` : ''}.${result.mesesParaReoficializar?.length ? ` Reoficialize em ${result.mesesParaReoficializar.join(', ')} para envio ao RM.` : ''}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível salvar o horário.'); setImpact(null); }
    finally { setBusy(false); }
  }

  return <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => { if (event.key === 'Escape' && !busy) onClose(); }}>
    <div className="confirm-dialog shift-dialog" role="dialog" aria-modal="true" aria-labelledby="shift-title">
      <h2 id="shift-title">Editar horário · {employee.NOME}</h2>
      <p>{employee.CHAPA} · {employee.FUNCAO_DESCR || 'Cargo não informado'}</p>
      {currentDay && <p>Na escala: {[currentDay.HR_ENT1, currentDay.HR_SAI1, currentDay.HR_ENT2, currentDay.HR_SAI2].filter(Boolean).join(' · ')}</p>}
      <div className="shift-fields">{(['HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2'] as const).map((field, index) =>
        <label key={field}>{['Entrada', 'Saída intervalo', 'Retorno', 'Última saída'][index]}
          <input type="time" value={hours[field]} onChange={(event) => {
            const next = autofillStandardHours(hours, field, event.target.value);
            if (next) { setHours(next); setError(''); }
            else setError('O horário não cabe no mesmo dia mantendo 08:48 de trabalho e 01:10 de intervalo.');
            setImpact(null);
          }} required />
        </label>)}</div>
      <div className="shift-options"><label>Mês de referência<input type="month" value={month} onChange={(event) => { setMonth(event.target.value); setImpact(null); }} required /></label></div>
      <p>O horário-base e os dias futuros editáveis serão atualizados juntos. Folgas, fixos e ajustes manuais permanecem.</p>
      {impact && <div className="shift-impact"><strong>Prévia</strong><span>{impact.possuiEscala ? `${impact.diasAlterados} dia(s) em ${impact.mesesImpactados.length} mês(es).` : 'Nenhuma escala futura existente.'}</span><span>{impact.diasManuais} dia(s) com ajuste manual preservado(s).</span>{impact.mesesParaReoficializar?.length > 0 && <span>Reoficialização necessária em {impact.mesesParaReoficializar.join(', ')}.</span>}</div>}
      {error && <div className="notice error" role="alert">{error}</div>}
      <div className="confirm-actions"><button className="button secondary" type="button" disabled={busy} onClick={onClose}>Cancelar</button><button className="button primary" type="button" disabled={busy || !month} onClick={impact ? save : preview}>{busy ? 'Aguarde...' : impact ? 'Salvar horário' : 'Ver prévia'}</button></div>
    </div>
  </div>;
}
