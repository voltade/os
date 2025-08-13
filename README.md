# Setup

## Required tools

Bun: `curl -fsSL https://bun.com/install | bash`

Docker: `brew install --cask docker-desktop`

Other tools: `brew install opentofu kubectl kubectl-cnpg kubecm helm k9s fga openfga/tap/fga`

## Terraform

Make sure nothing is running on port `80`, `443`, `5432`, or `6443`.

```bash
bun tofu:init
bun tofu:apply
```

Login to ArgoCD with username `admin` and password `admin`.

(To destroy the cluster, run `bun tofu:destroy`.)

## Prepare the platform database

```bash
bun --cwd packages/platform db:reset
```
This updates your `packages/platform/.env` file, creates the platform database, and inserts one row into the `environment` table.

Note: If `drizzle-kit` is stuck after outputting `Reading config file`, run `bun run clean && bun install` and try again.

## Start the platform web app

```bash
bun --cwd packages/platform dev
```

This serves an `/environment` endpoint which tells ArgoCD to create a CNPG cluster corresponding to the row inserted, which has one database (the "environment database").
## Apply the core schema to the environment database and seed it

```bash
bun --cwd packages/core-schema db:reset
```

## Connect the app template or an app to the environment database
For the app template, edit `packages/app-template/.env`  with reference to `.env.example`.

For some app, e.g., `education-registration`, edit `apps/education-registration/.env` with reference to `.env.example`.

## Start the app template or an app

```bash
# For the app template:
bun --cwd packages/app-template dev

# For an app:
bun --cwd apps/education-registration dev
```

If your development server is not starting, run `bun run clean && bun install` from the root of the repository before continuing to troubleshoot.

## Installation of PostgreSQL extensions

- Add source compiling to `docker/postgres/Dockerfile`: For most extensions that is not shipped with Postgres.

- Add to `shared_preload_libraries` in the [cnpg-cluster.yaml](argocd/platform/common/base/cnpg-cluster.yaml): If it requires being loaded at startup, such as _pg_stat_statements_, _supabase_vault_.

- Add to the `postInitApplicationSQL` in the [cnpg-cluster.yaml](argocd/platform/common/base/cnpg-cluster.yaml): If the installation requires superuser privileges, **AND** it introduces new objects (functions, tables, etc.) that need to be granted access to the `platform_admin` user. such as _supabase_vault_.

- Add to the `extensions` section in the [cnpg-database.yaml](argocd/platform/platform/base/cnpg-database.yaml): If it requires superuser to be installed, such as _plv8_, _pgcrypto_.

- Add it to [extensions](packages/platform/extensions) directory and link it to the [current.sql](packages/platform/migrations/current.sql): If it's pure SQL that doesn't require superuser privileges, such as _nanoid_.
