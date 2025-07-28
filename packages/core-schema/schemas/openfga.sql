drop function if exists allow (p_relation varchar, p_object varchar) cascade;

create or replace function allow (p_relation varchar, p_object varchar) returns boolean as $$
declare
  p_user varchar;
begin
  p_user := current_setting('app.user', true);

  if p_user is null then
    raise warning 'Current user is not set';
    return false;
  end if;
    
  -- todo: do some openfga check here
  return true;
end;
$$ language plpgsql volatile;
