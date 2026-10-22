-- Executar uma vez no schema dono de PK_VT antes de compilar o novo package body.
-- A configuracao e por mes de compra; meses anteriores a novembro/2026 seguem no APEX.
create table SGN_VT_ESCALA_INT_LOJA (
  LOJA number(10) not null,
  MES_INICIO date not null,
  MES_FIM date,
  constraint SGN_VT_ESC_INT_LOJA_PK primary key (LOJA, MES_INICIO),
  constraint SGN_VT_ESC_INT_LOJA_CK check (MES_FIM is null or MES_FIM >= MES_INICIO)
);

create table SGN_VT_ESCALA_SNAPSHOT (
  VTCOMPFUNC_ID number(15) not null,
  FONTE varchar2(12) not null,
  DIAS_ESCALA number(5) not null,
  DT_HR_CAPTURA date default sysdate not null,
  constraint SGN_VT_ESC_SNAPSHOT_PK primary key (VTCOMPFUNC_ID),
  constraint SGN_VT_ESC_SNAPSHOT_COMP_FK foreign key (VTCOMPFUNC_ID)
    references SGN_VT_COMPRA_FUNC (VTCOMPFUNC_ID) on delete cascade,
  constraint SGN_VT_ESC_SNAPSHOT_FONTE_CK check (FONTE in ('APEX', 'INTELIGENTE'))
);

create table SGN_VT_ESCALA_SNAPSHOT_DIA (
  VTCOMPFUNC_ID number(15) not null,
  DT date not null,
  constraint SGN_VT_ESC_SNAP_DIA_PK primary key (VTCOMPFUNC_ID, DT),
  constraint SGN_VT_ESC_SNAP_DIA_FK foreign key (VTCOMPFUNC_ID)
    references SGN_VT_ESCALA_SNAPSHOT (VTCOMPFUNC_ID) on delete cascade
);

insert all
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (2, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (3, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (7, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (16, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (35, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (47, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (52, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (63, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (64, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (300, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (301, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (302, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (303, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (304, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (305, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (306, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (307, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (308, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (309, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (310, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (311, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (312, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (313, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (314, date '2026-11-01')
  into SGN_VT_ESCALA_INT_LOJA (LOJA, MES_INICIO) values (315, date '2026-11-01')
select 1 from dual;

commit;
