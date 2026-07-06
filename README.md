# Sistema Integrado de Oficina - Tech Challenge

## Descrição

Postech FIAP - Tech Challenge 01
Este projeto implementa o MVP do back-end de um Sistema Integrado de Atendimento e Execução de Serviços para uma oficina mecânica.

O sistema permite gerenciar clientes, veículos, serviços, peças e ordens de serviço, além de permitir que clientes acompanhem publicamente o status de uma OS por meio de um código de acompanhamento.

O projeto foi desenvolvido aplicando conceitos de Domain-Driven Design, arquitetura em camadas, autenticação JWT, validação de dados, testes automatizados e containerização com Docker.

## Objetivos do MVP

- Cadastrar e administrar clientes, veículos, serviços e peças.
- Controlar o ciclo completo da Ordem de Serviço.
- Permitir consulta pública do status da OS por código de acompanhamento.
- Proteger rotas administrativas com JWT.
- Disponibilizar documentação Swagger e suíte de testes automatizados.

## Tecnologias utilizadas

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Prisma
- Docker
- Docker Compose
- JWT
- Passport
- Swagger
- Jest
- bcrypt
- Zod

## Arquitetura

O projeto utiliza arquitetura em camadas inspirada em DDD e Clean Architecture.

```txt
src/
 ├── domain/
 │   ├── entities/
 │   ├── value-objects/
 │   ├── enums/
 │   ├── errors/
 │   └── repositories/
 │
 ├── application/
 │   └── use-cases/
 │
 ├── infrastructure/
 │   ├── database/
 │   ├── repositories/
 │   └── mappers/
 │
 ├── interfaces/
 │   ├── controllers/
 │   ├── dtos/
 │   ├── guards/
 │   └── strategies/
 │
 └── modules/
```

### Responsabilidades

- `domain`: regras de negócio puras.
- `application`: orquestração dos casos de uso.
- `infrastructure`: persistência, mapeamento e integração técnica.
- `interfaces`: controllers HTTP, DTOs e segurança de borda.
- `modules`: composição dos módulos NestJS e DI.

## Arquitetura - Fase 2

A aplicacao segue Clean Architecture com ports/adapters para integracoes externas.
A regra de dependencia adotada e:

- `domain/` nao depende de nenhuma camada.
- `application/` depende apenas de `domain/` e de suas proprias `ports/`.
- `infrastructure/` implementa interfaces definidas em `domain/` e `application/ports/`.
- `interfaces/` expoe HTTP, DTOs, guards e strategies, chamando apenas use cases.

Integracoes externas, como email e notificacoes, sao abstraidas por contratos em
`application/ports/output/` e implementadas por adaptadores em
`infrastructure/adapters/`. O `LoginUseCase` e a unica excecao documentada por
usar diretamente `JwtService` e `ConfigService` do NestJS no MVP.

## Modelagem DDD

A entidade central é a `OrdemDeServico` (Aggregate Root), responsável por controlar:

- status da OS;
- serviços adicionados com snapshot de preço;
- peças adicionadas com quantidade e snapshot de preço;
- geração e aprovação de orçamento;
- execução, finalização e entrega.

## State Machine da Ordem de Serviço

```txt
RECEBIDA
   ↓
EM_DIAGNOSTICO
   ↓
AGUARDANDO_APROVACAO
   ↓
EM_EXECUCAO
   ↓
FINALIZADA
   ↓
ENTREGUE
```

Qualquer transição fora do fluxo definido gera erro de domínio.

## Requisitos atendidos

- CRUD administrativo de clientes, veículos, serviços e peças.
- Ajuste manual de estoque.
- Fluxo completo de OS.
- Consulta pública de status sem JWT.
- Relatório administrativo de tempo médio de execução com JWT.
- Testes unitários, de use case e e2e.

## Variáveis de ambiente

Use dois arquivos:

A separacao existe porque o host do banco muda entre os ambientes: local usa localhost, enquanto no Docker Compose a API acessa o servico postgres pela rede interna.

