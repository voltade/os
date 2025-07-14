resource "random_password" "argocd_instance_generator_token" {
  length  = 64
  special = false
}
