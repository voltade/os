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
          ip        = var.registry_ip
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

resource "kubernetes_secret" "argocd_extra_secret" {
  depends_on = [helm_release.argocd]
  metadata {
    name      = "argocd-extra-secret"
    namespace = "argocd"
  }
  data = {
    "instances-generator.token" = random_password.argocd_instance_generator_token.result
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

resource "kubectl_manifest" "argocd_instance_generator_plugin" {
  depends_on = [helm_release.argocd]
  yaml_body  = file("${path.module}/argocd-instance-generator-plugin.yaml")
}
