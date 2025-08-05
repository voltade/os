ARG debian_version=bookworm
# https://www.postgresql.org/docs/release/
ARG postgresql_major=17
ARG postgresql_minor=5
ARG postgresql_release=${postgresql_major}.${postgresql_minor}

FROM golang:1.24.5-${debian_version} AS go-builder
ARG postgresql_major
ARG TARGETARCH

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  postgresql-common \
  && rm -rf /var/lib/apt/lists/*

RUN /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y

RUN apt-get update && apt-get install -y --no-install-recommends \
  postgresql-server-dev-${postgresql_major} \
  && rm -rf /var/lib/apt/lists/*

FROM go-builder AS openfga-source
WORKDIR /tmp/pg-openfga
COPY . .
RUN make -j$(nproc)

FROM postgres:${postgresql_release}-${debian_version}
ARG postgresql_major
COPY --from=openfga-source /tmp/pg-openfga/openfga.so "/usr/lib/postgresql/${postgresql_major}/lib/"
COPY --from=openfga-source /tmp/pg-openfga/openfga.control "/usr/share/postgresql/${postgresql_major}/extension/"
COPY --from=openfga-source /tmp/pg-openfga/openfga--0.1.0.sql "/usr/share/postgresql/${postgresql_major}/extension/"
