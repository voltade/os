grant usage on schema sales to anon,
authenticated,
service_role;

grant all on all tables in schema sales to anon,
authenticated,
service_role;

grant all on all routines in schema sales to anon,
authenticated,
service_role;

grant all on all sequences in schema sales to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema sales
grant all on tables to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema sales
grant all on routines to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema sales
grant all on sequences to anon,
authenticated,
service_role;
