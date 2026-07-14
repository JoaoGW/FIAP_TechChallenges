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

variable "postgres_user" {
  description = "Usuario do banco PostgreSQL"
  type        = string
  default     = "oficina_user"
}

variable "postgres_db" {
  description = "Nome do banco PostgreSQL"
  type        = string
  default     = "oficina_db"
}

variable "postgres_image" {
  description = "Imagem Docker usada pelo PostgreSQL no cluster"
  type        = string
  default     = "postgres:16-alpine"
}

variable "postgres_storage" {
  description = "Tamanho do volume persistente do PostgreSQL"
  type        = string
  default     = "1Gi"
}

variable "db_password" {
  description = "Senha do banco de dados PostgreSQL - variavel sensivel"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Segredo JWT da API - sobrescreva em ambientes reais"
  type        = string
  sensitive   = true
  default     = "terraform-local-jwt-secret-32-chars-min"
}

variable "jwt_expires_in" {
  description = "Tempo de expiracao do JWT"
  type        = string
  default     = "1d"
}

variable "admin_username" {
  description = "Usuario administrativo inicial"
  type        = string
  default     = "admin"
}

variable "admin_password_hash" {
  description = "Hash bcrypt da senha administrativa"
  type        = string
  sensitive   = true
  default     = "$2b$10$hash_bcrypt_aqui"
}

variable "webhook_secret" {
  description = "Segredo dos tokens de webhook - sobrescreva em ambientes reais"
  type        = string
  sensitive   = true
  default     = "terraform-local-webhook-secret-32-chars"
}

variable "webhook_token_expires_in" {
  description = "Tempo de expiracao dos tokens de webhook"
  type        = string
  default     = "15m"
}

variable "mail_host" {
  description = "Host SMTP"
  type        = string
  default     = "smtp.gmail.com"
}

variable "mail_port" {
  description = "Porta SMTP"
  type        = string
  default     = "587"
}

variable "mail_user" {
  description = "Usuario SMTP"
  type        = string
  sensitive   = true
  default     = "seu@email.com"
}

variable "mail_pass" {
  description = "Senha ou token SMTP"
  type        = string
  sensitive   = true
  default     = "app-password-aqui"
}

variable "mail_from" {
  description = "Remetente dos emails"
  type        = string
  default     = "Oficina Sistema <oficina@sistema.com>"
}

variable "app_url" {
  description = "URL publica/base da aplicacao"
  type        = string
  default     = "http://localhost:3000"
}

variable "namespace" {
  description = "Namespace Kubernetes da aplicacao"
  type        = string
  default     = "oficina"
}
