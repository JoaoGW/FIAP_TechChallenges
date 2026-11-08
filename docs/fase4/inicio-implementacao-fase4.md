# Início da implementação - Fase 4

Versão de partida da revisão de 30/10/2026. Este roteiro complementa o [plano completo](./plano-implementacao-fase-4.md); define o primeiro incremento e não amplia os requisitos do PDF.

## 1. Decisões fechadas para começar

| Tema | Decisão inicial |
|---|---|
| Serviços | OS em `soat-api`; novos `soat-billing-service` e `soat-execution-service` |
| Runtime | NestJS/TypeScript/Jest reaproveitados; Node 24 para os containers após o build de compatibilidade; Function atualizada separadamente conforme suporte |
| Dados | `os_hml` e `billing_hml` no PostgreSQL HML existente; Cosmos DB for NoSQL `execution_hml` |
| Recursos Kubernetes | Namespace `hml` atual; Deployments/Services/ServiceAccounts novos `soat-os-service`, `soat-billing-service`, `soat-execution-service`; uma réplica inicial |
| Processamento | API e loops de mensagens/outbox/timers no mesmo processo por serviço; estado durável em banco |
| Mensageria | Service Bus Standard; duas command queues, topic e subscription OS; sem sessions/deduplicação do broker obrigatórias |
| Saga | Orquestrada no OS; pagamento antes do reparo; conclusão em FINALIZADA; entrega posterior no OS |
| Auth existente | Cliente mantém issuer `soat-auth-function`, audience lógico `soat-api`, role cliente e sub; admin separado |
| Auth Function -> OS | HTTPS do Kong, rota de integração com bearer exclusivo de pelo menos 32 bytes guardado no Key Vault; sem SQL compartilhado |
| Ambiente de aceite | HML; não criar PROD nem migrar namespaces para concluir a fase |
| Documentação de contratos | OpenAPI ou collection por serviço e JSON Schemas para mensagens; AsyncAPI formal é opcional |
| Legado | Não apagar dados/state. Novo OS tem Deployment/Service distinto; a rota pública só muda após o aceite |

## 2. Bases corretas e primeiro trabalho

A pasta atual `FIAP_TechChallenges` contém o plano e uma cópia antiga da aplicação. Os PRs de código devem ser feitos nos repositórios abaixo, não nessa cópia por conveniência.

| Repo | Base conferida em 30/10/2026 | Primeira branch sugerida |
|---|---|---|
| `soat-api` | development `4eb05bcc7adb45ed794d5ae5707fca102a70f255` | `codex/fase4-os` |
| `soat-auth-function` | development `4f3df7143e046967e27bd5baf57677fec5f22141` | `codex/fase4-auth-http` |
| `soat-postgres-infra` | development `6fb8d0b6c9de495fe93d1e5c053445b9085426ce` | `codex/fase4-bancos-servicos` |
| `soat-aks-infra` | main `8266fe617a9f2770f28f0a0436abb8c07202daf1` | `codex/fase4-plataforma` |
| Billing / Execution | Repos a criar com main/development e proteção | `codex/fase4-bootstrap` |

Exemplo para obter o OS sem alterar a cópia local antiga:

```bash
git clone https://github.com/JoaoGW/soat-api.git soat-api-fase4
cd soat-api-fase4
git switch -c codex/fase4-os 4eb05bcc7adb45ed794d5ae5707fca102a70f255
git status --short
```

Se houver commits posteriores, comparar antes de fixar uma base nova. Revisar AGENTS.md se houver no checkout e manter alterações locais existentes. Não fazer merge automático das branches antigas chamadas `fase4`.

## 3. Primeiros PRs e suas evidências

Os blocos podem avançar em paralelo no grupo. A falta de uma credencial externa não impede os PRs de schema/domínio/testes que não a utilizam.

