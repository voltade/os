# https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories
# https://argo-cd.readthedocs.io/en/stable/operator-manual/argocd-repositories-yaml/
resource "kubectl_manifest" "repo_oci" {
  depends_on = [helm_release.argocd]
  yaml_body = templatefile("${path.module}/repo-oci.yaml", {
    repo_url = var.helm_repo_url
  })
}
