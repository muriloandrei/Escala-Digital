export function permiteEscala(status?: string | null) {
  return ['A', 'F'].includes(String(status || 'A').trim().toUpperCase());
}
