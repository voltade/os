output "kubeconfig" {
  value     = kind_cluster.this.kubeconfig
  sensitive = true
}
