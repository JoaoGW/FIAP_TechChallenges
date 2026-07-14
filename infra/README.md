# Infraestrutura - Terraform + Kind

## O que este Terraform provisiona

| Recurso | Descricao |
|---|---|
| `kind_cluster.oficina` | Cluster Kubernetes local com 1 control-plane e workers configuraveis. |
| `kubernetes_namespace.oficina` | Namespace `oficina` dentro do cluster. |
| `kubernetes_config_map.oficina_config` | ConfigMap com variaveis nao sensiveis da API e do Postgres. |
| `kubernetes_secret.oficina_secrets` | Secret `oficina-secrets`, usado pelos manifests da API e do Postgres. |
| `kubernetes_persistent_volume_claim.postgres` | Volume persistente do PostgreSQL. |
| `kubernetes_deployment.postgres` | Deployment do PostgreSQL no cluster local. |
| `kubernetes_service.postgres` | Service interno `postgres-service` para o banco. |
| `null_resource.export_kubeconfig` | Exporta o kubeconfig para uso local com kubectl. |

## Decisao sobre o banco de dados

O PostgreSQL e provisionado pelo Terraform dentro do cluster Kind local, usando
PVC, Deployment e Service Kubernetes. Os manifests equivalentes continuam em
`../k8s` para uso no pipeline de CD e para atender a entrega de manifestos YAML.

Em um ambiente cloud, o banco seria provisionado pelo Terraform como recurso
gerenciado, por exemplo `aws_db_instance` na AWS ou
`google_sql_database_instance` no GCP.

O Terraform gerencia as credenciais sensiveis via `oficina-secrets`, usando
variaveis `sensitive = true` para senha do banco, JWT, webhook, SMTP e hash da
senha administrativa.

## Pre-requisitos

- Terraform >= 1.5.0.
- Docker instalado e rodando.
- Kind instalado: https://kind.sigs.k8s.io/docs/user/quick-start/.
- kubectl instalado.

## Como instalar o Kind

macOS:

```bash
brew install kind
```

Linux:

```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

Windows:

```powershell
winget install Kubernetes.kind
```

## Como aplicar

1. Inicialize os providers:

```bash
cd infra
terraform init
```

2. Visualize o plano de execucao:

```bash
terraform plan -var="db_password=sua_senha_segura"
```

3. Aplique a infraestrutura:

```bash
terraform apply -var="db_password=sua_senha_segura"
```

4. Confirme com `yes` quando solicitado.

5. Aplique os manifests da API:

```bash
kubectl apply -f ../k8s/deployment-api.yaml
kubectl apply -f ../k8s/service-api.yaml
kubectl apply -f ../k8s/hpa.yaml
```

## Como verificar

```bash
kubectl get nodes
kubectl get namespace oficina
kubectl get configmap oficina-config -n oficina
kubectl get secret oficina-secrets -n oficina
kubectl get service postgres-service -n oficina
kubectl get all -n oficina
```

## Fluxo completo

```bash
cd infra
terraform init
terraform apply -var="db_password=sua_senha_segura"

kubectl get nodes

kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server \
  -n kube-system \
  --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'

cd ..
kubectl wait --for=condition=ready pod -l app=postgres -n oficina --timeout=60s
kubectl apply -f k8s/deployment-api.yaml
kubectl apply -f k8s/service-api.yaml
kubectl apply -f k8s/hpa.yaml

kubectl get all -n oficina
kubectl port-forward service/oficina-api-service 3000:80 -n oficina
```

Swagger: `http://localhost:3000/docs`

## Como destruir

```bash
terraform destroy -var="db_password=sua_senha_segura"
```

Isso remove o cluster Kind e todos os recursos criados nele. Os dados do banco
sao perdidos porque o volume esta no cluster local.

## Variaveis

| Variavel | Descricao | Padrao | Sensivel |
|---|---|---|---|
| `cluster_name` | Nome do cluster Kind. | `oficina-cluster` | Nao |
| `worker_nodes` | Numero de workers. | `2` | Nao |
| `api_port` | Porta local da API. | `3000` | Nao |
| `postgres_port` | Porta local do Postgres. | `5432` | Nao |
| `postgres_user` | Usuario do Postgres. | `oficina_user` | Nao |
| `postgres_db` | Nome do banco. | `oficina_db` | Nao |
| `postgres_image` | Imagem do Postgres. | `postgres:16-alpine` | Nao |
| `postgres_storage` | Tamanho do PVC do Postgres. | `1Gi` | Nao |
| `db_password` | Senha do banco. | - | Sim |
| `jwt_secret` | Segredo JWT da API. | valor local de exemplo | Sim |
| `admin_password_hash` | Hash bcrypt da senha administrativa. | valor local de exemplo | Sim |
| `webhook_secret` | Segredo dos tokens de webhook. | valor local de exemplo | Sim |
| `mail_user` | Usuario SMTP. | `seu@email.com` | Sim |
| `mail_pass` | Senha/token SMTP. | `app-password-aqui` | Sim |
| `namespace` | Namespace Kubernetes. | `oficina` | Nao |

## Outputs

| Output | Descricao |
|---|---|
| `cluster_name` | Nome do cluster criado. |
| `cluster_endpoint` | Endpoint da API Kubernetes. |
| `namespace` | Namespace da aplicacao. |
| `postgres_service` | Service Kubernetes do PostgreSQL. |
| `application_secret` | Secret Kubernetes esperado pelos manifests da API. |
| `kubectl_context` | Contexto kubectl para uso com `kubectl config use-context`. |
| `api_url` | URL de acesso a API. |
| `swagger_url` | URL do Swagger. |
| `proximos_passos` | Comandos para continuar apos o apply. |
