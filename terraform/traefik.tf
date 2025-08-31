resource "helm_release" "traefik" {
  depends_on       = [helm_release.cilium]
  name             = "traefik"
  repository       = "https://traefik.github.io/charts"
  chart            = "traefik"
  version          = var.traefik_helm_version
  namespace        = "traefik"
  create_namespace = true
  values = [
    file("${path.module}/traefik.values.yaml"),
  ]
}
