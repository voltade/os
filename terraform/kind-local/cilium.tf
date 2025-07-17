# https://www.talos.dev/v1.9/kubernetes-guides/network/deploying-cilium/
# https://registry.terraform.io/providers/hashicorp/helm/latest/docs/resources/release
resource "helm_release" "cilium" {
  name       = "cilium"
  repository = "https://helm.cilium.io/"
  chart      = "cilium"
  version    = var.cilium_version
  namespace  = "kube-system"
  values = [
    file("${path.module}/cilium.values.yaml"),
  ]
  set = [{
    name  = "k8sServiceHost"
    value = local.kind_cluster_ip
    }, {
    name  = "k8sServicePort"
    value = "6443"
  }]
  wait_for_jobs = true
}
