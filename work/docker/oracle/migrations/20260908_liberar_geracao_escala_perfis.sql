-- Garante que os perfis operacionais possam gerar escala da secao.
-- A rota de geracao usa a permissao escalas:editar.

merge into SGN_ESC_PERFIL p
using (
  select 'ADMIN' nome, 'Administrador' descr from dual union all
  select 'GERENTE', 'Gerente de loja' from dual union all
  select 'RH', 'Recursos Humanos' from dual union all
  select 'LIDER', 'Lider de secao' from dual
) s
on (upper(p.nome) = s.nome)
when matched then update set p.status = 'A'
when not matched then insert (perfil_id, nome, descr, status, dt_hr_incl)
  values (sgn_esc_perfil_seq.nextval, s.nome, s.descr, 'A', sysdate);

merge into SGN_ESC_PERFIL_PERMISSAO pp
using (
  select p.perfil_id,
         'escalas' pagina,
         1 pode_visualizar,
         case when upper(p.nome) in ('ADMIN', 'GERENTE', 'RH') then 1 else 0 end pode_criar,
         1 pode_editar,
         case when upper(p.nome) in ('ADMIN', 'GERENTE', 'RH') then 1 else 0 end pode_oficializar,
         case when upper(p.nome) = 'ADMIN' then 1 else 0 end pode_reprocessar,
         case when upper(p.nome) = 'ADMIN' then 1 else 0 end pode_excluir,
         case when upper(p.nome) = 'ADMIN' then 1 else 0 end pode_administrar
    from SGN_ESC_PERFIL p
   where upper(p.nome) in ('ADMIN', 'GERENTE', 'RH', 'LIDER')
) cfg
on (pp.perfil_id = cfg.perfil_id and pp.pagina = cfg.pagina)
when matched then update set
  pp.pode_visualizar = greatest(nvl(pp.pode_visualizar, 0), cfg.pode_visualizar),
  pp.pode_criar = greatest(nvl(pp.pode_criar, 0), cfg.pode_criar),
  pp.pode_editar = greatest(nvl(pp.pode_editar, 0), cfg.pode_editar),
  pp.pode_oficializar = greatest(nvl(pp.pode_oficializar, 0), cfg.pode_oficializar),
  pp.pode_reprocessar = greatest(nvl(pp.pode_reprocessar, 0), cfg.pode_reprocessar),
  pp.pode_excluir = greatest(nvl(pp.pode_excluir, 0), cfg.pode_excluir),
  pp.pode_administrar = greatest(nvl(pp.pode_administrar, 0), cfg.pode_administrar)
when not matched then insert (
  perfil_id, pagina, pode_visualizar, pode_criar, pode_editar,
  pode_oficializar, pode_reprocessar, pode_excluir, pode_administrar, dt_hr_incl
)
values (
  cfg.perfil_id, cfg.pagina, cfg.pode_visualizar, cfg.pode_criar, cfg.pode_editar,
  cfg.pode_oficializar, cfg.pode_reprocessar, cfg.pode_excluir, cfg.pode_administrar, sysdate
);

commit;
