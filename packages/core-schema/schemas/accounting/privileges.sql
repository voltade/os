grant usage on schema account to anon,
authenticated,
service_role;

grant all on all tables in schema account to anon,
authenticated,
service_role;

grant all on all routines in schema account to anon,
authenticated,
service_role;

grant all on all sequences in schema account to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema account
grant all on tables to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema account
grant all on routines to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema account
grant all on sequences to anon,
authenticated,
service_role;
