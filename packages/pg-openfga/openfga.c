#include "postgres.h"
#include "fmgr.h"

PG_MODULE_MAGIC;

// After the above required boilerplate, register each of the exported Go
// functions using PG_FUNCTION_INFO_V1.

PG_FUNCTION_INFO_V1(Check);
