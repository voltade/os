grant usage on schema service to anon,
authenticated,
service_role;

grant all on all tables in schema service to anon,
authenticated,
service_role;

grant all on all routines in schema service to anon,
authenticated,
service_role;

grant all on all sequences in schema service to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema service
grant all on tables to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema service
grant all on routines to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema service
grant all on sequences to anon,
authenticated,
service_role;
