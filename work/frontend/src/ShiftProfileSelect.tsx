import { useEffect, useState } from 'react';
import { getJson } from './api';
import type { StandardHours } from './shiftValidation';

export type ShiftProfile = StandardHours & {
  ESCHORPAD_ID: number;
  DESCR: string;
  JORNADA_MINUTOS: number;
  INTERVALO_MINUTOS: number;
};

const allowed = new Set(['528:70', '360:70', '300:15']);
const postAllowed = new Set(['528:100', '504:70', '504:100']);

export function ShiftProfileSelect({ onSelect, disabled = false, sundayOnly = false, postStore = false }: {
  onSelect: (profile: ShiftProfile) => void;
  disabled?: boolean;
  sundayOnly?: boolean;
  postStore?: boolean;
}) {
  const [profiles, setProfiles] = useState<ShiftProfile[]>([]);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ horarios: ShiftProfile[] }>('/api/catalog/horarios-padrao', controller.signal)
      .then(({ horarios }) => setProfiles((horarios || []).filter((item) =>
        allowed.has(`${item.JORNADA_MINUTOS}:${item.INTERVALO_MINUTOS}`)
          || postAllowed.has(`${item.JORNADA_MINUTOS}:${item.INTERVALO_MINUTOS}`))))
      .catch((reason) => { if (reason.name !== 'AbortError') setError('Horários cadastrados indisponíveis.'); });
    return () => controller.abort();
  }, []);

  const available = profiles.filter((item) => (postStore || !postAllowed.has(`${item.JORNADA_MINUTOS}:${item.INTERVALO_MINUTOS}`))
    && (!sundayOnly || item.JORNADA_MINUTOS === 360));
  return <label className="catalog-full-field">Horário cadastrado
    <select value={selected} disabled={disabled || !available.length} onChange={(event) => {
      setSelected(event.target.value);
      const profile = available.find((item) => String(item.ESCHORPAD_ID) === event.target.value);
      if (profile) onSelect(profile);
    }}>
      <option value="">{available.length ? 'Selecionar horário' : 'Nenhum horário cadastrado'}</option>
      {available.map((item) => <option key={item.ESCHORPAD_ID} value={item.ESCHORPAD_ID}>
        {item.DESCR} · {item.HR_ENT1}–{item.HR_SAI2}
      </option>)}
    </select>
    {error && <small role="alert">{error}</small>}
  </label>;
}
