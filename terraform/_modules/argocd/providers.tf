terraform {
  required_version = "~> 1.10"
  required_providers {
    # https://registry.terraform.io/providers/hashicorp/kubernetes/latest
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }

    # https://registry.terraform.io/providers/hashicorp/helm/latest
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3.0"
    }

    # https://registry.terraform.io/providers/gavinbunney/kubectl/latest
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.0"
    }
  }
}

provider "kubernetes" {
  host                   = var.k8s_config.host
  cluster_ca_certificate = var.k8s_config.cluster_ca_certificate
  client_certificate     = var.k8s_config.client_certificate
  client_key             = var.k8s_config.client_key
  username               = var.k8s_config.username
}

provider "helm" {
  kubernetes = {
    host                   = var.k8s_config.host
    cluster_ca_certificate = var.k8s_config.cluster_ca_certificate
    client_certificate     = var.k8s_config.client_certificate
    client_key             = var.k8s_config.client_key
    username               = var.k8s_config.username
  }
}

provider "kubectl" {
  load_config_file       = false
  host                   = var.k8s_config.host
  cluster_ca_certificate = var.k8s_config.cluster_ca_certificate
  client_certificate     = var.k8s_config.client_certificate
  client_key             = var.k8s_config.client_key
  username               = var.k8s_config.username
}

