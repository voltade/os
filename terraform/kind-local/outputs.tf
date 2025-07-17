output "kubeconfig" {
  value = replace(
    kind_cluster.this.kubeconfig,
    "https://0.0.0.0:6443",
    "https://127.0.0.1:6443"
  )
  sensitive = true
}
