const MANAGEMENT_SECTION_SQL = "'(^|[.])01[.]001$'";

function isApprenticeManagementSection(section, loja) {
  const store = Number(loja);
  const code = String(section?.COD_SECAO || section?.cod_secao || '').trim();
  return ((store >= 400 && store <= 499) || (store >= 700 && store <= 799))
    && /(^|\.)01\.001$/.test(code);
}

function apprenticeManagementSectionSql(sectionAlias, lojaSql) {
  return `(
    regexp_like(trim(nvl(${sectionAlias}.cod_secao, ' ')), ${MANAGEMENT_SECTION_SQL})
    and (${lojaSql} between 400 and 499 or ${lojaSql} between 700 and 799)
    and exists (select 1 from sgn_esc_funcionario aprendiz
                 join sgn_esc_funcao funcao_aprendiz
                   on funcao_aprendiz.escfuncao_id = aprendiz.escfuncao_id
                where aprendiz.escsecao_id = ${sectionAlias}.escsecao_id
                  and aprendiz.loja = ${lojaSql}
                  and aprendiz.dt_demiss is null
                  and upper(trim(nvl(aprendiz.status, 'A'))) in ('A', 'F', 'P', 'Z')
                  and regexp_like(upper(funcao_aprendiz.descr), 'APRENDIZ'))
  )`;
}

function eligibleManagementEmployeeSql(sectionAlias, functionAlias, lojaSql) {
  return `(not regexp_like(trim(nvl(${sectionAlias}.cod_secao, ' ')), ${MANAGEMENT_SECTION_SQL})
    or ((${lojaSql} between 400 and 499 or ${lojaSql} between 700 and 799)
        and regexp_like(upper(nvl(${functionAlias}.descr, ' ')), 'APRENDIZ')))`;
}

function enabledAdditionalSectionSql(sectionAlias, lojaSql) {
  return `(
    exists (select 1 from sgn_esc_loja rollout_loja
             where rollout_loja.loja = ${lojaSql}
               and nvl(rollout_loja.todas_secoes_habilitadas, 0) = 1)
    and not regexp_like(trim(nvl(${sectionAlias}.cod_secao, ' ')), ${MANAGEMENT_SECTION_SQL})
    and not regexp_like(trim(nvl(${sectionAlias}.cod_secao, ' ')), '(^|[.])02[.]012$')
    and exists (select 1 from sgn_esc_funcionario rollout_func
                 where rollout_func.escsecao_id = ${sectionAlias}.escsecao_id
                   and rollout_func.loja = ${lojaSql}
                   and rollout_func.dt_demiss is null
                   and upper(trim(nvl(rollout_func.status, 'A'))) in ('A', 'F', 'P', 'Z'))
  )`;
}

function activeSectionSql(sectionAlias, lojaSql) {
  return `((not regexp_like(trim(nvl(${sectionAlias}.cod_secao, ' ')), ${MANAGEMENT_SECTION_SQL})
    and (nvl(${sectionAlias}.status, 'A') = 'A' or ${enabledAdditionalSectionSql(sectionAlias, lojaSql)}))
    or (nvl(${sectionAlias}.status, 'A') = 'A' and ${apprenticeManagementSectionSql(sectionAlias, lojaSql)}))`;
}

module.exports = { activeSectionSql, enabledAdditionalSectionSql, eligibleManagementEmployeeSql,
  isApprenticeManagementSection };
