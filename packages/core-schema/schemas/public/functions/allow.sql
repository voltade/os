drop function if exists allow (p_relation text, p_object text) cascade;

create or replace function allow (p_relation text, p_object text) returns boolean as $$
declare
  v_user_id text;
begin  
  v_user_id := nullif(current_setting('request.jwt.claim.sub', true), '')::text;

  if v_user_id is null then
    return false;
  end if;

  return extensions.openfga_check_core(
    p_user := "user:" || v_user_id,
    p_relation := p_relation,
    p_object := p_object
  );
end;
$$ language plpgsql stable;
