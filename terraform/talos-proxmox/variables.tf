variable "cluster_name" {
  type    = string
  default = "voltade-os-dev"
}

variable "cluster_domain_public" {
  type    = string
  default = "os.voltade.dev"
}

variable "proxmox_node_names" {
  type        = list(string)
  description = "List of Proxmox node names where the Talos VMs will be created."
}

variable "control_plane_node_count" {
  type        = number
  description = "The number of control plane nodes."
}

variable "postgres_node_count" {
  type        = number
  description = "The number of Postgres nodes."
}

variable "worker_node_count" {
  type        = number
  description = "The number of worker nodes."
}

# https://github.com/siderolabs/talos/releases
variable "talos_version" {
  type        = string
  description = "The version of Talos to use."
  default     = "1.10.7"
}

# https://artifacthub.io/packages/helm/cilium/cilium
variable "cilium_version" {
  type    = string
  default = "1.18.1"
}

# https://docs.cilium.io/en/stable/network/servicemesh/gateway-api/gateway-api/#prerequisites
variable "gateway_api_version" {
  type    = string
  default = "v1.3.0"
}

# https://artifacthub.io/packages/helm/traefik/traefik
variable "traefik_helm_version" {
  type    = string
  default = "37.0.0"
}

# https://artifacthub.io/packages/helm/argo/argo-cd
variable "argocd_helm_version" {
  type    = string
  default = "8.3.0"
}

# https://argo-cd.readthedocs.io/en/stable/user-guide/directory/#including-only-certain-file
variable "argocd_appsets_include" {
  type    = string
  default = "dev/*"
}
