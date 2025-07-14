resource "tls_private_key" "ca" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_self_signed_cert" "ca" {
  private_key_pem = tls_private_key.ca.private_key_pem

  subject {
    common_name  = "kind-registry-ca"
    organization = "Kind"
  }

  is_ca_certificate     = true
  validity_period_hours = 131400 // 15 years
  allowed_uses = [
    "cert_signing",
    "key_encipherment",
    "server_auth",
    "client_auth",
  ]
}

resource "tls_private_key" "registry" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_cert_request" "registry" {
  private_key_pem = tls_private_key.registry.private_key_pem

  subject {
    common_name  = "registry"
    organization = "Kind"
  }

  dns_names = [local.registry_host]
}

resource "tls_locally_signed_cert" "registry" {
  cert_request_pem   = tls_cert_request.registry.cert_request_pem
  ca_private_key_pem = tls_private_key.ca.private_key_pem
  ca_cert_pem        = tls_self_signed_cert.ca.cert_pem

  validity_period_hours = 131400 // 15 years
  allowed_uses = [
    "key_encipherment",
    "server_auth",
  ]
}

resource "local_file" "registry_ca_crt" {
  content         = tls_self_signed_cert.ca.cert_pem
  filename        = "${path.root}/certs/ca.crt"
  file_permission = "0644"
}

resource "local_file" "registry_server_key" {
  content         = tls_private_key.registry.private_key_pem
  filename        = "${path.root}/certs/server.key"
  file_permission = "0600"
}

resource "local_file" "registry_server_crt" {
  content         = tls_locally_signed_cert.registry.cert_pem
  filename        = "${path.root}/certs/server.crt"
  file_permission = "0644"
}
