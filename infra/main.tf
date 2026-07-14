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

resource "kubernetes_config_map" "oficina_config" {
  metadata {
    name      = "oficina-config"
    namespace = kubernetes_namespace.oficina.metadata[0].name
  }

  data = {
    NODE_ENV                 = "production"
    PORT                     = "3000"
    POSTGRES_DB              = var.postgres_db
    MAIL_HOST                = var.mail_host
    MAIL_PORT                = var.mail_port
    MAIL_FROM                = var.mail_from
    APP_URL                  = var.app_url
    JWT_EXPIRES_IN           = var.jwt_expires_in
    WEBHOOK_TOKEN_EXPIRES_IN = var.webhook_token_expires_in
  }

  depends_on = [kubernetes_namespace.oficina]
}

resource "kubernetes_secret" "oficina_secrets" {
  metadata {
    name      = "oficina-secrets"
    namespace = kubernetes_namespace.oficina.metadata[0].name
  }

  data = {
    DATABASE_URL        = "postgresql://${var.postgres_user}:${var.db_password}@postgres-service:5432/${var.postgres_db}"
    POSTGRES_USER       = var.postgres_user
    POSTGRES_PASSWORD   = var.db_password
    JWT_SECRET          = var.jwt_secret
    ADMIN_USERNAME      = var.admin_username
    ADMIN_PASSWORD_HASH = var.admin_password_hash
    WEBHOOK_SECRET      = var.webhook_secret
    MAIL_USER           = var.mail_user
    MAIL_PASS           = var.mail_pass
  }

  type       = "Opaque"
  depends_on = [kubernetes_namespace.oficina]
}

resource "kubernetes_persistent_volume_claim" "postgres" {
  metadata {
    name      = "postgres-pvc"
    namespace = kubernetes_namespace.oficina.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = var.postgres_storage
      }
    }
  }
}

resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.oficina.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "postgres"
      }
    }

    template {
      metadata {
        labels = {
          app = "postgres"
        }
      }

      spec {
        container {
          name  = "postgres"
          image = var.postgres_image

          port {
            container_port = 5432
          }

          env {
            name = "POSTGRES_DB"

            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.oficina_config.metadata[0].name
                key  = "POSTGRES_DB"
              }
            }
          }

          env {
            name = "POSTGRES_USER"

            value_from {
              secret_key_ref {
                name = kubernetes_secret.oficina_secrets.metadata[0].name
                key  = "POSTGRES_USER"
              }
            }
          }

          env {
            name = "POSTGRES_PASSWORD"

            value_from {
              secret_key_ref {
                name = kubernetes_secret.oficina_secrets.metadata[0].name
                key  = "POSTGRES_PASSWORD"
              }
            }
          }

          volume_mount {
            name       = "postgres-storage"
            mount_path = "/var/lib/postgresql/data"
            sub_path   = "postgres"
          }

          readiness_probe {
            exec {
              command = ["sh", "-c", "pg_isready -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\""]
            }

            initial_delay_seconds = 5
            period_seconds        = 5
            failure_threshold     = 5
          }
        }

        volume {
          name = "postgres-storage"

          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postgres.metadata[0].name
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_config_map.oficina_config,
    kubernetes_secret.oficina_secrets,
    kubernetes_persistent_volume_claim.postgres,
  ]
}

resource "kubernetes_service" "postgres" {
  metadata {
    name      = "postgres-service"
    namespace = kubernetes_namespace.oficina.metadata[0].name
  }

  spec {
    selector = {
      app = "postgres"
    }

    port {
      port        = 5432
      target_port = 5432
    }

    type = "ClusterIP"
  }
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
