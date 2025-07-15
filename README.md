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

```
cd terraform/kind-local
tofu init
tofu apply -var="registry_ip=<IP_ADDR_IN_voltade-os-local-control-plane>"
```

## Kubectl credentials

```
./post-apply.sh
```

## Publish Helm chart

```
bun helm instance --overwrite
```

## Starting the server

```
bun run start
```
