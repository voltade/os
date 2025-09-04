# https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories
# https://argo-cd.readthedocs.io/en/stable/operator-manual/argocd-repositories-yaml/
resource "kubectl_manifest" "repo_git" {
  depends_on = [helm_release.argocd]
  yaml_body = templatefile("${path.module}/repo-git.yaml", {
    repo_url = var.git_repo_url
  })
}
