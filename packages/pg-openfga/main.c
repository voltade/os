#include "postgres.h"
#include "fmgr.h"
#include "utils/guc.h" // For GUC variables

PG_MODULE_MAGIC;

void _PG_init(void);

PG_FUNCTION_INFO_V1(write_tuples);
PG_FUNCTION_INFO_V1(delete_tuples);
PG_FUNCTION_INFO_V1(check);

// C-level variable to hold the GUC value.
// This variable is accessible from the Go code.
char *server_address;

// Module load callback
void _PG_init(void)
{
  DefineCustomStringVariable(
      "openfga.server_address",
      "The address of the OpenFGA gRPC server.",
      "The address (e.g., 'localhost:8081') of the OpenFGA gRPC server to connect to (default is 'openfga:8081').",
      &server_address,
      "openfga:8081",
      PGC_SIGHUP, // Requires a server reload/restart to change
      0,          // No special flags
      NULL,       // No check hook
      NULL,       // No assign hook
      NULL        // No show hook
  );
}
