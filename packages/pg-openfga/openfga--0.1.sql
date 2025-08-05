create or replace function openfga_check (p_store_name text, p_user text, p_relation text, p_object text) returns boolean as '$libdir/openfga',
'check' language c strict;
