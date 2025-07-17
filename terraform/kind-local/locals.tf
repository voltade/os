locals {
  wildcard_hostname = "*.${var.cluster_domain_public}"
  ipv4_ipam_config  = [for config in tolist(data.docker_network.kind.ipam_config) : config if strcontains(config.subnet, ".")][0]
  kind_cluster_ip   = cidrhost(local.ipv4_ipam_config.subnet, 2)

  registry_host = "registry.${var.cluster_domain_public}"
  registry_ip   = cidrhost(local.ipv4_ipam_config.subnet, 3)
}
