set define off

begin
  update sgn_esc_funcionario f set f.escsubsecao_id = null
   where f.dt_demiss is null
     and exists (
     select 1
       from sgn_esc_subsecao sub
       join sgn_esc_secao sec on sec.escsecao_id = sub.escsecao_id
      where sub.escsubsecao_id = f.escsubsecao_id
        and sub.escsecao_id = f.escsecao_id
        and upper(trim(sub.descr)) = 'PORTEIRO'
        and regexp_like(trim(sec.cod_secao), '(^|[.])02[.]002$')
        and sec.codfilial <> 999
        and not exists (
          select 1 from sgn_esc_funcao fn
           where fn.escfuncao_id = f.escfuncao_id
             and upper(trim(fn.descr)) = 'PORTEIRO')
   );
end;
/
