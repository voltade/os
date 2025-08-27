resource "proxmox_virtual_environment_file" "talos" {
  for_each     = toset(var.proxmox_node_names)
  content_type = "iso"
  datastore_id = "local"
  node_name    = each.value
  overwrite    = false

  source_file {
    path      = data.talos_image_factory_urls.this.urls.iso
    file_name = "talos-${var.talos_version}-amd64.iso"
  }
}

resource "proxmox_virtual_environment_file" "talos_user_data" {
  for_each     = { for node in local.all_nodes_with_proxmox_host : node.name => node }
  content_type = "snippets"
  datastore_id = "local"
  node_name    = each.value.proxmox_node
  source_raw {
    data      = each.value.role == "control-plane" ? data.talos_machine_configuration.control_plane[each.value.name].machine_configuration : data.talos_machine_configuration.worker[each.value.name].machine_configuration
    file_name = "talos-user-data-${each.value.name}.yaml"
  }
}

resource "proxmox_virtual_environment_vm" "this" {
  for_each        = { for node in local.all_nodes_with_proxmox_host : node.name => node }
  name            = each.key
  tags            = [each.value.role]
  node_name       = each.value.proxmox_node
  stop_on_destroy = true
  bios            = "ovmf"
  machine         = "q35"

  cpu {
    type  = "host"
    cores = 3
  }

  memory {
    dedicated = 4096
  }

  agent {
    enabled = true
    trim    = true
  }

  network_device {
    bridge = "vmbr0"
    # vlan_id = 50
  }

  cdrom {
    file_id = proxmox_virtual_environment_file.talos[each.value.proxmox_node].id
  }

  operating_system {
    type = "l26"
  }

  efi_disk {
    datastore_id = "local-lvm"
    file_format  = "raw"
    type         = "4m"
  }

  disk {
    datastore_id = "local-lvm"
    interface    = "virtio0"
    iothread     = true
    ssd          = true
    discard      = "on"
    size         = 40
    file_format  = "raw"
  }

  initialization {
    user_data_file_id = proxmox_virtual_environment_file.talos_user_data[each.key].id
  }
}