| PR / tarefas do plano | Alterações concretas | Critério de pronto |
|---|---|---|
| **A - Base e contratos** / T01,T02,T04 | Criar os dois repos; configurar CI e proteção; registrar decisões de domínio/Saga; criar `docs/contracts/messages/` e exemplos de payload; revisar a promoção de main sem apply PROD | Três repos com build/lint/teste; contratos definidos e PR/checks exigidos; nenhuma credencial real em Git |
| **B - Infra mínima e spikes** / T03,T05,T06,T17 | Em AKS: recursos Service Bus, subjects OIDC/identidades dos novos workloads, containers de state por serviço e HTTPS HML. Em PostgreSQL: módulo só de banco, output server_id, bootstrap privado de papéis. Em Execution: prova Cosmos batch+ETag. Em Billing: prova real MP teste | Uma mensagem entregue; uma reserva atômica/concorrente; order de teste criada/consultada; custos e acessos conhecidos antes do apply definitivo |
| **C - Esqueletos de aplicação** / T08-T11,T21,T24 | Criar módulos Nest de cada dono, health, Dockerfiles, overlays HML, `.env.example`, testes e Sonar. Manter os novos Services sem rota pública de negócio | Uma imagem/Deployment por serviço; health privado; CI bloqueia falha de teste/quality gate; monólito ainda atende as rotas antigas |
| **D - Persistência e transporte** / T05,T06,T12 | Migrations novas OS/Billing; adapter Cosmos; inbox/outbox/operation record; SDK Service Bus e shutdown; claims/CAS | Falha entre commit/publicação e reentrega não duplica efeito; loop retoma após reinício |
| **E - Primeira jornada** / T13-T15 | Abertura -> diagnóstico -> orçamento -> aprovação/recusa; snapshots e status locais; cancelamento durável em Execution | Happy path e recusa com compensação testados, sem leitura de banco cruzada |
| **F - Financeiro e conclusão** / T16-T20 | Reserva, Orders API, webhook/reconciliação, fila/reparo e cancelamento/reembolso | Pagamento libera a fila uma vez; falha pós-pagamento cancela trabalho, reembolsa e libera reserva de forma confirmada |
| **G - Aceite e troca de tráfego** / T22-T30 | BDD, casos de resiliência, relatórios/CRUD/autorizações, tracing, corte das rotas HML, READMEs/vídeo/PDF | Combinação exata das três imagens aprovada, antes do cutover final e da gravação |

O spike de HTTPS também atende à Function: ela está fora do cluster e não pode usar `soat-os-service.hml.svc.cluster.local` diretamente. A rota `/internal/clientes/validar-cpf` no Kong exige credencial exclusiva de integração, rejeita JWT cliente/admin e nunca retorna uma lista de clientes. Não criar um novo balanceador privado para resolver isso no MVP.

## 4. Arquivos e código a reaproveitar

| Dono | Origem / mudança |
|---|---|
| OS | Manter entidades Cliente/Veiculo, seus casos de uso/controllers/repositories e autenticação administrativa. Reduzir `OrdemDeServico` ao seu ciclo/projeções. Adaptar `CriarOrdemDeServicoUseCase`, `PrismaOrdemDeServicoRepository`, `app.module.ts`, `repository.module.ts` e guards; adicionar Saga/outbox/inbox |
| OS | Preservar `ObterTempoMedioExecucaoUseCase`, `RelatorioController`, listagem operacional/paginação e trigger append-only, usando eventos/datas locais |
| Billing | Extrair geração/aprovação/recusa/envio de orçamento, `EmailAdapter` e valores monetários úteis; reescrever repositories para o banco próprio; adicionar agregados financeiros, adapter MP, webhook e reconciliador |
| Execution | Extrair Peca/Servico, casos de uso de estoque/catálogo e regras de execução; trocar repositories Prisma por adapter Cosmos. `IniciarExecucaoUseCase` passa a consumir reserva atomicamente depois da autorização da Saga |
| Auth | Substituir `PostgresClienteAuthRepository` por `HttpClienteAuthRepository`; alterar configuração/composição em `src/index.ts`, retirar pool `pg` e DATABASE_URL, adicionar testes de HTTP/erros/credencial |
| Plataforma | Aproveitar `foundation`, namespace HML, Key Vault/CSI, Kong, deploy por SHA e New Relic. Criar recursos novos por nome, sem transferir o ownership dos antigos |

