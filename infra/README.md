# Infraestrutura - Terraform + Kind

## O que este Terraform provisiona

| Recurso | Descricao |
|---|---|
| `kind_cluster.oficina` | Cluster Kubernetes local com 1 control-plane e workers configuraveis |
| `kubernetes_namespace.oficina` | Namespace `oficina` dentro do cluster |
| `kubernetes_secret.db_credentials` | Secret com senha do banco e `DATABASE_URL` |
| `null_resource.export_kubeconfig` | Exporta o kubeconfig para uso local com kubectl |

## Decisao sobre o banco de dados

O PostgreSQL e provisionado via manifestos Kubernetes em `../k8s`
(`deployment-postgres.yaml`, `service-postgres.yaml` e `pvc-postgres.yaml`),
nao via Terraform diretamente. Essa decisao foi tomada porque o ambiente e
local com Kind e nao ha banco gerenciado externo.

Em um ambiente cloud, o banco seria provisionado pelo Terraform como recurso
gerenciado, por exemplo `aws_db_instance` na AWS ou
`google_sql_database_instance` no GCP.

O Terraform gerencia credenciais sensiveis do banco via
`kubernetes_secret.db_credentials`, injetando `db_password` como variavel
sensivel (`sensitive = true`) sem expor a senha em texto puro nos outputs.

## Pre-requisitos

- Terraform >= 1.5.0
- Docker instalado e rodando
- Kind instalado: https://kind.sigs.k8s.io/docs/user/quick-start/
- kubectl instalado

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

5. Aplique os manifestos Kubernetes:

```bash
kubectl apply -f ../k8s/
```

## Como verificar

```bash
kubectl get nodes
kubectl get namespace oficina
kubectl get secret db-credentials -n oficina
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
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/pvc-postgres.yaml
kubectl apply -f k8s/deployment-postgres.yaml
kubectl apply -f k8s/service-postgres.yaml
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
| `cluster_name` | Nome do cluster Kind | `oficina-cluster` | Nao |
| `worker_nodes` | Numero de workers | `2` | Nao |
| `api_port` | Porta local da API | `3000` | Nao |
| `postgres_port` | Porta local do Postgres | `5432` | Nao |
| `db_password` | Senha do banco | - | Sim |
| `namespace` | Namespace Kubernetes | `oficina` | Nao |

## Outputs

| Output | Descricao |
|---|---|
| `cluster_name` | Nome do cluster criado |
| `cluster_endpoint` | Endpoint da API Kubernetes |
| `namespace` | Namespace da aplicacao |
| `kubectl_context` | Contexto kubectl para uso com `kubectl config use-context` |
| `api_url` | URL de acesso a API |
| `swagger_url` | URL do Swagger |
| `proximos_passos` | Comandos para continuar apos o apply |
