provider "kind" {}

resource "kind_cluster" "oficina" {
  name = var.cluster_name

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      extra_port_mappings {
        container_port = 80
        host_port      = var.api_port
        protocol       = "TCP"
      }
    }

    dynamic "node" {
      for_each = range(var.worker_nodes)

      content {
        role = "worker"
      }
    }
  }

  wait_for_ready = true
}

provider "kubernetes" {
  host                   = kind_cluster.oficina.endpoint
  cluster_ca_certificate = base64decode(kind_cluster.oficina.cluster_ca_certificate)
  client_certificate     = base64decode(kind_cluster.oficina.client_certificate)
  client_key             = base64decode(kind_cluster.oficina.client_key)
}

resource "kubernetes_namespace" "oficina" {
  metadata {
    name = var.namespace
  }

  depends_on = [kind_cluster.oficina]
}

# PostgreSQL is deployed by the Kubernetes manifests in ../k8s.
# Terraform manages a sensitive database credential secret for the local Kind
# environment; in a cloud environment this would become a managed database.
resource "kubernetes_secret" "db_credentials" {
  metadata {
    name      = "db-credentials"
    namespace = kubernetes_namespace.oficina.metadata[0].name
  }

  data = {
    POSTGRES_PASSWORD = var.db_password
    DATABASE_URL      = "postgresql://oficina_user:${var.db_password}@postgres-service:5432/oficina_db"
  }

  type       = "Opaque"
  depends_on = [kubernetes_namespace.oficina]
}

resource "null_resource" "export_kubeconfig" {
  provisioner "local-exec" {
    command = "kind export kubeconfig --name ${var.cluster_name}"
  }

  triggers = {
    cluster_id = kind_cluster.oficina.id
  }

  depends_on = [kind_cluster.oficina]
}
