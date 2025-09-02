drop function if exists allow (p_relation text, p_object text) cascade;

create or replace function allow (p_relation text, p_object text) returns boolean
language plpgsql
stable
security definer
set search_path = extensions, public
as $$
declare
  v_user_id text;
begin  


  v_user_id := nullif(current_setting('request.jwt.claims', true)::json->>'sub','')::text;

  raise log 'allow123(): v_user_id=% relation=% object=%', coalesce(v_user_id, '<null>'), p_relation, p_object;

  if v_user_id is null then
    return false;
  end if;

  return extensions.openfga_check(
    p_store_name := 'core',
    p_user := 'user:' || v_user_id,
    p_relation := p_relation,
    p_object := p_object
  );
end;
$$;


