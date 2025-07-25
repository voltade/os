grant usage on schema mrp to anon,
authenticated,
service_role;

grant all on all tables in schema mrp to anon,
authenticated,
service_role;

grant all on all routines in schema mrp to anon,
authenticated,
service_role;

grant all on all sequences in schema mrp to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema mrp
grant all on tables to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema mrp
grant all on routines to anon,
authenticated,
service_role;

alter default privileges for role postgres in schema mrp
grant all on sequences to anon,
authenticated,
service_role;
