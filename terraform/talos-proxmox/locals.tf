locals {
  cluster_domain_private = "cluster.local"

  cluster_api_host_public  = "kube.${var.cluster_domain_public}"
  cluster_api_host_private = "kube.${local.cluster_domain_private}"

  cluster_endpoint_url_private = "https://${local.cluster_api_host_private}:6443"

  control_plane_nodes = [
    for i in range(var.control_plane_node_count) : {
      name         = format("voltade-os-control-plane-%02s", i + 1)
      role         = "control-plane"
      ipv4_private = local.control_plane_private_ipv4_list[i]
    }
  ]

  postgres_nodes = [
    for i in range(var.postgres_node_count) : {
      name         = format("voltade-os-postgres-%02s", i + 1)
      role         = "postgres"
      ipv4_private = local.postgres_private_ipv4_list[i]
    }
  ]

  worker_nodes = [
    for i in range(var.worker_node_count) : {
      name         = format("voltade-os-worker-%02s", i + 1)
      role         = "worker"
      ipv4_private = local.worker_private_ipv4_list[i]
    }
  ]

  all_nodes = concat(
    local.control_plane_nodes,
    local.postgres_nodes,
    local.worker_nodes
  )

  all_non_control_plane_nodes = [
    for node in local.all_nodes : node
    if node.role != "control-plane"
  ]

  all_nodes_with_proxmox_host = [
    for i, node in local.all_nodes : merge(node, {
      proxmox_node = var.proxmox_node_names[i % length(var.proxmox_node_names)]
    })
  ]
}
