grant usage on schema project to anon,
authenticated,
service_role;

grant all on all tables in schema project to anon,
authenticated,
service_role;

grant all on all routines in schema project to anon,
authenticated,
service_role;

grant all on all sequences in schema project to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema project
grant all on tables to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema project
grant all on routines to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema project
grant all on sequences to anon,
authenticated,
service_role;
