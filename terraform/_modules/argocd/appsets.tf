resource "kubectl_manifest" "appsets" {
  depends_on = [helm_release.argocd]
  yaml_body = templatefile("${path.module}/appsets.yaml", {
    repo_url = var.git_repo_url
    include  = var.appsets_include
  })
}
