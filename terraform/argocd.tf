module "argocd" {
  source = "./_modules/argocd"

  cluster_domain_public = var.cluster_domain_public
  k8s_config            = local.k8s_config

  argocd_helm_version = var.argocd_helm_version
  argocd_helm_values = {
    global = {
      hostAliases = [{
        hostnames = [local.registry_host]
        ip        = local.registry_ip
      }]
    }
    configs = {
      tls = {
        certificates = {
          "${local.registry_host}" = tls_self_signed_cert.ca.cert_pem
        }
      }
      secret = {
        argocdServerAdminPassword = "$2a$10$ekZY6VP1UuhNlhQ8.kCNqe5rn94jO4ivz2vzO1slot1X3sNmZmObe" # admin
      }
    }
    repoServer = {
      env = [
        {
          name  = "SSL_CERT_DIR"
          value = "/mnt/ca-certificates"
        }
      ]
      volumeMounts = [
        {
          name      = "voltade-os"
          mountPath = "/mnt/voltade-os.git"
        },
        {
          name      = "extra-ca"
          mountPath = "/mnt/ca-certificates"
        }
      ]
      volumes = [
        {
          name = "voltade-os"
          hostPath = {
            path = "/mnt/voltade-os.git"
            type = "Directory"
          }
        },
        {
          name = "extra-ca"
          configMap = {
            name = "argocd-tls-certs-cm"
          }
        }
      ]
    }
  }

  git_repo_url    = "file:///mnt/voltade-os.git"
  appsets_include = "dev/*"
  helm_repo_url   = "registry.127.0.0.1.nip.io"

  environment_generator_password = "password"
  environment_generator_base_url = "http://host.docker.internal:3000/api/environment"
}
