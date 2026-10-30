function enabledAdditionalSectionSql(sectionAlias, lojaSql) {
  return `(
    exists (select 1 from sgn_esc_loja rollout_loja
             where rollout_loja.loja = ${lojaSql}
               and nvl(rollout_loja.todas_secoes_habilitadas, 0) = 1)
    and not regexp_like(trim(nvl(${sectionAlias}.cod_secao, ' ')), '(^|[.])01[.]001$')
    and not regexp_like(trim(nvl(${sectionAlias}.cod_secao, ' ')), '(^|[.])02[.]012$')
    and exists (select 1 from sgn_esc_funcionario rollout_func
                 where rollout_func.escsecao_id = ${sectionAlias}.escsecao_id
                   and rollout_func.loja = ${lojaSql}
                   and rollout_func.dt_demiss is null
                   and upper(trim(nvl(rollout_func.status, 'A'))) in ('A', 'F', 'P'))
  )`;
}

function activeSectionSql(sectionAlias, lojaSql) {
  return `(not regexp_like(trim(nvl(${sectionAlias}.cod_secao, ' ')), '(^|[.])01[.]001$')
    and (nvl(${sectionAlias}.status, 'A') = 'A' or ${enabledAdditionalSectionSql(sectionAlias, lojaSql)}))`;
}

module.exports = { activeSectionSql, enabledAdditionalSectionSql };
