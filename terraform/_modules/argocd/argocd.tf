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
        domain      = local.domain
        hostAliases = var.argocd_host_aliases
      },
      configs = var.argocd_configs
    })
  ]
}
