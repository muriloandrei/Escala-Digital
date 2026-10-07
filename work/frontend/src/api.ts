export type User = {
  sub: string;
  nome: string;
  login: string;
  perfil: string;
  lojaPrincipal?: number;
  lojas?: number[];
  permissoes?: { PAGINA: string; PODE_VISUALIZAR: number; PODE_EDITAR?: number; PODE_CRIAR?: number }[];
};

export function canView(user: User, page: string) {
  return (
    user.perfil === 'ADMIN' ||
    user.permissoes?.some((item) => item.PAGINA === page && Number(item.PODE_VISUALIZAR) === 1) === true
  );
}

export function canEdit(user: User, page: string) {
  return (
    user.perfil === 'ADMIN' ||
    user.permissoes?.some((item) => item.PAGINA === page && Number(item.PODE_EDITAR) === 1) === true
  );
}

export function canCreate(user: User, page: string) {
  return user.perfil === 'ADMIN' ||
    user.permissoes?.some((item) => item.PAGINA === page && Number(item.PODE_CRIAR) === 1) === true;
}

export function preferredStore(user: User, lojas: Loja[]) {
  if (!lojas.length) return '';
  return String(
    lojas.find((item) => Number(item.LOJA) === Number(user.lojaPrincipal))?.LOJA || lojas[0].LOJA,
  );
}

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

export type Funcionario = {
  ESCFUNC_ID: number;
  ESCFUNCAO_ID?: number | null;
  LOJA?: number;
  CHAPA: string;
  NOME: string;
  ESCSECAO_ID?: number | null;
  ESCSUBSECAO_ID?: number | null;
  COD_SECAO?: string | null;
  SECAO_DESCR?: string | null;
  SUBSECAO_DESCR?: string | null;
  FUNCAO_DESCR?: string | null;
  HR_ENT1?: string | null;
  HR_SAI1?: string | null;
  HR_ENT2?: string | null;
  HR_SAI2?: string | null;
  DT_DEMISS?: string | null;
  GERADA?: number;
};

export type Subsecao = {
  ESCSUBSECAO_ID: number;
  ESCSECAO_ID: number;
  DESCR: string;
  STATUS: string;
};

export type Secao = {
  ESCSECAO_ID: number;
  LOJA?: number;
  COD_SECAO?: string;
  DESCR: string;
  STATUS?: string;
  FUNCIONARIOS?: number;
  GERADOS?: number;
  OFICIALIZADA?: number;
  SUBSECOES?: Subsecao[];
};

export type DiaEscala = Funcionario & {
  DT: string;
  REVISAO?: number;
  ESCPROGDIA_ID?: number;
  PROGRAMACAO?: string | null;
  HR_ENT1?: string | null;
  HR_SAI1?: string | null;
  HR_ENT2?: string | null;
  HR_SAI2?: string | null;
  FIXO_ESCALA?: number;
  AUSENCIA_OBRIGATORIA?: number;
  MOTIVO_AUSENCIA?: string | null;
  JUSTIFICATIVA_ALTERACAO?: string | null;
  OFICIALIZADA?: number;
};

export type FixoEscala = {
  ESCFUNC_ID: number;
  ESCSECAO_ID: number;
  DT: string;
  PROGRAMACAO: string;
  HR_ENT1?: string | null;
  HR_SAI1?: string | null;
  HR_ENT2?: string | null;
  HR_SAI2?: string | null;
  JUSTIFICATIVA?: string | null;
};

export type EscalaMensal = {
  revisao: number | null;
  status: string | null;
  oficializada?: number;
  pendenciasDesligamento?: { dias: number; funcionarios: number; futuros: number; passados: number };
  funcionarios: Funcionario[];
  secoes: Secao[];
  dias: DiaEscala[];
  fixos?: FixoEscala[];
};

export type PeriodoOperacional = { inicio: string; fim: string };

export type EscalaEvento = {
  EVENTO_ID: number;
  LOJA: number;
  MES_REF: string;
  ESCSECAO_ID?: number | null;
  ESCSUBSECAO_ID?: number | null;
  ESCFUNC_ID?: number | null;
  LOGIN: string;
  ACAO: string;
  ORIGEM: string;
  SITUACAO: string;
  REVISAO_ANTERIOR?: number | null;
  REVISAO_NOVA?: number | null;
  DETALHE?: Record<string, unknown>;
  DT_HR_INCL: string;
  FUNCIONARIO_NOME?: string | null;
  FUNCIONARIO_CHAPA?: string | null;
  SECAO_NOME?: string | null;
  SUBSECAO_NOME?: string | null;
};

export type EventosResumo = {
  colaboradores: number;
  total: number;
  manuais: number;
  antes: number;
  depois: number;
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

export async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (response.status === 401) {
    window.location.assign('/');
    throw new ApiError('Sessao expirada. Entre novamente.', 401);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(responseError(data), response.status);
  return data as T;
}

function responseError(data: {
  resultado?: { motivo?: string };
  error?: string;
  errors?: unknown[];
  details?: unknown[];
}) {
  const issue = [...(data.errors || []), ...(data.details || [])][0];
  const detail =
    typeof issue === 'string'
      ? issue
      : issue && typeof issue === 'object' && 'message' in issue
        ? String(issue.message)
        : '';
  return [data.resultado?.motivo || data.error || 'Não foi possível concluir a operação.', detail]
    .filter(Boolean)
    .join(' ');
}

export async function patchJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (response.status === 401) {
    window.location.assign('/');
    throw new ApiError('Sessao expirada. Entre novamente.', 401);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(responseError(data), response.status);
  return data as T;
}

export async function putJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (response.status === 401) {
    window.location.assign('/');
    throw new ApiError('Sessao expirada. Entre novamente.', 401);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(responseError(data), response.status);
  return data as T;
}

export async function deleteJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { method: 'DELETE', credentials: 'same-origin' });
  if (response.status === 401) {
    window.location.assign('/');
    throw new ApiError('Sessao expirada. Entre novamente.', 401);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(responseError(data), response.status);
  return data as T;
}
