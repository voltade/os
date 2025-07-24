variable "cluster_name" {
  type    = string
  default = "voltade-os-local"
}

variable "cluster_domain_public" {
  type    = string
  default = "127.0.0.1.nip.io"
}

# https://hub.docker.com/r/kindest/node/tags
variable "kubernetes_version" {
  type    = string
  default = "v1.33.1"
}

# https://artifacthub.io/packages/helm/cilium/cilium
variable "cilium_version" {
  type    = string
  default = "1.18.0-rc.1"
}

# https://docs.cilium.io/en/stable/network/servicemesh/gateway-api/gateway-api/#prerequisites
variable "gateway_api_version" {
  type    = string
  default = "v1.3.0"
}

# https://artifacthub.io/packages/helm/traefik/traefik
variable "traefik_helm_version" {
  type    = string
  default = "36.3.0"
}

# https://artifacthub.io/packages/helm/argo/argo-cd
variable "argocd_helm_version" {
  type    = string
  default = "8.2.0"
}

# https://argo-cd.readthedocs.io/en/stable/user-guide/directory/#including-only-certain-file
variable "argocd_appsets_include" {
  type    = string
  default = "dev/*"
}
