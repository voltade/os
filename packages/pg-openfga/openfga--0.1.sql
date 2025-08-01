create or replace function openfga_check(fga_user text, fga_relation text, fga_object text)
  returns boolean as '$libdir/openfga','Check'
  LANGUAGE C STRICT;
