-- Adds logical active/inactive flag for schedule revisions.
-- Safe to run more than once.

declare
  v_count number;
begin
  select count(*) into v_count
  from user_tab_columns
  where table_name = 'SGN_ESC_PROG'
    and column_name = 'ATIVA';

  if v_count = 0 then
    execute immediate 'alter table SGN_ESC_PROG add (ATIVA number(1) default 1 not null)';
  end if;
end;
/

declare
  v_count number;
begin
  select count(*) into v_count
  from user_constraints
  where table_name = 'SGN_ESC_PROG'
    and constraint_name = 'SGN_ESC_PROG_ATIVA_CK';

  if v_count = 0 then
    execute immediate 'alter table SGN_ESC_PROG add constraint SGN_ESC_PROG_ATIVA_CK check (ATIVA in (0, 1))';
  end if;
end;
/

declare
  v_count number;
begin
  select count(*) into v_count
  from user_indexes
  where index_name = 'SGN_ESC_PROG_2_IDX';

  if v_count = 0 then
    execute immediate 'create index SGN_ESC_PROG_2_IDX on SGN_ESC_PROG (LOJA, MES_REF, ATIVA, REVISAO)';
  end if;
end;
/
