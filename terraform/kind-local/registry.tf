data "docker_network" "kind" {
  name = "kind"
}

resource "docker_image" "registry" {
  name = "registry:3"
}

resource "docker_container" "registry" {
  name  = "registry"
  image = docker_image.registry.image_id

  ports {
    internal = 443
    external = 443
  }

  volumes {
    host_path      = abspath("${path.root}/certs")
    container_path = "/certs"
    read_only      = true
  }

  env = [
    "REGISTRY_HTTP_ADDR=0.0.0.0:443",
    "REGISTRY_HTTP_TLS_CERTIFICATE=/certs/server.crt",
    "REGISTRY_HTTP_TLS_KEY=/certs/server.key"
  ]

  networks_advanced {
    name         = data.docker_network.kind.name
    ipv4_address = local.registry_ip
  }

  restart = "always"
}
