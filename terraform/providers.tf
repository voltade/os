terraform {
  required_version = "~> 1.10"
  required_providers {
    # https://registry.terraform.io/providers/hashicorp/random/latest
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }

    # https://registry.terraform.io/providers/hashicorp/tls/latest
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }

    # https://registry.terraform.io/providers/hashicorp/local/latest
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }

    kind = {
      source  = "tehcyx/kind"
      version = "0.9.0"
    }

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

    docker = {
      source  = "kreuzwerker/docker"
      version = "3.6.2"
    }
  }
}

locals {
  k8s_config = {
    host                   = "https://127.0.0.1:6443"
    cluster_ca_certificate = kind_cluster.this.cluster_ca_certificate
    client_certificate     = kind_cluster.this.client_certificate
    client_key             = kind_cluster.this.client_key
    username               = var.cluster_name
  }
}

provider "kubernetes" {
  host                   = local.k8s_config.host
  cluster_ca_certificate = local.k8s_config.cluster_ca_certificate
  client_certificate     = local.k8s_config.client_certificate
  client_key             = local.k8s_config.client_key
  username               = local.k8s_config.username
}

provider "helm" {
  kubernetes = {
    host                   = local.k8s_config.host
    cluster_ca_certificate = local.k8s_config.cluster_ca_certificate
    client_certificate     = local.k8s_config.client_certificate
    client_key             = local.k8s_config.client_key
    username               = local.k8s_config.username
  }
}

provider "kubectl" {
  load_config_file       = false
  host                   = local.k8s_config.host
  cluster_ca_certificate = local.k8s_config.cluster_ca_certificate
  client_certificate     = local.k8s_config.client_certificate
  client_key             = local.k8s_config.client_key
  username               = local.k8s_config.username
}

