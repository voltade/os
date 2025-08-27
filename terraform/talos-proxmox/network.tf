locals {
  node_ipv4_cidr           = "10.0.1.0/24"
  node_ipv4_cidr_block     = split("/", local.node_ipv4_cidr)[0] # 10.0.1.0
  node_ipv4_cidr_mask_size = split("/", local.node_ipv4_cidr)[1] # 24

  # Cluster internal network configuration
  network_ipv4_cidr = "10.0.0.0/16"
  pod_ipv4_cidr     = "10.0.128.0/17"
  service_ipv4_cidr = "10.0.64.0/18"
}

locals {
  gateway_private_ipv4 = cidrhost(local.node_ipv4_cidr, 1)

  control_plane_private_vip_ipv4 = cidrhost(local.node_ipv4_cidr, 2)

  control_plane_private_ipv4_list = [
    for index in range(var.control_plane_node_count) : cidrhost(local.node_ipv4_cidr, index + 3)
  ]
  first_control_plane_private_ipv4 = local.control_plane_private_ipv4_list[0]

  postgres_private_ipv4_list = [
    for index in range(var.postgres_node_count) : cidrhost(local.node_ipv4_cidr, index + 11)
  ]

  worker_private_ipv4_list = [
    for index in range(var.worker_node_count) : cidrhost(local.node_ipv4_cidr, index + 21)
  ]

  certSANs = distinct(
    concat(
      local.control_plane_private_ipv4_list,
      compact([
        local.cluster_api_host_public,
        local.cluster_api_host_private,
        local.control_plane_private_vip_ipv4,
      ])
    )
  )

  extraHostEntries = [
    {
      ip      = local.control_plane_private_vip_ipv4
      aliases = [local.cluster_api_host_private]
    }
  ]
}
