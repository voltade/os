resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = var.argocd_helm_version
  namespace        = "argocd"
  create_namespace = true
  values = [
    file("${path.module}/argocd.values.yaml"),
    yamlencode({
      global = {
        domain = local.domain
      }
    }),
    yamlencode(var.argocd_helm_values)
  ]
}
