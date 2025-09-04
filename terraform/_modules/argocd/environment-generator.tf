resource "random_password" "environment_generator_token" {
  length  = 64
  special = false
}

resource "kubernetes_secret" "extra_secret" {
  depends_on = [helm_release.argocd]
  metadata {
    name      = "argocd-extra-secret"
    namespace = "argocd"
    labels = {
      "app.kubernetes.io/name"    = "argocd-extra-secret"
      "app.kubernetes.io/part-of" = "argocd"
    }
  }
  data = {
    "environment-generator.token" = length(var.environment_generator_password) > 0 ? var.environment_generator_password : random_password.environment_generator_token.result
  }
}

resource "kubectl_manifest" "environment_generator" {
  depends_on = [helm_release.argocd]
  yaml_body = templatefile("${path.module}/environment-generator.yaml", {
    base_url = var.environment_generator_base_url
  })
}
