create or replace function dummy () returns text language plpgsql as $$
begin
  return 'dummy';
end;
$$;