Não copiar `app.module.ts`, `node_modules`, relatórios antigos ou todo o Prisma do monólito para os repos novos. Copiar somente código/testes do domínio que migra, com imports e dependências revistos.

No OS, criar `deploy/fase4/kustomize/base` e `deploy/fase4/kustomize/overlays/hml`, preservando `deploy/kustomize` legado. O script novo `scripts/deploy-fase4.sh` aplica `soat-os-service`/`soat-os-migrate`, com secret `os-runtime-hml`; não espera o rollout de `soat-api`. Billing e Execution usam `deploy/kustomize`, com secrets `billing-runtime-hml` e `execution-runtime-hml`. Os scripts/Jobs devem receber nomes/paths explicitamente, sem copiar os literais antigos de `deploy-api.sh`.

Dependências novas a instalar com versões estáveis compatíveis e lockfile: `@azure/service-bus` e `@azure/identity` nos três serviços; `@azure/cosmos` somente em Execution; Prisma somente nos dois SQL; Cucumber somente no repo que hospeda o BDD. O adapter MP pode usar HTTP do runtime; SDK extra só se trouxer função necessária. Não aproveitar esta fase para atualizar todas as bibliotecas sem relação com a mudança.

### 4.1 Schemas e restrições iniciais

- **OS:** `prisma/os/schema.prisma` e `prisma/os/migrations`; Cliente/Veiculo/OS/HistoricoStatusOS, SagaInstance/SagaOperation, Inbox/Outbox/IdempotencyRequest. Preservar IDs e dinheiro em centavos. `OS.id`, `codigoAcompanhamento` e `Saga.osId` únicos; versão otimista da OS/Saga.
- **Billing:** `prisma/schema.prisma` próprio; Orcamento/Item/Decisao, Cobranca/Tentativa/Pagamento/Reembolso, WebhookRecebido, Inbox/Outbox/IdempotencyRequest. Unicidade de `(osId, versao)`, referência externa, IDs do provedor e chave de operação. Um orçamento não admite duas decisões conflitantes; usar CAS no estado/versão.
- **Execution:** banco `execution_hml`, container operacional `operations`, partition key `/filialId`. IDs documentais com tipo, por exemplo `stock:<pecaId>`, `execution:<osId>`, `reservation:<osId>`, `inbox:<messageId>`, `outbox:<messageId>`. Todos os documentos de um batch têm a mesma filial.
- **Inbox:** chave por consumidor+messageId e status recebido/aplicado/pendente. Um fato relevante fora de ordem é guardado e reavaliado, não simplesmente ignorado após marcar a inbox.
- **Outbox:** messageId/type/payload/createdAt, status, attemptCount, nextAttemptAt e claimUntil. A publicação usa o mesmo messageId em retry.
- **SagaOperation:** operationId único por Saga+etapa+tentativa de negócio, comando, estado, resultado e compensação. Retry técnico não cria nova operação financeira.
- **Cancelamento Execution:** registro persistente por sagaId/osId, mesmo sem execução criada, impedindo Enqueue/Start atrasado.

Não executar o histórico de migrations do monólito nos bancos novos. Os comandos OS devem selecionar explicitamente `prisma/os/schema.prisma`; o Job SQL monta sua credencial de migration como DATABASE_URL. Runtime monta a sua credencial restrita, também como DATABASE_URL, em outro workload/contexto.

### 4.2 Scripts do primeiro incremento

Padronizar nos três repos:

```text
npm ci
npm run lint
npm run build
npm run test:unit
npm run test:cov
```

