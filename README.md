# Setup

## Required

Bun: `curl -fsSL https://bun.com/install | bash`

Docker: `brew install --cask docker-desktop`

Other tools: `brew install kubectl kubecm helm opentofu`

## Terraform

Make sure nothing is running on port `80`, `443`, `5432`, or `6443`.

```bash
bun tofu:init
bun tofu:apply
```

Login to ArgoCD with username `admin` and password `admin`.

To destroy the cluster, run:

```bash
bun tofu:destroy
```

## Prepare the platform database

```bash
cp packages/platform/.env.example packages/platform/.env
# Update the created .env file by running the included commands.

bun -cwd packages/platform db:reset
```

## Start the platform web app

```bash
bun --cwd packages/platform dev
```