- `.env` para execucao local (`DATABASE_URL` com `localhost`)
- `.env.docker` para Docker Compose (`DATABASE_URL` com host `postgres`)

| Variável              | Descrição                           |
| --------------------- | ----------------------------------- |
| `DATABASE_URL`        | URL de conexão com PostgreSQL       |
| `POSTGRES_USER`       | Usuário do PostgreSQL (Docker)      |
| `POSTGRES_PASSWORD`   | Senha do PostgreSQL (Docker)        |
| `POSTGRES_DB`         | Nome do banco                       |
| `JWT_SECRET`          | Segredo do JWT                      |
| `JWT_EXPIRES_IN`      | Expiração do JWT                    |
| `ADMIN_USERNAME`      | Usuário administrativo              |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt da senha administrativa |

## Como rodar com Docker

1. Copie o arquivo de ambiente Docker:

```bash
cp .env.example .env.docker
```

2. Ajuste os valores no `.env.docker` (principalmente `JWT_SECRET` e `ADMIN_PASSWORD_HASH`).
3. Suba o ambiente:

```bash
docker compose up --build
```

API: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/docs`  
Swagger JSON: `http://localhost:3000/docs-json`

Observação: em versões antigas, use `docker-compose up --build`.

## Migrations

No Docker, as migrations são aplicadas automaticamente no startup da API com:

```txt
npx prisma migrate deploy
```

## Como rodar localmente

1. Instale dependências:

```bash
npm install
```

2. Copie ambiente local:

```bash
cp .env.example .env
```

3. Suba apenas o banco:

```bash
docker compose up postgres -d
```

4. Rode migrations:

```bash
npx prisma migrate deploy
```

5. Gere Prisma Client:

```bash
npx prisma generate
```

6. Execute a API:

```bash
npm run start:dev
```

## Como gerar hash da senha administrativa

Nunca armazene senha em texto puro.

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin12345', 10).then(console.log)"
```

Use o hash gerado no `.env`:

```env
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="hash-gerado-aqui"
```

No login, use a senha original:

```json
{
  "username": "admin",
  "password": "admin12345"
}
```

## Como acessar o Swagger

- Swagger UI: `http://localhost:3000/docs`
- Swagger JSON: `http://localhost:3000/docs-json`

## Fluxo rápido de validação pelo Swagger

1. `POST /auth/login`
2. Copiar `accessToken`
3. `Authorize` com `Bearer <token>`
4. `POST /clientes`
5. `POST /veiculos`
6. `POST /servicos`
7. `POST /pecas`
8. `POST /ordens-servico`
9. `POST /ordens-servico/:id/iniciar-diagnostico`
10. `POST /ordens-servico/:id/servicos`
11. `POST /ordens-servico/:id/pecas`
12. `POST /ordens-servico/:id/gerar-orcamento`
13. `POST /ordens-servico/:id/enviar-orcamento`
14. `POST /ordens-servico/:id/aprovar-orcamento`
15. `POST /ordens-servico/:id/recusar-orcamento`
16. `POST /ordens-servico/:id/iniciar-execucao`
17. `POST /ordens-servico/:id/finalizar`
18. `POST /ordens-servico/:id/entregar`
19. `GET /consulta/os/:codigoAcompanhamento/status`
20. `GET /relatorios/tempo-medio-execucao`

## Rotas principais

### Autenticação

- `POST /auth/login`

### Clientes

- `POST /clientes`
- `GET /clientes`
- `GET /clientes?documento=`
- `GET /clientes/:id`
- `PUT /clientes/:id`
- `DELETE /clientes/:id`

### Veículos

- `POST /veiculos`
- `GET /veiculos`
- `GET /veiculos/:id`
- `GET /veiculos/cliente/:clienteId`
- `PUT /veiculos/:id`
- `DELETE /veiculos/:id`

### Serviços

- `POST /servicos`
- `GET /servicos`
- `GET /servicos/:id`
- `PUT /servicos/:id`
- `DELETE /servicos/:id`

