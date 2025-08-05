# https://www.postgresql.org/docs/current/extend-pgxs.html
EXTENSION = openfga
DATA = openfga--0.2.sql
MODULES = openfga

# Include /usr/lib/postgresql/17/lib/pgxs/src/makefiles/pgxs.mk
PG_CONFIG = pg_config
PGXS := $(shell $(PG_CONFIG) --pgxs)
override with_llvm = no
include $(PGXS)

INCLUDEDIR_SERVER := $(shell $(PG_CONFIG) --includedir-server)

$(addsuffix $(DLSUFFIX), $(EXTENSION)): *.c *.go Makefile
	echo Building $@
	CGO_CFLAGS="-I$(INCLUDEDIR_SERVER) -fpic -Wno-int-conversion -Wno-incompatible-pointer-types" \
		go build -v -buildmode=c-shared -o $@
