locals {
  registry_host = "registry.${var.cluster_domain_public}"
  registry_ip   = cidrhost(tolist(data.docker_network.kind.ipam_config)[0].subnet, 3)
}
