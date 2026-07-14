output "cluster_name" {
  description = "Nome do cluster Kubernetes criado"
  value       = kind_cluster.oficina.name
}

output "cluster_endpoint" {
  description = "Endpoint da API do cluster Kubernetes"
  value       = kind_cluster.oficina.endpoint
}

output "namespace" {
  description = "Namespace Kubernetes da aplicacao"
  value       = kubernetes_namespace.oficina.metadata[0].name
}

output "postgres_service" {
  description = "Service Kubernetes do PostgreSQL provisionado pelo Terraform"
  value       = kubernetes_service.postgres.metadata[0].name
}

output "application_secret" {
  description = "Secret Kubernetes esperado pelos manifests da API"
  value       = kubernetes_secret.oficina_secrets.metadata[0].name
}

output "kubectl_context" {
  description = "Contexto kubectl configurado - usar com: kubectl config use-context <valor>"
  value       = "kind-${kind_cluster.oficina.name}"
}

output "api_url" {
  description = "URL de acesso a API via port-forward"
  value       = "http://localhost:${var.api_port}"
}

output "swagger_url" {
  description = "URL do Swagger apos port-forward"
  value       = "http://localhost:${var.api_port}/docs"
}

output "proximos_passos" {
  description = "Comandos para aplicar a API apos o terraform apply"
  value       = <<-EOT
    1. Aplique os manifests da API:
       kubectl apply -f ../k8s/deployment-api.yaml
       kubectl apply -f ../k8s/service-api.yaml
       kubectl apply -f ../k8s/hpa.yaml

    2. Aguarde os pods subirem:
       kubectl get pods -n ${kubernetes_namespace.oficina.metadata[0].name} -w

    3. Acesse a API:
       kubectl port-forward service/oficina-api-service ${var.api_port}:80 -n ${kubernetes_namespace.oficina.metadata[0].name}
  EOT
}
