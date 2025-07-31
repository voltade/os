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
    containerd_config_patches = [
      <<-TOML
      version = 2
      [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
        endpoint = ["https://mirror.gcr.io"]
      [plugins."io.containerd.grpc.v1.cri".registry.mirrors."${local.registry_host}"]
        endpoint = ["https://${local.registry_ip}"]
      TOML
    ]

    node {
      role = "control-plane"

      kubeadm_config_patches = [
        <<-YAML
        kind: InitConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "ingress-ready=true"
        YAML
      ]

      extra_port_mappings {
        container_port = 80
        host_port      = 80
      }

      extra_port_mappings {
        container_port = 30425
        host_port      = 2500
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

      extra_mounts {
        host_path      = local_file.selfsigned_ca.filename
        container_path = "/usr/local/share/ca-certificates/voltade-ca.crt"
        read_only      = true
      }
    }
  }

  provisioner "local-exec" {
    command = "docker exec ${self.name}-control-plane update-ca-certificates"
  }
}
