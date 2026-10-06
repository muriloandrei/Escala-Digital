export function nextFixedState(current?: string | null): 'FXF' | 'TRB' | null {
  if (current === 'FXF') return 'TRB';
  if (current === 'TRB') return null;
  return 'FXF';
}
