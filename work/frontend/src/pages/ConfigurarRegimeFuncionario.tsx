import { useState } from 'react';
import { postJson, type Funcionario } from '../api';
import { validate12x36Hours } from '../shiftValidation';

type Hours = { HR_ENT1: string; HR_SAI1: string; HR_ENT2: string; HR_SAI2: string };

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function ConfigurarRegimeFuncionario({ employee, lojaId, onClose, onSaved }: {
  employee: Funcionario;
  lojaId: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [regime, setRegime] = useState<'5X2' | '12X36'>(employee.REGIME_ESCALA || '5X2');
  const [month, setMonth] = useState(currentMonth());
  const [anchor, setAnchor] = useState(employee.DT_ANCORA_12X36 || `${currentMonth()}-01`);
  const [hours, setHours] = useState<Hours>(employee.REGIME_ESCALA === '12X36'
    ? { HR_ENT1: employee.HR_ENT1 || '07:00', HR_SAI1: employee.HR_SAI1 || '12:30',
      HR_ENT2: employee.HR_ENT2 || '13:30', HR_SAI2: employee.HR_SAI2 || '19:00' }
    : { HR_ENT1: '07:00', HR_SAI1: '12:30', HR_ENT2: '13:30', HR_SAI2: '19:00' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (regime === '12X36') {
      const invalid = validate12x36Hours(hours);
      if (invalid) { setError(invalid); return; }
      if (!anchor) { setError('Informe a data do primeiro plantão.'); return; }
    }
    setBusy(true);
    setError('');
    try {
      await postJson(`/api/catalog/lojas/${encodeURIComponent(lojaId)}/funcionarios/${employee.ESCFUNC_ID}/regime`, {
        mesInicio: `${month}-01`, regime,
        dtAncora: regime === '12X36' ? anchor : null,
        hours: regime === '12X36' ? hours : null,
      });
      onSaved(`Regime de ${employee.NOME} definido como ${regime} a partir de ${month}. Gere novamente a escala rascunho para aplicar.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar o regime.');
    } finally { setBusy(false); }
  }

  return <div className="confirm-backdrop" role="presentation" onKeyDown={(event) => { if (event.key === 'Escape' && !busy) onClose(); }}>
    <form className="confirm-dialog shift-dialog" role="dialog" aria-modal="true" aria-labelledby="regime-title" onSubmit={save}>
      <h2 id="regime-title">Regime · {employee.NOME}</h2>
      <p>{employee.CHAPA} · Loja {lojaId}</p>
      <div className="segmented" role="group" aria-label="Regime de escala">
        <button type="button" className={regime === '5X2' ? 'selected' : ''} onClick={() => setRegime('5X2')}>5x2</button>
        <button type="button" className={regime === '12X36' ? 'selected' : ''} onClick={() => setRegime('12X36')}>12x36</button>
      </div>
      <div className="shift-options"><label>Mês de início<input type="month" min={currentMonth()} value={month}
        onChange={(event) => { const next = event.target.value; if (anchor === `${month}-01`) setAnchor(`${next}-01`);
          setMonth(next); setError(''); }} required /></label></div>
      {regime === '12X36' && <>
        <div className="shift-options"><label>Primeiro plantão<input type="date" value={anchor}
          onChange={(event) => { setAnchor(event.target.value); setError(''); }} required /></label></div>
        <div className="shift-fields">{([
          ['HR_ENT1', 'Entrada'], ['HR_SAI1', 'Saída intervalo'],
          ['HR_ENT2', 'Retorno'], ['HR_SAI2', 'Saída']
        ] as const).map(([field, label]) => <label key={field}>{label}<input type="time" value={hours[field]}
          onChange={(event) => { setHours((current) => ({ ...current, [field]: event.target.value })); setError(''); }} required /></label>)}</div>
        <p>Plantão de 12 horas entre entrada e saída, com intervalo interno de ao menos 1 hora.</p>
      </>}
      {error && <div className="notice error" role="alert">{error}</div>}
      <div className="confirm-actions"><button type="button" className="button secondary" disabled={busy} onClick={onClose}>Cancelar</button>
        <button type="submit" className="button primary" disabled={busy || !month}>{busy ? 'Salvando...' : 'Salvar regime'}</button></div>
    </form>
  </div>;
}
