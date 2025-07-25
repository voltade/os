grant usage on schema hr to anon,
authenticated,
service_role;

grant all on all tables in schema hr to anon,
authenticated,
service_role;

grant all on all routines in schema hr to anon,
authenticated,
service_role;

grant all on all sequences in schema hr to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema hr
grant all on tables to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema hr
grant all on routines to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema hr
grant all on sequences to anon,
authenticated,
service_role;
