# Setup

## Required

Bun: `curl -fsSL https://bun.com/install | bash`

Docker: `brew install --cask docker-desktop`

Other tools: `brew install kubectl kubecm helm opentofu`

## Terraform

Make sure nothing is running on port `80`, `443`, `5432`, or `6443`.

```bash
cd terraform/kind-local

tofu init
tofu apply

# Add the kubeconfig to your local context and open ArgoCD in your browser
./post-apply.sh
```

To destroy the cluster, run:

```bash
tofu state rm helm_release.cilium && tofu destroy
```

## Publish Helm chart to local registry

```bash
bun helm environment --overwrite
bun helm platform --overwrite
```

## Start the server

```bash
bun run dev
```
