drop function if exists openfga_check_core (p_user text, p_relation text, p_object text);

drop function if exists openfga_check_core (p_user text, p_relation text, p_object text, p_contextual_tuples text[]);

drop function if exists openfga_check_custom (p_user text, p_relation text, p_object text);

drop function if exists openfga_check_custom (p_user text, p_relation text, p_object text, p_contextual_tuples text[]);

-- C-backed TEXT signatures
create or replace function _openfga_write (p_store_name text, p_write_tuples text) returns boolean as '$libdir/openfga',
'write_tuples' language c strict;

create or replace function _openfga_delete (p_store_name text, p_delete_tuples text) returns boolean as '$libdir/openfga',
'delete_tuples' language c strict;

create or replace function _openfga_check (
  p_store_name text,
  p_user text,
  p_relation text,
  p_object text,
  p_contextual_tuples text
) returns boolean as '$libdir/openfga',
'check' language c strict;

-- JSONB convenience wrappers (cast to text then call C-backed functions)
create or replace function openfga_write (p_store_name text, p_write_tuples jsonb) returns boolean language sql strict as $$
  select _openfga_write($1, $2::text);
$$;

create or replace function openfga_delete (p_store_name text, p_delete_tuples jsonb) returns boolean language sql strict as $$
select
  _openfga_delete ($1, $2::text);
$$;

create or replace function openfga_check (p_store_name text, p_user text, p_relation text, p_object text) returns boolean language sql strict as $$
  select _openfga_check($1, $2, $3, $4, '[]'::text);
$$;

create or replace function openfga_check (
  p_store_name text,
  p_user text,
  p_relation text,
  p_object text,
  p_contextual_tuples jsonb
) returns boolean language sql strict as $$
  select _openfga_check($1, $2, $3, $4, $5::text);
$$;
