grant usage on schema resource to anon,
authenticated,
service_role;

grant all on all tables in schema resource to anon,
authenticated,
service_role;

grant all on all routines in schema resource to anon,
authenticated,
service_role;

grant all on all sequences in schema resource to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema resource
grant all on tables to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema resource
grant all on routines to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema resource
grant all on sequences to anon,
authenticated,
service_role;
