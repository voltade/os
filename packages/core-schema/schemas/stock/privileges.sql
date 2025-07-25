grant usage on schema stock to anon,
authenticated,
service_role;

grant all on all tables in schema stock to anon,
authenticated,
service_role;

grant all on all routines in schema stock to anon,
authenticated,
service_role;

grant all on all sequences in schema stock to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema stock
grant all on tables to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema stock
grant all on routines to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema stock
grant all on sequences to anon,
authenticated,
service_role;
