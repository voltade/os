grant usage on schema purchase to anon,
authenticated,
service_role;

grant all on all tables in schema purchase to anon,
authenticated,
service_role;

grant all on all routines in schema purchase to anon,
authenticated,
service_role;

grant all on all sequences in schema purchase to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema purchase
grant all on tables to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema purchase
grant all on routines to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema purchase
grant all on sequences to anon,
authenticated,
service_role;
