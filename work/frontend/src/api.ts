export type User = {
  sub: string;
  nome: string;
  login: string;
  perfil: string;
  lojaPrincipal?: number;
  lojas?: number[];
};

export type Loja = { LOJA: number; ESCLOJA_ID?: number; NOME?: string; DESCR?: string };

export type ResumoEscala = {
  LOJA: number;
  MES_REF: string;
  STATUS: string;
  OFICIALIZADA?: number;
  OFICIALIZADA_ALGUMA?: number;
  SECOES?: number;
  FUNCIONARIOS?: number;
  MODIFICADA_EM?: string;
  MODIFICADO_POR?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { credentials: 'same-origin', cache: 'no-store', signal });
  if (response.status === 401) {
    window.location.assign('/');
    throw new ApiError('Sessao expirada. Entre novamente.', 401);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error || 'Nao foi possivel carregar os dados.', response.status);
  return data as T;
}