Criar aliases para scripts Jest existentes quando necessário, sem reescrever testes só para trocar nomes. Nos serviços SQL, adicionar scripts `db:generate` e `db:migrate:deploy` apontando ao schema do próprio serviço. Em Execution, `db:validate` verifica documentos/índices e o smoke do adapter no ambiente selecionado.

`test:unit`/contratos rodam sem Azure/Mercado Pago. `test:integration` exige seu banco/alvo configurado e falha se a execução foi solicitada sem configuração; não deve produzir resultado verde por pular testes silenciosamente. Em OS, adicionar `test:distributed` com Cucumber e manifesto de integração fixando as três versões.

## 5. Contratos mínimos que devem sair no PR A

Um JSON Schema por comando/evento, com exemplos válidos e testes do produtor/consumidor. Não usar o mesmo schema Prisma como contrato.

| Mensagem / API | Conteúdo de negócio mínimo |
|---|---|
| Abertura da OS | clienteId, veiculoId, filialId e chave idempotente; actor validado pelo guard |
| RequestDiagnosis | osId, sagaId, filialId, veiculoId e solicitações técnicas iniciais, se fornecidas |
| DiagnosisCompleted | osId, diagnóstico/versão, startedAt/completedAt, itens com IDs/quantidades/preços de referência em centavos; catálogo consultado pelo Execution |
| GenerateQuote | osId, sagaId, filialId, clienteId, contato mínimo de envio, diagnosisId/versão, itens e expiresAt; conteúdo fixado pelo OS a partir de dados confiáveis |
| QuoteIssued | quoteId, versão, osId, clienteId, totalInCents, currency BRL e expiresAt |
| Aprovar/recusar | quoteId e versão, sujeito cliente extraído do JWT, chave idempotente; a versão/cliente não vêm apenas de um corpo confiado |
| ReserveParts / PartsReserved | quoteId/versão, itens agregados por SKU, reservationId e deadline; máximo de 20 SKUs distintos inicialmente |
| CreateCharge / ChargeCreated | quoteId/versão, total/BRL, cliente/filial, chargeId, providerOrderId/providerPaymentId quando conhecidos, referência externa e vencimento |
| PaymentConfirmed | chargeId, quoteId/versão, IDs canônicos, valor/BRL e paidAt; emitido somente por Billing após verificação |
| EnqueueWork / WorkStarted / WorkCompleted | osId/sagaId/filialId, reservationId, operação de autorização; Execution inclui startedAt/completedAt para relatório |
| CancelWork / ReleaseParts / RefundPayment | operação alvo, motivo e operationId de compensação; resposta explicita concluído, já aplicado, em andamento, irreversível ou falha |

Envelope comum do plano: messageId, type/schemaVersion, produtor, agregado/versão **local**, osId/sagaId/filialId, operationId/causationId/correlationId e contexto de trace. Não comparar uma versão de Pagamento com uma versão de Execução como se fossem um contador global.

### 5.1 Condições fechadas do primeiro fluxo

1. Aprovação somente da versão vigente; recusa/aprovação são mutuamente exclusivas. Repetição da mesma decisão/versão é idempotente; decisão oposta retorna conflito.
2. Indisponibilidade definitiva de estoque cancela a jornada sem cobrar. Não implementar replanejamento automático ou múltiplos ciclos de orçamento no MVP.
3. Reserva não reduz o estoque físico duas vezes: disponível = saldo - reservado; iniciar reparo consome uma única vez; liberar reserva não repõe peça já consumida.
4. Deadline de reserva gera verificação; nenhum TTL/cron libera estoque sozinho quando o financeiro é incerto.
5. PaymentConfirmed recebido antes de ChargeCreated fica pendente e é reavaliado quando a cobrança é associada.
6. Cancelar antes de Enqueue cria impedimento durável. Antes de refund/liberação automática por falha de fila, confirmar que o trabalho não começou.
7. Timeout da criação de cobrança não cria uma segunda chave. Se não houver order ID recuperável, manter reconciliação necessária e impedir nova cobrança automática.
8. Falha após reparo físico registra incidente e impede entrega automática; não existe rollback físico por apagar dados.

