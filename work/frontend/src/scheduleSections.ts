import type { Secao } from './api';

function normalized(value: string | undefined) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function isPortaria(section: Secao) {
  return normalized(section.DESCR).includes('portaria')
    || /(?:^|[.])02[.]012$/.test(String(section.COD_SECAO || '').trim());
}

export function groupScheduleSections(sections: Secao[]) {
  const front = sections.find((section) => /frente.*caixa/.test(normalized(section.DESCR)));
  const portaria = front
    ? sections.filter((section) => section.ESCSECAO_ID !== front.ESCSECAO_ID && isPortaria(section))
    : [];
  const nestedIds = new Set(portaria.map((section) => section.ESCSECAO_ID));
  return {
    front,
    portaria,
    topLevel: sections.filter((section) => !nestedIds.has(section.ESCSECAO_ID)),
  };
}
