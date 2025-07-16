grant usage on schema internal to anon,
authenticated,
service_role;

grant all on all tables in schema internal to anon,
authenticated,
service_role;

grant all on all routines in schema internal to anon,
authenticated,
service_role;

grant all on all sequences in schema internal to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema internal
grant all on tables to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema internal
grant all on routines to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema internal
grant all on sequences to anon,
authenticated,
service_role;
