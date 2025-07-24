grant usage on schema approval to anon,
authenticated,
service_role;

grant all on all tables in schema approval to anon,
authenticated,
service_role;

grant all on all routines in schema approval to anon,
authenticated,
service_role;

grant all on all sequences in schema approval to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema approval
grant all on tables to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema approval
grant all on routines to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema approval
grant all on sequences to anon,
authenticated,
service_role;
