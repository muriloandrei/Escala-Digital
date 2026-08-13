merge into SGN_ESC_PERFIL p
using (select 'GERENTE' nome, 'Gerente de loja' descr from dual) s
on (p.nome = s.nome)
when matched then update set p.descr = s.descr, p.status = 'A'
when not matched then insert (perfil_id, nome, descr, status, dt_hr_incl)
  values (sgn_esc_perfil_seq.nextval, s.nome, s.descr, 'A', sysdate);

merge into SGN_ESC_PERFIL p
using (select 'RH' nome, 'Recursos Humanos' descr from dual) s
on (p.nome = s.nome)
when matched then update set p.descr = s.descr, p.status = 'A'
when not matched then insert (perfil_id, nome, descr, status, dt_hr_incl)
  values (sgn_esc_perfil_seq.nextval, s.nome, s.descr, 'A', sysdate);

merge into SGN_ESC_PERFIL p
using (select 'LIDER' nome, 'Lider de secao' descr from dual) s
on (p.nome = s.nome)
when matched then update set p.descr = s.descr, p.status = 'A'
when not matched then insert (perfil_id, nome, descr, status, dt_hr_incl)
  values (sgn_esc_perfil_seq.nextval, s.nome, s.descr, 'A', sysdate);

delete from SGN_ESC_PERFIL_PERMISSAO
 where perfil_id in (
   select perfil_id
     from SGN_ESC_PERFIL
    where nome in ('GERENTE', 'RH', 'LIDER')
 );

insert into SGN_ESC_PERFIL_PERMISSAO (
  perfil_id, pagina, pode_visualizar, pode_criar, pode_editar,
  pode_oficializar, pode_reprocessar, pode_excluir, pode_administrar, dt_hr_incl
)
select p.perfil_id,
       cfg.pagina,
       cfg.visualizar,
       cfg.criar,
       cfg.editar,
       cfg.oficializar,
       cfg.reprocessar,
       cfg.excluir,
       cfg.administrar,
       sysdate
  from SGN_ESC_PERFIL p
  join (
    select 'GERENTE' perfil, 'escalas' pagina, 1 visualizar, 1 criar, 1 editar, 1 oficializar, 0 reprocessar, 0 excluir, 0 administrar from dual union all
    select 'GERENTE', 'escalas-funcionarios', 1, 0, 1, 0, 0, 0, 0 from dual union all
    select 'GERENTE', 'funcionarios', 1, 0, 0, 0, 0, 0, 0 from dual union all
    select 'GERENTE', 'secoes', 1, 0, 0, 0, 0, 0, 0 from dual union all
    select 'GERENTE', 'turnos-secao', 1, 0, 0, 0, 0, 0, 0 from dual union all
    select 'GERENTE', 'historico', 1, 0, 0, 0, 0, 0, 0 from dual union all
    select 'GERENTE', 'regras', 1, 0, 0, 0, 0, 0, 0 from dual union all

    select 'RH', 'escalas', 1, 1, 1, 1, 0, 0, 0 from dual union all
    select 'RH', 'escalas-funcionarios', 1, 0, 1, 0, 0, 0, 0 from dual union all
    select 'RH', 'funcionarios', 1, 0, 0, 0, 0, 0, 0 from dual union all
    select 'RH', 'secoes', 1, 0, 0, 0, 0, 0, 0 from dual union all
    select 'RH', 'turnos-secao', 1, 0, 0, 0, 0, 0, 0 from dual union all
    select 'RH', 'historico', 1, 0, 0, 0, 0, 0, 0 from dual union all
    select 'RH', 'regras', 1, 0, 0, 0, 0, 0, 0 from dual union all
    select 'RH', 'acessos', 1, 0, 1, 0, 0, 0, 0 from dual union all
    select 'RH', 'liberacao-secoes', 1, 0, 1, 0, 0, 0, 0 from dual union all

    select 'LIDER', 'escalas', 1, 0, 1, 0, 0, 0, 0 from dual union all
    select 'LIDER', 'escalas-funcionarios', 1, 0, 1, 0, 0, 0, 0 from dual union all
    select 'LIDER', 'funcionarios', 1, 0, 0, 0, 0, 0, 0 from dual union all
    select 'LIDER', 'secoes', 1, 0, 0, 0, 0, 0, 0 from dual union all
    select 'LIDER', 'turnos-secao', 1, 0, 0, 0, 0, 0, 0 from dual union all
    select 'LIDER', 'historico', 1, 0, 0, 0, 0, 0, 0 from dual union all
    select 'LIDER', 'regras', 1, 0, 0, 0, 0, 0, 0 from dual
  ) cfg on cfg.perfil = p.nome;

commit;
