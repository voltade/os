/**
https://docs.cilium.io/en/stable/network/servicemesh/gateway-api/gateway-api/#prerequisites
> The below CRDs from Gateway API must be pre-installed:
> GatewayClass
> Gateway
> HTTPRoute
> GRPCRoute
> ReferenceGrant
> TLSRoute (experimental)
https://gateway-api.sigs.k8s.io/guides/#install-experimental-channel
Experimental channel is required as Cilium requires GRPCRoute, TLSRoute to be available.
*/
data "http" "gateway_api" {
  url = "https://github.com/kubernetes-sigs/gateway-api/releases/download/${var.gateway_api_version}/experimental-install.yaml"
}

data "kubectl_file_documents" "gateway_api" {
  content = data.http.gateway_api.response_body
}

resource "kubectl_manifest" "gateway_api" {
  count     = length(data.kubectl_file_documents.gateway_api.documents)
  yaml_body = element(data.kubectl_file_documents.gateway_api.documents, count.index)
}

resource "kubernetes_namespace" "gateway" {
  metadata {
    name = "gateway"
  }
}

resource "kubectl_manifest" "gateway" {
  depends_on = [kubectl_manifest.gateway_api, helm_release.cilium]
  yaml_body  = <<-YAML
    apiVersion: gateway.networking.k8s.io/v1
    kind: Gateway
    metadata:
      name: http
      namespace: ${kubernetes_namespace.gateway.metadata[0].name}
    spec:
      gatewayClassName: cilium
      listeners:
        - name: http-wildcard
          protocol: HTTP
          port: 80
          hostname: "*.${var.cluster_domain_public}"
          allowedRoutes:
            namespaces:
              from: All
  YAML
}
