declare
  v_total number;
begin
  select count(*) into v_total from user_constraints
   where table_name = 'SGN_ESC_TRANSFER_SUB'
     and constraint_name = 'SGN_ESC_TRSUB_STATUS2_CK';
  if v_total = 0 then
    execute immediate 'alter table sgn_esc_transfer_sub add constraint sgn_esc_trsub_status2_ck check (status in (''P'', ''E'', ''C'', ''F'', ''X''))';
  end if;

  select count(*) into v_total from user_constraints
   where table_name = 'SGN_ESC_TRANSFER_SUB'
     and constraint_name = 'SGN_ESC_TRANSFER_SUB_STATUS_CK';
  if v_total > 0 then
    execute immediate 'alter table sgn_esc_transfer_sub drop constraint sgn_esc_transfer_sub_status_ck';
  end if;
end;
/
