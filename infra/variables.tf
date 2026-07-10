variable "cluster_name" {
  description = "Nome do cluster Kubernetes local (Kind)"
  type        = string
  default     = "oficina-cluster"
}

variable "worker_nodes" {
  description = "Numero de worker nodes no cluster"
  type        = number
  default     = 2
}

variable "api_port" {
  description = "Porta local exposta para o service da API"
  type        = number
  default     = 3000
}

variable "postgres_port" {
  description = "Porta local exposta para o Postgres (acesso externo ao cluster)"
  type        = number
  default     = 5432
}

variable "db_password" {
  description = "Senha do banco de dados PostgreSQL - variavel sensivel"
  type        = string
  sensitive   = true
}

variable "namespace" {
  description = "Namespace Kubernetes da aplicacao"
  type        = string
  default     = "oficina"
}
