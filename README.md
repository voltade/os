# Setup

## Required

1. docker
2. kind
3. kubectl
4. kubecm
5. helm
6. opentofu
7. bun

## Terraform

```bash
cd terraform/kind-local

tofu init
tofu apply

# Add the kubeconfig to your local context and open ArgoCD in your browser
./post-apply.sh
```

## Publish Helm chart to local registry

```bash
bun helm instance --overwrite
```

## Starting the server

```bash
bun run start
```
