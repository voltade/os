create or replace function openfga_check_core (p_user text, p_relation text, p_object text) returns boolean as '$libdir/openfga',
'checkCore' language c strict;

create or replace function openfga_check_core (p_user text, p_relation text, p_object text, p_contextual_tuples text[]) returns boolean as '$libdir/openfga',
'checkCore' language c strict;

create or replace function openfga_check_custom (p_user text, p_relation text, p_object text) returns boolean as '$libdir/openfga',
'checkCustom' language c strict;

create or replace function openfga_check_custom (p_user text, p_relation text, p_object text, p_contextual_tuples text[]) returns boolean as '$libdir/openfga',
'checkCustom' language c strict;
