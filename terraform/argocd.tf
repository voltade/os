module "argocd" {
  source = "./_modules/argocd"

  cluster_domain_public = var.cluster_domain_public
  k8s_config            = local.k8s_config

  argocd_helm_version = var.argocd_helm_version
  argocd_host_aliases = [{
    hostnames = [local.registry_host]
    ip        = local.registry_ip
  }]
  argocd_configs = {
    tls = {
      certificates = {
        "${local.registry_host}" = tls_self_signed_cert.ca.cert_pem
      }
    }
  }

  gateway_name = kubectl_manifest.cilium_gateway.name

  git_repo_url    = "file:///mnt/voltade-os.git"
  appsets_include = "dev/*"
  helm_repo_url   = "registry.127.0.0.1.nip.io"

  environment_generator_password = "password"
  environment_generator_base_url = "http://host.docker.internal:3000/api/environment"
}
