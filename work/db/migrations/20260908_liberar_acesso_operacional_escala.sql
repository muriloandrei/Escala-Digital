-- Normaliza os acessos das telas usadas pelo fluxo operacional da escala.
-- Subsecoes usam a permissao de visualizacao de "secoes"; edicoes de subsecoes
-- continuam passando por "escalas:editar".

merge into SGN_ESC_PERFIL_PERMISSAO pp
using (
  select p.perfil_id,
         cfg.pagina,
         cfg.pode_visualizar,
         cfg.pode_criar,
         cfg.pode_editar,
         cfg.pode_oficializar,
         cfg.pode_reprocessar,
         cfg.pode_excluir,
         cfg.pode_administrar
    from SGN_ESC_PERFIL p
    join (
      select 'GERENTE' perfil, 'escalas' pagina, 1 pode_visualizar, 1 pode_criar, 1 pode_editar, 1 pode_oficializar, 0 pode_reprocessar, 0 pode_excluir, 0 pode_administrar from dual union all
      select 'GERENTE', 'escalas-funcionarios', 1, 0, 1, 0, 0, 0, 0 from dual union all
      select 'GERENTE', 'secoes', 1, 0, 0, 0, 0, 0, 0 from dual union all
      select 'RH', 'escalas', 1, 1, 1, 1, 0, 0, 0 from dual union all
      select 'RH', 'escalas-funcionarios', 1, 0, 1, 0, 0, 0, 0 from dual union all
      select 'RH', 'secoes', 1, 0, 0, 0, 0, 0, 0 from dual union all
      select 'LIDER', 'escalas', 1, 0, 1, 0, 0, 0, 0 from dual union all
      select 'LIDER', 'escalas-funcionarios', 1, 0, 1, 0, 0, 0, 0 from dual union all
      select 'LIDER', 'secoes', 1, 0, 0, 0, 0, 0, 0 from dual
    ) cfg on cfg.perfil = upper(p.nome)
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
