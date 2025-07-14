resource "kind_cluster" "this" {
  name            = var.cluster_name
  node_image      = "kindest/node:${var.kubernetes_version}"
  kubeconfig_path = "${path.root}/kubeconfig"

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"
    networking {
      disable_default_cni = true
    }
    node {
      role = "control-plane"

      extra_port_mappings {
        container_port = 80
        host_port      = 80
      }

      extra_port_mappings {
        container_port = 5432
        host_port      = 31013
      }

      extra_mounts {
        host_path      = "${path.root}/../../"
        container_path = "/mnt/voltade-os.git"
        read_only      = true
      }
    }
  }
}
