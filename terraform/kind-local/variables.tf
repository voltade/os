variable "cluster_name" {
  type    = string
  default = "voltade-os-local"
}

variable "cluster_domain_public" {
  type    = string
  default = "127-0-0-1.sslip.io"
}

variable "registry_ip" {
  type    = string
  default = "172.19.0.3"
}

# https://hub.docker.com/r/kindest/node/tags
variable "kubernetes_version" {
  type    = string
  default = "v1.33.1"
}

# https://artifacthub.io/packages/helm/cilium/cilium
variable "cilium_version" {
  type    = string
  default = "1.17.5"
}

# https://docs.cilium.io/en/stable/network/servicemesh/gateway-api/gateway-api/#prerequisites
variable "gateway_api_version" {
  type    = string
  default = "v1.2.0"
}

# https://artifacthub.io/packages/helm/argo/argo-cd
variable "argocd_helm_version" {
  type    = string
  default = "8.1.3"
}

# https://argo-cd.readthedocs.io/en/stable/user-guide/directory/#including-only-certain-file
variable "argocd_appsets_include" {
  type    = string
  default = "dev/*"
}
