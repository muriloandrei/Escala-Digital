export function permiteEscala(status?: string | null) {
  return ['A', 'F', 'P'].includes(String(status || 'A').trim().toUpperCase());
}
