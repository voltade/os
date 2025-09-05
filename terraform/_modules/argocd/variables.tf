variable "cluster_domain_public" {
  type        = string
  description = "The domain name of the cluster."
}

variable "k8s_config" {
  type = object({
    host                   = string
    cluster_ca_certificate = string
    client_certificate     = string
    client_key             = string
    username               = string
  })
}

variable "argocd_helm_version" {
  type = string
}

variable "argocd_helm_values" {
  type    = any
  default = {}
}

variable "git_repo_url" {
  type = string
}

variable "helm_repo_url" {
  type = string
}

# https://argo-cd.readthedocs.io/en/stable/user-guide/directory/#including-only-certain-file
variable "appsets_include" {
  type = string
}

variable "environment_generator_password" {
  type      = string
  sensitive = true
  default   = "" # will generate a random password if empty
}

variable "environment_generator_base_url" {
  type = string
}
