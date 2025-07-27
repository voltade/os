resource "tls_private_key" "ca" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_self_signed_cert" "ca" {
  private_key_pem = tls_private_key.ca.private_key_pem

  subject {
    organization = "Voltade"
    common_name  = local.wildcard_hostname
  }

  is_ca_certificate     = true
  validity_period_hours = 131400 // 15 years
  allowed_uses = [
    "cert_signing",
    "key_encipherment",
    "digital_signature"
  ]
}

resource "tls_private_key" "this" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_cert_request" "this" {
  private_key_pem = tls_private_key.this.private_key_pem

  subject {
    organization = "Voltade"
    common_name  = local.wildcard_hostname
  }

  dns_names = [local.wildcard_hostname]
}

resource "tls_locally_signed_cert" "this" {
  cert_request_pem   = tls_cert_request.this.cert_request_pem
  ca_private_key_pem = tls_private_key.ca.private_key_pem
  ca_cert_pem        = tls_self_signed_cert.ca.cert_pem

  validity_period_hours = 131400 // 15 years
  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "server_auth",
    "client_auth"
  ]
}

resource "kubernetes_namespace" "cert_manager" {
  metadata {
    name = "cert-manager"
  }
}

resource "kubernetes_secret" "selfsigned_ca" {
  metadata {
    name      = "selfsigned-ca"
    namespace = kubernetes_namespace.cert_manager.metadata[0].name
  }
  type = "kubernetes.io/tls"
  data = {
    "tls.crt" = tls_self_signed_cert.ca.cert_pem
    "tls.key" = tls_private_key.ca.private_key_pem
  }
}

resource "local_file" "selfsigned_ca" {
  content         = tls_self_signed_cert.ca.cert_pem
  filename        = "${path.root}/certs/ca.crt"
  file_permission = "0644"
}

resource "local_file" "registry_tls_key" {
  content         = tls_private_key.this.private_key_pem
  filename        = "${path.root}/certs/registry.key"
  file_permission = "0600"
}

resource "local_file" "registry_tls_crt" {
  content         = tls_locally_signed_cert.this.cert_pem
  filename        = "${path.root}/certs/registry.crt"
  file_permission = "0644"
}
