resource "helm_release" "argocd" {
  depends_on       = [helm_release.cilium]
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
        domain = "argocd.${var.cluster_domain_public}"
        hostAliases = [{
          hostnames = [local.registry_host]
          ip        = local.registry_ip
        }]
      },
      configs = {
        tls = {
          certificates = {
            "${local.registry_host}" = tls_self_signed_cert.ca.cert_pem
          }
        }
      }
    })
  ]
}

resource "random_password" "argocd_environment_generator_token" {
  length  = 64
  special = false
}

resource "kubernetes_secret" "argocd_extra_secret" {
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
    # "environment-generator.token" = random_password.argocd_environment_generator_token.result
    "environment-generator.token" = "password"
  }
}

# https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories
# https://argo-cd.readthedocs.io/en/stable/operator-manual/argocd-repositories-yaml/
# https://registry.terraform.io/providers/1Password/onepassword/latest/docs/data-sources/item
resource "kubectl_manifest" "argocd_repo_git" {
  depends_on = [helm_release.argocd]
  yaml_body  = file("${path.module}/argocd-repo-git.yaml")
}

resource "kubectl_manifest" "argocd_repo_oci" {
  depends_on = [helm_release.argocd]
  yaml_body  = file("${path.module}/argocd-repo-oci.yaml")
}

resource "kubectl_manifest" "argocd_appsets" {
  depends_on = [helm_release.argocd]
  yaml_body = templatefile("${path.module}/argocd-appsets.yaml", {
    appsets_include = var.argocd_appsets_include
  })
}

resource "kubectl_manifest" "argocd_environment_generator" {
  depends_on = [helm_release.argocd]
  yaml_body  = file("${path.module}/argocd-environment-generator.yaml")
}