## 6. Configuração de execução e permissões

Valores reais serão lidos/configurados durante a implementação; os nomes abaixo são contratos de configuração propostos. Arquivos `.env.example` só contêm placeholders. Secrets ficam no Key Vault e os relatórios de CI não os imprimem.

| Configuração | Consumidores / origem |
|---|---|
| `DATABASE_URL` | OS/Billing: credencial runtime do próprio banco; Job de migration recebe credencial diferente para o mesmo banco |
| `COSMOS_ENDPOINT`, `COSMOS_DATABASE=execution_hml`, `COSMOS_CONTAINER=operations` | Execution; autenticação com Workload Identity e role de dados restrita, sem chave mestre distribuída |
| `SERVICE_BUS_NAMESPACE` | Os três; FQDN Azure não sigiloso |
| `SERVICE_BUS_COMMAND_QUEUE` | Billing=`billing.commands`; Execution=`execution.commands`; OS não precisa de command queue |
| `SERVICE_BUS_EVENT_TOPIC=soat.domain.events`, `SERVICE_BUS_EVENT_SUBSCRIPTION=os.saga-events` | Topic nos três; subscription somente OS |
| `JWT_SECRET`, configuração administrativa herdada | OS emite login administrativo; validadores autorizados dos serviços recebem o material necessário, separado do cliente |
| `JWT_CLIENT_SECRET`, `JWT_CLIENT_ISSUER=soat-auth-function`, `JWT_CLIENT_AUDIENCE=soat-api` | Function emite; OS/Billing/Execution verificam JWT cliente e vínculo com o recurso |
| `OS_INTERNAL_BASE_URL`, `INTERNAL_CLIENT_LOOKUP_TOKEN` | Function aponta ao HTTPS HML do Kong; token exclusivo também no OS, nunca aceito como login de cliente/admin |
| `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET` | Apenas Billing; valores de teste, distintos do token de aprovação de orçamento |
| `MERCADO_PAGO_BASE_URL=https://api.mercadopago.com`, mapeamento filial->POS | Billing; URL normal fixa; substituição por stub somente no perfil de integração protegido |
| Configuração SMTP herdada e URL dos links | Apenas Billing; reutilizar EmailAdapter, sem novo serviço de notificação |
| `OTEL_SERVICE_NAME`, `OTEL_SERVICE_VERSION`, `OBSERVABILITY_ENABLED`, `NEW_RELIC_LICENSE_KEY` | Nomes distintos por serviço, SHA de imagem e segredo New Relic existente |
| `QUOTE_APPROVAL_TTL_HOURS=24`, `CHARGE_EXPIRATION=PT15M`, `RESERVATION_REVIEW_MINUTES=20` | Defaults da Saga/Billing/Execution; enviar deadlines absolutos em UTC nos contratos |
| `SAGA_STEP_CHECK_SECONDS=60`, `MAX_TRANSIENT_ATTEMPTS=5` | Configuração técnica inicial; timeout marca verificação/reconciliação, não presume falha financeira definitiva |
| `DEFAULT_FILIAL_ID` / filiais de fixture | Contexto de demonstração; não representa um módulo novo de gestão de filiais |

Bootstrap de plataforma:

- GitHub Environment HML por repo com tenant/subscription/client ID OIDC e trava de apply; identidade de CI separada de runtime.
- Backend remoto de state por serviço, com container/ACL próprios na Storage existente e chave HML; os state antigos permanecem onde estão.
- ID do servidor SQL existente e módulo de criação apenas de banco fixado em commit; scopes necessários ao deploy sem expor state/segredos de outros serviços ao runtime.
- ServiceAccounts e subjects federados novos dos três Deployments; secrets separados por nome/escopo, inclusive tokens de integração compartilhados apenas entre os validadores necessários.
- Sonar: projeto por serviço, `SONAR_PROJECT_KEY`, URL/organização conforme a instalação escolhida e token de CI. Não marcar o Quality Gate como atendido enquanto essa integração não existir.
- HTTPS HML/Kong, callback MP, aplicação/contas/loja/caixa de teste e configuração de notificações. Não usar uma conta de pagamento real como atalho de demonstração.

