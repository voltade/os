resource "kubectl_manifest" "argocd_http_route" {
  depends_on = [helm_release.argocd]
  yaml_body  = <<-YAML
    apiVersion: gateway.networking.k8s.io/v1
    kind: HTTPRoute
    metadata:
      name: argocd
      namespace: argocd
    spec:
      parentRefs:
        - name: ${kubectl_manifest.cilium_gateway.name}
          namespace: gateway
      hostnames:
        - "argocd.${var.cluster_domain_public}"
      rules:
        - backendRefs:
          - name: argocd-server
            port: 80
          matches:
          - path:
              type: PathPrefix
              value: /
  YAML
}
