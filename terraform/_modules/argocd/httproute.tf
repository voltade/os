locals {
  domain = "argocd.${var.cluster_domain_public}"
}

resource "kubectl_manifest" "httproute" {
  depends_on = [helm_release.argocd]
  yaml_body = templatefile("${path.module}/httproute.yaml", {
    hostname = local.domain
  })
}