### Peças

- `POST /pecas`
- `GET /pecas`
- `GET /pecas/:id`
- `PUT /pecas/:id`
- `PATCH /pecas/:id/estoque`
- `DELETE /pecas/:id`

### Ordens de Serviço

- `POST /ordens-servico`
- `GET /ordens-servico`
- `GET /ordens-servico/:id`
- `POST /ordens-servico/:id/iniciar-diagnostico`
- `POST /ordens-servico/:id/servicos`
- `POST /ordens-servico/:id/pecas`
- `POST /ordens-servico/:id/gerar-orcamento`
- `POST /ordens-servico/:id/enviar-orcamento`
- `POST /ordens-servico/:id/aprovar-orcamento`
- `POST /ordens-servico/:id/recusar-orcamento`
- `POST /ordens-servico/:id/iniciar-execucao`
- `POST /ordens-servico/:id/finalizar`
- `POST /ordens-servico/:id/entregar`

Observacao Fase 2: `POST /ordens-servico` aceita `servicos[]` e `pecas[]`
opcionais na abertura da OS. A listagem administrativa prioriza OS em execucao,
aguardando aprovacao, diagnostico e recebidas, sempre das mais antigas para as
mais recentes dentro do mesmo status, excluindo OS finalizadas, entregues e
canceladas.

### Consulta pública

- `GET /consulta/os/:codigoAcompanhamento/status`

### Relatórios

- `GET /relatorios/tempo-medio-execucao`

## Testes

Unitários:

```bash
npm run test
```

Cobertura:

```bash
npm run test:cov
```

E2E:

```bash
docker compose -f docker-compose.test.yml up -d
npm run test:e2e
docker compose -f docker-compose.test.yml down
```

Cobertura mínima exigida: 80% (domínios críticos).

## Scan completo com Snyk

1. Gere um token no Snyk (Account Settings -> API Token).
2. Configure o token no `.env`:

```bash
SNYK_TOKEN="seu-token"
```

3. Execute o scan:

```bash
npm run security:snyk
```

Opcional: a variavel exportada no terminal tambem funciona e tem prioridade sobre o `.env`.

Arquivos gerados:

- `reports/security/snyk-report.txt`
- `reports/security/snyk-report.json`

## Segurança

- Rotas administrativas protegidas com JWT.
- `ValidationPipe` global com `whitelist`, `forbidNonWhitelisted` e `transform`.
- Variaveis sensiveis via `.env` (local) e `.env.docker` (compose).
- `ADMIN_PASSWORD_HASH` com bcrypt.
- Rota pública sem JWT com payload mínimo de retorno.

## Relatório de vulnerabilidades

- Arquivo: `docs/relatorio-vulnerabilidades.md`
- Evidências de scan em: `reports/security/`

## Documentação DDD

Link do Miro: https://miro.com/app/board/uXjVHWgzWPY=/?share_link_id=289441836876

Inclui:

- Event Storming
- Linguagem ubíqua
- Entidades e agregados
- Value Objects
- Fluxos de OS e estoque

## Entregáveis

- Código-fonte
- Dockerfile
- docker-compose.yml
- README
- Swagger
- Documentação DDD
- Relatório de vulnerabilidades
- Vídeo demonstrativo

## Grupo e participantes

Nome: João Pedro do Carmo Ribeiro | Discord: joaogw |

## Links importantes

<!-- prettier-ignore-start -->
| Item                          | Link                                                                |
| ----------------------------- | ------------------------------------------------------------------- |
| Repositorio                   | https://github.com/JoaoGW/FIAP_TechChallenges                       |
| Documentacao DDD              | https://miro.com/app/board/uXjVHWgzWPY=/?share_link_id=289441836876 |
| Swagger local (localhost)     | http://localhost:3000/docs                                          |
| Relatorio de vulnerabilidades | docs/relatorio-vulnerabilidades.md                                  |
<!-- prettier-ignore-end -->