## 7. Testes distribuídos reproduzíveis

Manter `test/distributed/manifest.example.json` no OS, com três image digests/SHAs, URLs de teste, filial/dataset e modo do provedor. Gerar um manifesto sem secrets para cada execução de aceite.

- Unitários/contratos: em todo PR, sem serviços externos.
- Integração por serviço: SQL real em container quando disponível; Cosmos real/compatível e Service Bus no alvo protegido do spike. Adapters SaaS possuem testes unitários locais, mas esses testes não são apresentados como prova da integração real.
- BDD: três aplicações novas, três bancos e broker reais, acessíveis privadamente em HML antes do cutover. O runner pode usar port-forward autorizado; não exige expor rotas novas publicamente.
- Provedor no BDD automatizado: stub HTTP temporário e determinístico, restrito ao perfil de teste, representando somente a fronteira MP. Remover esse modo e demonstrar também QR/pagamento com contas de teste reais.
- Fixtures pela API do dono: cliente/veículo em OS, catálogo/estoque em Execution, orçamento/cobrança pela jornada. Não preparar o teste inserindo dados diretamente no banco alheio.
- Duas provas mínimas completas: jornada feliz e falha pré-reparo após pagamento com compensação concluída. Acrescentar reentrega, retomada e corridas do plano aos testes dos módulos correspondentes.
- Guardar commit/imagem, relatório BDD, cobertura por serviço, Quality Gates, execução do deploy e IDs/trace da demonstração nos READMEs. Execução ignorada por falta de ambiente não conta como aprovação.

Uma indisponibilidade externa pode impedir o aceite de integração, mas não precisa impedir escrever e validar domínio/contratos no primeiro PR. Ela fica registrada como pendência de integração, sem ser escondida por skip ou mock.

O adapter de consulta de CPF envia documento normalizado e recebe `{ "cliente": { "id": "...", "ativo": true } }` ou `{ "cliente": null }`. A Function mantém a mesma resposta genérica de não autorização para CPF inválido/inexistente/inativo. Falha técnica HTTP/timeout não emite JWT e devolve erro técnico genérico. Testar também rejeição de credencial de integração incorreta e de JWT cliente/admin nessa rota.

## 8. Checklist para autorizar o primeiro incremento técnico

Pode iniciar **código, contratos e testes locais** quando:

- [ ] Checkouts/base corretos e alterações locais preservadas.
- [ ] Repos Billing/Execution definidos ou preparados para criação.
- [ ] Decisões da seção 1 registradas e donos de cada agregado compreendidos.
- [ ] Esqueletos/scripts e schemas próprios definidos; nenhuma migration monolítica apontada a banco novo.
- [ ] Primeiro PR contém build/lint/testes e não muda rotas públicas nem habilita apply/deploy produtivo.

Antes de **apply/integração HML**, também precisam existir:

- [ ] Custo/quota e credenciais/permissões dos recursos novos confirmados.
- [ ] OIDC/state/ServiceAccounts e secrets por dono configurados.
- [ ] Spikes de mensageria, Cosmos e Mercado Pago aprovados.
- [ ] HTTPS de callback e consulta Function->OS acessíveis e protegidos.
- [ ] Quality Gate configurado e bloqueante; deployment usa o mesmo SHA aprovado.

Nomes/IDs acadêmicos, data limite, link do vídeo e PDF final são preenchidos na entrega. Não bloqueiam o primeiro incremento. Migração histórica, PROD, HA e gestão completa de filiais só entram se forem posteriormente incluídos no escopo.
