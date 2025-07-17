resource "kind_cluster" "this" {
  name            = var.cluster_name
  node_image      = "kindest/node:${var.kubernetes_version}"
  kubeconfig_path = "${path.root}/kubeconfig"

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"
    networking {
      disable_default_cni = true
      kube_proxy_mode     = "none"
    }
    node {
      role = "control-plane"

      kubeadm_config_patches = [
        "kind: InitConfiguration\nnodeRegistration:\n  kubeletExtraArgs:\n    node-labels: \"ingress-ready=true\"\n"
      ]

      extra_port_mappings {
        container_port = 80
        host_port      = 80
      }

      extra_port_mappings {
        container_port = 30432
        host_port      = 5432
      }

      extra_port_mappings {
        container_port = 6443
        host_port      = 6443
      }

      extra_mounts {
        host_path      = "${path.root}/../../"
        container_path = "/mnt/voltade-os.git"
        read_only      = true
      }
    }
  }
}
