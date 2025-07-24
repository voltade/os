grant usage on schema product to anon,
authenticated,
service_role;

grant all on all tables in schema product to anon,
authenticated,
service_role;

grant all on all routines in schema product to anon,
authenticated,
service_role;

grant all on all sequences in schema product to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema product
grant all on tables to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema product
grant all on routines to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema product
grant all on sequences to anon,
authenticated,
service_role;
