# Progresso da implementação — Fase 4

Este registro não substitui o plano e não representa o aceite da fase. As
cópias de trabalho estão em `fase4-work/`; os checkouts originais foram
preservados. Os esqueletos dos serviços novos foram publicados em repositórios
privados; nenhuma alteração foi implantada em HML.

PRs rascunho: [OS](https://github.com/JoaoGW/soat-api/pull/14),
[Auth](https://github.com/JoaoGW/soat-auth-function/pull/24),
[PostgreSQL](https://github.com/JoaoGW/soat-postgres-infra/pull/7),
[AKS](https://github.com/JoaoGW/soat-aks-infra/pull/25) e
[Cosmos/Execution](https://github.com/JoaoGW/soat-execution-service/pull/1),
além do [primeiro contrato no Billing](https://github.com/JoaoGW/soat-billing-service/pull/1).

## Concluído localmente

- `git fetch --all` nos quatro repositórios; bases auditadas confirmadas e
  branches isoladas preparadas para API, Auth, PostgreSQL e AKS.
- Auth: adapter HTTP para consulta de CPF, testes, remoção do adapter PostgreSQL
  e configuração Terraform para URL HTTPS e segredo de integração. OS: rota
  interna protegida com retorno mínimo. Ainda faltam Kong, secret e teste HML.
- PostgreSQL: módulo isolado de banco e output `server_id`, sem mudar o servidor.
- OS: schema/migration próprios com Saga, operações, inbox, outbox e
  idempotência; trigger de histórico e validação de documento. Migration
  aplicada em banco temporário; nenhum catálogo foi recriado. A máquina de
  estados é isolada, sem persistência nem comunicação conectadas.
- Envelope e schemas iniciais para diagnóstico, geração de orçamento, reserva
  e pagamento confirmado, com exemplos e validação, estão presentes nos três
  serviços. Os demais contratos e a ligação a produtores/consumidores faltam.
- Plataforma: módulo Service Bus Standard com duas filas, topic, subscription,
  identidades federadas e RBAC por entidade. O módulo está desativado por
  padrão; foi validado contra o provider instalado, mas não foi aplicado.
- Billing e Execution: repositórios privados `JoaoGW/soat-billing-service` e
  `JoaoGW/soat-execution-service`, branches `main`/`development` e proteção da
  `main` com PR obrigatório e check `quality`; esqueletos Nest,
  lockfiles, Dockerfiles, manifests HML e CI inicial. Billing possui schema e
  migration SQL testados em PostgreSQL temporário e regras puras de orçamento;
  Execution possui regras puras de reserva/consumo/liberação. Nenhum é ainda
  um microsserviço funcional ou está apto a receber tráfego.
- Billing: decisão interna persistida com transação serializável, CAS,
  idempotência e outbox. Testes locais exercitam decisões opostas concorrentes,
  repetições da mesma chave, rollback quando a outbox falha e validação do evento.
  A consulta, aprovação e recusa possuem rotas autenticadas com vínculo ao
  cliente; faltam consultas financeiras e publicação real de mensagens.
- Os commits Billing `22d0718` e OS `3808de3` foram publicados; as CIs de
  ambos passaram. A CI do Billing executa integração em PostgreSQL em container.
- Continuação: geração interna do orçamento grava itens, inbox, operação,
  outbox e tarefa de notificação atomicamente. Testes com PostgreSQL local
  verificaram reentrega concorrente, rollback e geração seguida de aprovação.
  Falta conectar esse serviço ao transporte e executar o envio de notificações.
- Billing: despachante de outbox com claim concorrente, recuperação de claim
  expirado, retry e limite de tentativas testado em PostgreSQL local. Adapters
  de consumidor/publicador e worker desativado por padrão foram publicados;
  consumidor, banco e outbox foram exercitados juntos com broker simulado.
  Falhas definitivas de prazo e orçamento existente produzem evento antes do
  ACK. Faltam teste real, tratamento das demais falhas de negócio e
  reprocessamento operacional das falhas.
- Billing: validação de mensagens atualizada para AJV 8; o audit de produção
  deixou de apontar alerta nesse validador. Ainda há cinco alertas altos ligados
  a Nest/multer e Prisma/deepmerge que devem ser tratados antes de deploy.
- Billing: notificação com claims, retry e SMTP configurável está preparada e
  desativada por padrão. Testes usam SMTP simulado; envio real e reprocessamento
  operacional faltam. O mesmo Message-ID é reutilizado, mas SMTP não garante
  deduplicação após resultado incerto.
- Billing: adapter Orders QR prepara criar, consultar, cancelar e reembolsar
  com chave idempotente e tratamento de resultado incerto; validador HMAC de
  webhook preparado. Testes com HTTP simulado passaram. Falta ligar ambos à
  processamento de cobranças e à reconciliação antes de uso real. Registro
  autenticado de webhook com deduplicação foi implementado e testado com
  PostgreSQL local; ainda não está exposto nem processa o estado canônico.
  Uma função de domínio valida observação canônica de uma transação integral,
  mas ainda não está ligada à persistência de pagamento nem à outbox.
  Commits Billing `812e62e`, `bc41d01` e `f173816` publicados; 72 testes
  unitários e 16 de integração locais passaram.
- Billing: intenção de cobrança persistida antes do envio, com chave estável e
  controle de concorrência. O envio marca operações incertas para reconciliação
  e não repete automaticamente operações em voo. Consumidor opcional valida o
  comando e grava inbox; a criação e a falha por prazo emitem eventos na
  outbox. Testado com PostgreSQL local, broker e provedor simulados; faltam
  reconciliação operacional, demais falhas e testes distribuídos reais.
  Publicado no Billing `94b363a` com contratos no OS `989dcb9`; passaram
  89 testes unitários e 22 integrações locais, além da CI do Billing. Commit `9181e22`
  publicado; 81 testes unitários e 19 integrações locais passaram.
- Billing: endpoint e processador opcionais de webhook validam HMAC,
  consultam order e pagamento canônicos e persistem pagamento e evento na
  mesma transação. Pagamento tardio permanece em reconciliação sem liberar
  trabalho. Testes com PostgreSQL local e provedor simulado passaram; falta
  validar no Mercado Pago real e implementar o tratamento de reconciliação e
  reembolso.
- Execution: adapter de reserva prepara batch por filial com ETags, estoque,
  operação, inbox e outbox; deduplicação e disputa com bloqueio de cancelamento
  foram testadas em simulação em memória. O evento de reserva tem contrato no
  Execution e no OS. Ainda faltam validação em Cosmos real, integração ao
  transporte e o cancelamento seguro perante o início do trabalho físico.
- Execution: consumidor de reserva preparado com validação AJV 8 e settlement
  manual; testes simulados verificam validação, ACK após persistência, falhas e
  reentrega. Commit `ab2b526` publicado; 21 testes locais passaram em Node 25,
  CI Node 24 passou. Ainda não foi ligado ao worker nem testado com broker real; falhas
  de negócio adicionais ainda precisam de tratamento adequado.
- Execution: prazo expirado e estoque insuficiente produzem evento de falha
  junto da operação e inbox, com resultado estável em reentrega. Testes usam
  Cosmos simulado; publicação e consumo real dos eventos ainda não existem.
  Execution `66503c6` e OS `a23ff67` publicados; 24 testes locais do
  Execution e contratos de ambos passaram; checks novos em andamento.
- Execution: dispatcher de outbox usa lease, ETag, backoff, limite de
  tentativas e mensagem com ID estável; worker desativado por padrão usa
  Workload Identity. Testado com Cosmos e Service Bus simulados; faltam
  validação real e reprocessamento operacional de mensagens FAILED.
  Código publicado no Execution `f5ee12d`/`61cf36f`; 37 testes locais passaram.
- OS: função de domínio reavalia fatos fora de ordem e direciona pagamento
  tardio durante compensação para reconciliação. Publicada no commit `63d5233`;
  lint e 230 testes da suíte passaram. A persistência, validação de operações,
  produção de comandos e integração completa da Saga com a inbox ainda faltam.
- OS: recebimento de cobrança valida a operação e o comando persistido, grava
  inbox e avança a etapa de aguardar pagamento na mesma transação. Eventos
  fora de ordem ficam pendentes; concorrência e rollback foram testados em
  PostgreSQL local. Publicado no OS `27b4463`; o check dedicado foi adicionado
  à CI. Consumer de eventos de cobrança valida schema e ACK após persistir,
  testado com broker simulado e PostgreSQL local; publicado no OS `2ba09ad`
  e ainda não está ligado ao runtime. Faltam roteamento, identidade, agendador de reaplicação e demais
  transições/compensações.
- OS: pagamento validado fica pendente até haver cobrança e reserva
  correspondentes; então Saga, operação e comando de fila são gravados
  atomicamente. Reentrega, concorrência, out-of-order, rollback, cancelamento
  e order divergente foram testados em PostgreSQL local. Consumer e
  reavaliação foram preparados; falta ligá-los ao broker e implementar o
  consumo do comando no Execution.
- Execution: enfileiramento valida reserva e disputa ETags com bloqueio de
  cancelamento; tarefa, inbox, operação e evento são preparados no mesmo
  batch. Consumer e testes com Cosmos simulado foram adicionados. Ainda faltam
  runtime, início físico seguro, compensações e validação em Cosmos real.
- OS: confirmação de fila valida Saga, operação e comando e registra a
  transição para NA_FILA atomicamente. O consumer e a reaplicação foram
  preparados; testes locais cobrem concorrência e compensação em andamento.
  A ligação do transporte e o início físico seguro ainda faltam.
- Execution: início, conclusão, cancelamento e liberação de reserva usam
  batches/ETags, ledger e outbox. Cancelamento concorre com início; a liberação
  exige confirmação de que não iniciou e não altera peças consumidas. Testes
  com Cosmos simulado passaram; faltam API/admin, estado financeiro da Saga,
  compensação integrada e validação real de concorrência no Cosmos.
- Workers opcionais de comandos do Execution e eventos do OS foram ligados
  ao Service Bus e permanecem desativados. Eventos/comandos não implementados
  são devolvidos e podem ir à DLQ; falta completar os handlers e validar
  isolamento de identidade por produtor antes de habilitar.
- CI do último push do Billing passou nos checks `quality` e `integration`.
  Execution `cc152cf` e OS `ba2d994` foram enviados; seus checks passaram.
  Execution passou localmente em build, lint, contratos e 16 testes; a
  cobertura de linhas do código presente foi 98,09%.
- Imagens iniciais compiladas com Node 24 e healthchecks consultados em
  containers temporários. `npm audit --omit=dev` apontou vulnerabilidades altas
  via `multer`/Nest em ambos e Prisma em Billing; avaliar correções e repetir
  os testes antes de qualquer deploy. A CI inicial ainda não tem Sonar/CD.

## Continuação obrigatória

Fechar os pontos restantes de T01–T30 e R01–R43 conforme os dois documentos de
planejamento:

1. Completar contratos e ADRs, incluindo todos os comandos, eventos e respostas.
2. Implementar extração das APIs, autenticação/autorização e isolamento de dados;
   validar SMTP e Service Bus reais e conectar as demais falhas aos transportes.
3. Implementar Execution com Cosmos, reservas atômicas, bloqueio de cancelamento,
   diagnóstico, fila e reparo; implementar Saga durável, timers e compensações.
4. Implementar Mercado Pago, webhook, reconciliação e estorno; validar com contas
   de teste, além de BDD, resiliência, concorrência e testes entre os serviços.
5. Completar CI/CD por SHA, Sonar bloqueante, IaC, secrets, observabilidade,
   autorização no Kong, deploy e cutover após os testes e quando houver orçamento.
6. Corrigir alertas de dependências; concluir documentação por repo, evidências,
   vídeo e PDF, com participantes e prazo conferidos no portal.

O GitHub CLI foi autenticado por chaveiro. A assinatura Azure aparece Enabled,
porém o acesso de dados à conta de state `soatsttfstate260909` retorna
`AccountIsDisabled`, tanto na CI quanto em consulta de leitura local. Os planos
Terraform de AKS/PostgreSQL dependem da recuperação desse acesso; não substituir
state nem recriar recursos como contorno. O usuário confirmou que a conta foi
desativada para evitar cobrança no cartão e não pode reativar o Azure agora.
Não reativar, criar ou aplicar recursos pagos; priorizar trabalho e testes locais
sem custos. A conta Azure está identificada, mas
spikes, permissões, quotas, custos e estado de execução precisam ser verificados
antes de qualquer apply. Dados acadêmicos, acesso ao Mercado Pago e links finais
continuam necessários para as etapas dependentes.

As coberturas medidas nos esqueletos refletem somente o código atualmente
presente; não comprovam a cobertura nem a conclusão dos serviços finais.

## Atualização: consumidores, reparo e reembolso

- OS conecta consumidores de eventos da Saga ao Service Bus por identidade de
  workload, desativados por padrão. A identidade do produtor no topic compartilhado
  e os eventos ainda não tratados precisam de validação antes da ativação.
- Execution conecta comandos de reserva, fila, cancelamento, liberação e
  solicitação de diagnóstico. Solicitação de diagnóstico persiste como pendente;
  início e conclusão operacionais e catálogo continuam pendentes. O adapter de
  reparo usa ETag, inbox e outbox para início/conclusão, cancelamento e liberação;
  ações de início e conclusão não têm API autenticada. Testes usam Cosmos simulado.
- Billing prepara, envia e confirma reembolso com intenção e idempotência duráveis,
  verificação canônica e reconciliação de resposta incerta. O serviço exige prova
  persistida de cancelamento, porém sua ingestão autenticada, a orquestração e a
  ligação ao broker ainda não existem; não habilitar reembolso automático. Testes
  usam PostgreSQL local e provedor simulado, sem validar Mercado Pago real.
- Falta integrar toda a compensação entre os serviços, completar o fluxo de
  diagnóstico/reparo e executar BDD distribuído e validações com broker, Cosmos e
  Mercado Pago reais. O Azure permanece desativado por decisão expressa do usuário.
- Execution: 68 testes unitários e contratos passaram; Billing: 117 unitários,
  29 integrações PostgreSQL e contratos passaram. Esses números não comprovam
  jornadas distribuídas nem integração com recursos externos.

## Atualização: ações operacionais e integração local

- Execution oferece ações autenticadas de início/conclusão de diagnóstico e
  reparo, consulta e gravação de item de catálogo por filial, snapshot de
  preços e eventos de diagnóstico; JWT administrativo e Cosmos exigem setup.
  A concorrência de Cosmos foi exercitada com simulação, não com o serviço real.
- OS recebe início/conclusão de diagnóstico e gera comando de orçamento com o
  snapshot. Recebe início/conclusão de reparo e atualiza Saga, projeção e
  histórico; eventos fora de ordem ficam na inbox para reaplicação. Início
  durante compensação exige reconciliação. O worker permanece desativado até
  validar isolamento de produtores e integração completa.
- Teste reproduzível entre casos de uso de OS e Billing com bancos PostgreSQL
  locais separados validou geração de orçamento, valor e deduplicação; entrega
  do comando foi direta, sem broker. Não é BDD distribuído de ponta a ponta.
- Pendências de implementação independentes de setup: abertura integrada da
  Saga e transições restantes de orçamento, aprovação, reserva, compensação e
  reembolso; autenticação verificável dos produtores dos eventos; integração
  completa entre os serviços; catálogo completo e testes distribuídos reais.
  Azure segue desativado, e Service Bus/Cosmos/Mercado Pago não foram validados.

## Atualização: abertura, autenticação e transições

- A rota administrativa isolada da Fase 4 cria OS, histórico, Saga, operação e
  outbox atomicamente com chave idempotente. Seu publicador de comandos está
  preparado e desativado por padrão; usa as filas dos serviços e repete envios
  incertos com o mesmo ID.
- Os três serviços assinam/verificam mensagens com Ed25519 e chaves distintas
  por produtor; adulterações foram rejeitadas nos testes. Distribuição e rotação
  das chaves e autenticação de workload exigem validação no ambiente real.
- A Saga recebe emissão e aprovação do orçamento, gera reserva e, depois da
  confirmação, prepara cobrança; sem caixa configurado, mantém o fato pendente.
  Execution aceita reserva vazia para ordens compostas apenas por serviços.
- A recusa antes do pagamento cancela a execução e só conclui após confirmação.
  Billing recebe e persiste opcionalmente evidência de cancelamento assinada.
  Falta conectar comando de reembolso, confirmação e compensações após
  reserva/pagamento; falhas nessas fases permanecem sem orquestração completa.
- Os testes usam PostgreSQL local e simulações. Não existe ainda teste BDD
  distribuído de ponta a ponta com broker, Cosmos e Mercado Pago. Um emulador
  local de Service Bus não suporta Entra ID e não substitui validação de
  identidade no Azure; Azure permanece desativado por decisão do usuário.

## Atualização: comando e sequência de reembolso

- Billing persiste o comando assinado de reembolso antes do ACK, aguarda
  evidência autenticada, registra intenção e tenta a operação financeira uma
  única vez por chave; a confirmação canônica emite evento de reembolso.
- OS permite iniciar compensação administrativa e, após cancelamento sem início,
  pede reembolso de pagamento conhecido. A confirmação do reembolso prepara
  liberação de estoque; a Saga só conclui após evento de liberação. Quando o
  estado financeiro ou físico é incerto, registra reconciliação. Antes de uma
  cobrança existir, pode liberar reserva após cancelamento confirmado.
- Testes com PostgreSQL local e provedor/transporte simulados cobrem a sequência,
  reentregas e valor divergente. O fluxo continua desativado por padrão.
- Faltam testes distribuídos de ponta a ponta com broker e Cosmos, validação
  Mercado Pago real, cobertura das demais falhas e reconciliação operacional.
  Nenhum recurso Azure foi ativado e nenhum reembolso real foi executado.

## Atualização: falhas e broker local

- A Saga trata falhas definitivas de orçamento, reserva e cobrança expirada
  antes do envio, com inbox, deduplicação e compensação. Orçamento já existente
  e prazos vencidos sem certeza sobre o estado seguem para reconciliação. A
  revisão de prazos é opcional e não libera reserva nem reembolsa por timeout.
- Um teste parcial OS → broker → Billing foi preparado, incluindo contrato,
  configuração do emulador e verificação de duplicidade, mas não executado.
  É necessário aceitar os termos do emulador Service Bus e SQL Server para
  iniciá-lo. O BDD completo dos três serviços ainda não foi implementado.
- Build, lint, testes unitários, contratos e 32 testes de integração OS com
  PostgreSQL local passaram; não comprovam a execução em broker ou nuvem.

## Atualização de 2026-11-05: BDD, consulta financeira e operação de Execution

As atualizações abaixo substituem afirmações anteriores deste histórico quando
descrevem o mesmo ponto. Elas registram testes locais e não constituem aceite
final ou prova de execução em Azure.

- API/OS: o Cucumber executa oito cenários em português, com broker Service Bus
  emulado, PostgreSQL e Cosmos emulados. Os 24 passos passaram. O teste monta os
  consumidores e casos de uso no mesmo processo, com webhook por fixture e
  Mercado Pago simulado; o teste separado com três processos não inicia os
  workers Nest de produção. Os cenários incluem entrega, compensação e timeout.
- Billing: consultas por ID e por OS exigem JWT de cliente e filtram pelo dono
  do orçamento; o QR só é retornado para cobrança criada e não expirada. O
  isolamento foi exercitado em PostgreSQL local. A referência REST está no
  OpenAPI do repositório.
- Execution: consulta administrativa da fila por filial usa ordenação estável
  e paginação por cursor; tarefas antigas sem a chave de ordenação exigem o
  backfill por filial, que oferece inspeção prévia e atualização com ETag.
  Consulta e ajuste de saldo de peça exigem JWT administrativo, chave de
  idempotência e motivo; o batch preserva o saldo reservado. Testes locais
  verificaram o fluxo com Cosmos emulado, e testes em memória exercitaram a
  corrida entre ajuste e reserva. A atomicidade sob concorrência precisa ser
  confirmada no serviço Cosmos real.
- O ajuste de estoque é usado na preparação dos cenários BDD. Passaram 257
  testes unitários OS, 139 do Billing e 91 de Execution nas execuções desta
  rodada; as suítes e coberturas não comprovam os requisitos de deploy ou
  observabilidade em nuvem.

Ainda há trabalho de implementação e integração independente de setup, em
particular a preservação completa dos CRUDs e consultas da aplicação original,
os demais tratamentos e procedimentos para estados ambíguos da Saga, a
integração completa dos workers reais no BDD e o fechamento das evidências por
SHA. Os testes existentes não permitem declarar T08–T10, T20, T22 ou T23
integralmente concluídos. Azure desativado, credenciais/contas de teste,
validação de Service Bus/Cosmos/Mercado Pago reais, demonstração em Kubernetes,
dados acadêmicos e publicação da entrega continuam dependendo do usuário ou de
ambiente externo. Não reativar Azure nem criar recursos que possam cobrar.

## Atualização posterior de 2026-11-05: cadastros e consultas no OS

- Os cadastros de clientes e veículos agora têm CRUD administrativo no banco
  novo, validação, desativação lógica e rota interna de CPF com credencial
  exclusiva. A abertura da Saga foi testada com cadastros reais desse banco.
- Consultas administrativas e de cliente, histórico, visão da Saga e relatório
  de tempos usam os dados da Fase 4; consultas do cliente são filtradas pelo
  sujeito autenticado. A fila operacional preserva prioridade e antiguidade
  antes da paginação. Os testes de integração passaram no PostgreSQL local;
  testes HTTP exercitaram JWTs assinados de cliente e administrador.
- O catálogo de Execution suporta listagem paginada e desativação lógica;
  as consultas de catálogo, fila e estoque passaram no emulador Cosmos.
- O BDD passou com nove cenários e 27 passos, incluindo uma jornada em três
  processos distintos pelo broker local. Os processos usam adaptadores de teste,
  não iniciam os workers Nest em produção, e o pagamento é simulado. A suíte
  OS passou com 263 testes; a cobertura exigida atualmente considera domínio
  e aplicação, excluindo infraestrutura e controladores, e portanto não prova
  os 80% sobre o código de produção relevante previstos no plano.
- Persistem trabalhos independentes de setup, sobretudo integração de workers
  de produção nos testes distribuídos, auditoria das falhas e da recuperação
  operacional, cobertura dos adapters/consumidores críticos e evidências
  individuais. Ambiente real e entrega acadêmica seguem condicionados às
  providências externas indicadas acima.

## Atualização posterior: workers Nest, falhas e cobertura crítica

- O BDD local também inicia os workers Nest de produção em processos separados.
  Clientes Azure são redirecionados exclusivamente para emuladores locais, o
  Mercado Pago é fixture e ações do operador são chamadas pelo teste; não há
  validação de identidade Azure, serviços HTTP completos ou Kubernetes. Foram
  exercitadas jornada feliz, estoque insuficiente, compensação após pagamento e
  retomada após reiniciar o processo OS. A suíte passou com 13 cenários e 39
  passos em broker e bancos locais limpos. Houve uma falha intermitente anterior
  no cenário de reembolso; ele passou isoladamente e na execução limpa, sem
  identificação conclusiva da causa. O executor agora informa stderr e stdout
  em caso de falha.
- Falha definitiva de reserva ou expiração de cobrança recebida após prazo
  vencido pode retomar a compensação com auditoria, apenas sem fatos ou
  operações posteriores conflitantes. Em caso de dúvida continua em
  reconciliação; não se presume estorno ou liberação por timeout.
- O CI agora mede e exige cobertura mínima de 80% separadamente para a
  mensageria OS e a infraestrutura da Saga OS. Em PostgreSQL local limpo, a
  Saga alcançou 86,5% de linhas e 81,11% de branches; mensageria alcançou
  94,34% de linhas e 90,66% de branches. Billing e Execution passaram a
  exigir 80% para infraestrutura, medindo respectivamente 95,27% e 96,46%
  de linhas. Essas medições não abrangem todo o código restante do OS.

## Atualização: cobertura integral, observabilidade e entrega

- A cobertura integral do OS agora combina unitários, integração da Saga e
  testes HTTP, sem excluir o código legado ativo. O gate passou no CI com
  90,68% de instruções, 80,63% de branches, 93,12% de funções e 91,66% de
  linhas; a main passou a exigir esse gate, integração da Saga e manifests.
- Billing e Execution inicializam SDK OpenTelemetry de forma opcional e
  testaram exportação de span para coletor local. Chave, configuração real,
  propagação completa e visualização no New Relic seguem pendentes.
- O cenário de reembolso com workers foi repetido três vezes com sucesso;
  não houve evidência suficiente para identificar a causa da falha intermitente
  anterior. Não tratar as repetições como prova de sua eliminação.
- A revisão por R01–R43 está em `revisao-execucao-fase4.md`. A base para o
  PDF e o roteiro do vídeo estão em `base-entrega-academica.md`; não são a
  entrega final e contêm campos ainda não informados.

## Atualização: pipelines, HTTP, falhas e traces

- Billing e Execution têm publicação e deploy HML condicionados aos checks do
  mesmo SHA e à variável `HML_DEPLOY_ENABLED=true`, ausente atualmente. Os
  manifestos usam secrets separados; Billing executa uma imagem de migração
  própria antes do rollout. Imagens foram construídas localmente e a migração
  foi aplicada em PostgreSQL descartável; não houve deploy na nuvem.
- O BDD passou com 15 cenários e 45 passos, incluindo APIs HTTP autenticadas,
  compensação e interrupção abrupta do OS. O provedor ainda é simulado. Há
  workflow manual que fixa os commits; sua execução no GitHub exige token de
  leitura dos repositórios privados e aceite dos emuladores.
- São propagados contextos W3C na Function, abertura e vários comandos/eventos
  da Saga; os consumidores criam spans após validar assinatura. Persistem a
  comprovação de todas as fronteiras, de trace único fim a fim e da exportação
  no ambiente real. A intermitência anterior de reembolso não foi reproduzida
  em três novas execuções, mas sua causa não foi identificada.
- Os três serviços executam gate estático SonarJS com um conjunto selecionado
  de regras, que não equivale à análise integral do SonarQube. O Swagger de
  abertura e recuperação do OS recebeu descrições, corpo e segurança.
- A auditoria local de dependências de produção apontou 5 entradas de alta
  severidade em Billing e 2 em Execution; as correções sugeridas incluem
  upgrades de versões principais e exigem análise e regressão antes do deploy.

### Atualização de 5 de novembro de 2026

- Billing e Execution fixam temporariamente Multer 2.5.0 por override, com
  teste HTTP do interceptor Nest e filtro assíncrono. Build, lint, contratos,
  gate SonarJS e testes de cobertura passaram nos dois serviços. A auditoria
  passou a apontar três entradas altas em Billing (cadeia Prisma/deepmerge-ts)
  e nenhuma alta em Execution; ainda há entradas moderadas nos dois serviços.
  O override deve ser retirado quando o Nest oferecer versão compatível com a
  correção. A tentativa de Nest 12 foi revertida após falhas de Jest com ESM.
- O BDD ganhou um cenário que coleta spans dos três processos e verifica a
  propagação W3C, inclusive pais, pelo broker emulado. O cenário usa extrator
  HTTP e exportador de teste: não comprova instrumentação automática de ponta a
  ponta, Auth ou exportação para o ambiente real.
- A suíte completa passou localmente com Node 24: 20 cenários e 60 passos.
  Nos dois cenários adicionais, Billing e Execution são encerrados com SIGKILL,
  seus comandos são publicados durante a indisponibilidade e a jornada continua
  após reinício. O pagamento continua simulado e as interrupções não cobrem todos
  os pontos possíveis entre commit, publicação e ACK. Combinação dos checkouts:
  OS `9a368a6`, Billing `043142f` e Execution `33c103f`.
- O OpenAPI de Billing detalha as respostas de consulta e decisão de orçamento.
  O Swagger do OS descreve atualização de cadastros e a credencial exclusiva,
  corpo e resposta mínima da consulta interna de CPF, com teste do documento
  gerado. A revisão completa de todas as rotas ainda deve ser finalizada.
- Billing agora registra `RECONCILIACAO_NECESSARIA` quando uma evidência
  autenticada de cancelamento diverge do comando de reembolso, sem chamar o
  provedor; falhas transitórias continuam pendentes. Há aviso sem dados
  financeiros, consulta operacional e teste em PostgreSQL. Compensações usuais
  passaram com workers e broker emulado. Um evento assinado, escrito na mesma
  transação do incidente, leva a Saga à reconciliação sem liberar estoque; o
  cenário com evidência corrompida passou pelo broker local. O OS deve receber
  o contrato antes de Billing ser atualizado. Essa melhoria não identifica a
  causa da intermitência anterior no reembolso.
- Em resultado financeiro incerto, Billing registra o aviso na outbox e a Saga
  permanece em reconciliação. Uma confirmação canônica posterior pode retomar
  a compensação com auditoria somente se o cancelamento tiver prova autenticada
  e não houver evidências físicas ou comandos conflitantes. O teste distribuído
  simula resposta perdida, preserva a reserva durante a dúvida e confirma uma
  única chamada ao provedor; o teste antecipa o ciclo de reconciliação.
- O reconciliador examina até 20 operações por ciclo e isola falhas individuais;
  a seleção aleatória não garante prazo para filas grandes. O trace da Auth foi
  testado com handler real, spans em memória e fronteira HTTP simulada do OS.
  O gate SonarJS passou de 9 para 14 regras selecionadas em cada serviço.
- A imagem de runtime de Billing elimina dependências opcionais depois de gerar
  o cliente Prisma; uma imagem local consultou PostgreSQL e iniciou o Nest sem
  `prisma`, `@prisma/config` ou `deepmerge-ts`. A auditoria da instalação sem
  opcionais apontou zero alertas altos e cinco moderados. A imagem de migração
  conserva o CLI e continua sujeita aos alertas altos dessa cadeia. O CI agora
  inclui construção e smoke test das duas imagens, sem publicar ou fazer deploy.
  O job de integração com as duas imagens passou no GitHub no commit
  `b85c54a`; a execução BDD acima precede esse commit e não usa imagens Docker.

### Atualização de 6 de novembro de 2026

- O teste local entre a Function real e o controller interno real do OS usa
  HTTPS com certificado temporário, PostgreSQL e instrumentação OpenTelemetry
  de produção. Ele encontrou `tracestate` duplicado pela injeção manual e pela
  instrumentação automática do undici. A Auth agora cria um span cliente e
  injeta W3C uma única vez; a cadeia Auth → cliente HTTP → OS passou no teste.
  O host Azure, o Kong implantado e o coletor externo não são validados por ele.
- O workflow manual de BDD exige agora também o SHA da Auth e executa essa
  prova junto ao conjunto fixado. Sua execução no GitHub continua dependente
  do token de leitura dos repositórios privados e dos aceites de emuladores.
- Em auditoria posterior, OS e Auth apresentaram novos alertas altos transitivos
  e o OS um crítico em `proxy-addr`. Atualizações no lockfile removeram o alerta
  crítico e reduziram os altos do OS de 16 para 4, todos na cadeia Prisma; na
  Auth, os altos caíram de 3 para zero. O OS mantém cinco alertas moderados,
  assim como a Auth. A atualização do OS inclui Nest 11, Nodemailer 10 e o
  override temporário de Multer 2.5.0. A cobertura combinada passou e há testes
  para o transporte de e-mail, o interceptor Multer e o caso de confiança de
  proxy IPv6 mapeado. Os três cenários que antes travaram passaram após correção
  da limpeza dos processos de teste. A suíte completa voltou a passar com Node
  24: 20 cenários e 60 passos após a instalação limpa das novas dependências.
- O OS passou a usar Node 24 no CI e na imagem; a imagem local iniciou, serviu
  health e Swagger e verificou as migrations contra PostgreSQL local. O workflow
  de publicação agora exige CI aprovado para o SHA da ponta da branch, inclusive
  quando acionado manualmente, e o script valida checkout, imagem e versão. O
  gate foi exercitado localmente com casos aceitos e recusados; o deploy real
  não foi executado. OS, Billing e Execution serializam deploys por ambiente;
  Billing e Execution também conferem a ponta antes de acessar o cluster.
- A publicação da outbox e o processamento de um comando de reembolso agora
  são isolados no worker: falhas não impedem a reconciliação de outras operações
  no ciclo. O reconciliador percorre lotes de até 20 por identificador com
  cursor em memória e volta ao início; reinícios frequentes ainda podem atrasar
  operações. Testes unitários e PostgreSQL verificaram falhas isoladas e o
  avanço para além do primeiro lote sem confirmar estados incertos.
- O gate SonarJS local aumentou para 21 regras nos três serviços. Os OpenAPI de
  Billing e Execution receberam correções dos parâmetros e validações
  observados nos controllers. A revisão integral REST e uma análise Sonar
  completa seguem pendentes.
- Os testes de Billing e Execution agora comparam as rotas do OpenAPI com os
  controllers registrados no módulo Nest, inclusive o esquema de autenticação.
  Eles identificam rotas ausentes ou excedentes, mas não validam todos os corpos
  e respostas HTTP. Os cenários distribuídos de compensação, evidência
  divergente e resposta perdida passaram novamente pelo broker local.
- A seleção de comandos de reembolso elegíveis também passou a percorrer IDs,
  permitindo avançar quando um comando falha antes do envio. O cursor reinicia
  com o processo. A prova em PostgreSQL isolado e os três cenários distribuídos
  de compensação passaram após a alteração. Uma execução contra banco de teste
  reutilizado encontrou comandos pendentes de testes anteriores; isso não prova
  a causa da intermitência histórica do BDD. O cenário de resposta perdida
  também passou em três repetições anteriores à alteração desse segundo cursor.
- Após os dois ajustes de percurso, o BDD completo voltou a passar em bancos
  locais novos: 20 cenários e 60 passos, com OS `aa6b3f8`, Billing `173b470`
  (alteração final apenas documental) e Execution `4e1a5ce`. A integração
  completa de Billing passou com 37 testes em outro banco local isolado.

### Continuação: contratos HTTP e fixtures

- Os testes HTTP de orçamento e cobrança de Billing validam os corpos reais
  contra o OpenAPI usando PostgreSQL local; a suíte completa passou com 38
  testes. As fixtures de reembolso posicionam seu próprio cursor sem apagar
  mensagens alheias e passaram no banco reutilizado que antes reproduziu falha.
  A causa da intermitência histórica do BDD permanece não comprovada.
- Execution documenta os formatos de estoque e catálogo. Seu teste local usa
  controllers Nest, JWT e Cosmos emulado para comparar respostas HTTP com os
  schemas. O workflow distribuído ganhou essa verificação; a execução dele no
  GitHub ainda depende do acesso aos repositórios privados.
- Os testes OpenAPI dos dois serviços conferem referências internas. No OS, o
  Swagger gerado passou a documentar filtros e limites de paginação das ordens
  e foi exercitado com as credenciais administrativas e de cliente em teste.
- Os três gates locais incluem agora 23 regras SonarJS selecionadas, após a
  inclusão das verificações de hash e modo de cifra. Isso não substitui uma
  análise Sonar completa nem comprova a ausência de vulnerabilidades.

### Recuperação de publicação em Billing

- Billing ganhou comando desabilitado por padrão para rearmar eventos próprios
  em `FAILED`, após validar o schema e registrar auditoria transacional. Ele
  preserva o `messageId` e o payload; a entrega e a deduplicação ainda precisam
  ser conferidas pelo operador. O ator informado é associado à identidade da
  plataforma, não autenticado pelo próprio comando.
- A migration aditiva e a ferramenta foram exercitadas no PostgreSQL local,
  incluindo concorrência e rollback; a imagem de runtime foi construída e
  verificou a trava e acesso à tabela de auditoria. A suíte Billing passou com
  41 integrações e 168 testes unitários; um teste adicional de publicação com
  emissor simulado passou separadamente. Dois cenários BDD passaram pelo broker
  com a migration aplicada. Não foi efetuado deploy nem apply na nuvem.
- Execution também ganhou recuperação de evento próprio `FAILED` com schema,
  ETag e auditoria em batch na mesma partição Cosmos. Uma corrida no emulador
  confirmou uma única recuperação e auditoria; evento inválido foi recusado.
  A imagem local contém a ferramenta desativada por padrão e a suíte de
  infraestrutura passou. Após o rearme, o despachante publicou o mesmo ID e
  payload para um emissor simulado. A identidade e o Cosmos reais seguem sem
  validação.

### DLQ de orçamento em Billing

- Billing pode recuperar o primeiro comando de geração de orçamento da DLQ,
  exclusivamente quando o ID selecionado, assinatura do OS e schema coincidem.
  A tentativa é auditada antes do handler idempotente e o ACK ocorre depois da
  verificação da inbox e da operação. O teste local usou broker e PostgreSQL,
  recusou conteúdo adulterado e schema inválido, e simulou perda de ACK sem
  duplicar orçamento; contexto W3C foi mantido no evento resultante.
- Em um ensaio o emulador retornou lock inválido depois de registrar a operação;
  a mensagem permaneceu na DLQ. Execuções posteriores passaram, mas a causa do
  erro e sua relação com o problema histórico de reembolso não foram provadas.
  A ferramenta não recupera comandos de cobrança ou reembolso nem evidências.
  O teste entrou no workflow distribuído, cuja execução no GitHub ainda depende
  de acesso de leitura aos repositórios privados.
- Na recuperação da Saga do OS, uma falha após a tentativa de ACK não provoca
  outra liquidação da mesma mensagem. O teste com broker e PostgreSQL locais
  simulou ACK incerto e comprovou uma única compensação; cada tentativa ficou
  auditada. O script operacional foi incluído na imagem de runtime e ganhou
  verificação de trava no CI. A DLQ de subscription real permanece sem prova.
- A sequência local executou a DLQ de Billing, os 20 cenários e 60 passos do
  BDD e a DLQ do OS em bancos novos; todos passaram. Os checks dos PRs de OS,
  Billing e Execution passaram nas versões enviadas. Não houve deploy Azure.

### Recuperações adicionais de DLQ e cobrança pendente

- Foram acrescentadas ferramentas locais de recuperação auditada para evidências
  de compensação, comandos de reembolso e comandos de cobrança. Elas exigem ID,
  assinatura e contrato correspondentes e só confirmam a mensagem após comprovar
  o estado persistido. Cobranças só podem ser recuperadas quando um resultado
  terminal e o respectivo evento já estão comprovados; estados financeiros
  incertos são recusados. Os comandos não chamam diretamente o provedor, mas o
  processamento normal posterior poderá fazê-lo conforme as evidências presentes.
- Os testes usam PostgreSQL e DLQ de fila no emulador Service Bus; a DLQ de
  subscription, identidade de produção e integração Mercado Pago reais ainda
  exigem validação no ambiente configurado. O workflow distribuído foi ampliado
  para executar essas verificações em sequência.
- Um teste adicional confirma que o cancelamento com cobrança existente e ainda
  sem pagamento mantém a reserva e coloca a Saga em reconciliação, sem presumir
  cancelamento financeiro. A orquestração automática do cancelamento de cobrança
  no provedor ainda precisa ser implementada; a operação permanece pendente de
  tratamento explícito, não é comprovada por esse teste.
- Na versão enviada, Billing passou em 190 testes unitários e 42 de integração;
  a imagem local comprovou as travas dos três comandos. O aceite distribuído
  sequencial passou com 20 cenários e 60 passos, além das recuperações de DLQ;
  cobrança incerta foi recusada sem nova chamada ao provedor simulado. O OS passou
  no teste local de cancelamento com cobrança pendente. Commits enviados:
  Billing `5a742dc` e OS `478aeee`. Não houve deploy nem apply na nuvem.

### Preparação do cancelamento de cobrança

- Billing implementa intenção durável e uma tentativa ao provedor, após validar
  evidência autenticada de cancelamento do trabalho, cobrança e reserva. Timeout,
  falha de persistência após chamada, pagamento concorrente e dados canônicos
  divergentes não liberam a reserva; a retomada consulta o provedor sem repetir
  a mutação. Comando e evento têm contratos compartilhados com o OS.
- O consumidor Nest é opt-in e está desativado por padrão. A Saga do OS ainda
  não emite o comando nem consome o resultado: não habilitar a funcionalidade
  até integrar e testar o fluxo completo. Também faltam tratamento operacional
  completo de falhas do comando e prova com Mercado Pago real.
- A suíte local passou em 202 testes unitários e 50 integrações; os oito testes
  específicos no PostgreSQL mediram 88,88% de statements e 82,08% de branches
  para o serviço de cancelamento. Foi acrescentado ao CI um gate de cobertura
  específico para esses testes. Comando e evidência assinados também passaram
  pelo broker emulado; esse ensaio não substitui o BDD entre OS e Billing.
- Envios iniciais: Billing `eae48a3`, OS `bd16887`. Não houve deploy nem apply.
- Em uma segunda rodada, o OS recebeu a preparação do comando de cancelamento e
  o tratamento do resultado confirmado, incluindo reaplicação de eventos e
  auditoria. Pagamento, reparo ou outras operações conflitantes mantêm a Saga
  em reconciliação. O envio é controlado por `ENABLE_SAGA_CHARGE_CANCELLATION`
  e continua desativado por padrão, assim como a trava de Billing.
- O teste específico percorreu OS e Billing pelo broker local com assinaturas;
  Execution e Mercado Pago foram simulados, e o teste prepara a liberação sem
  executar a liberação no Execution real. Uma repetição geral do BDD com banco
  reutilizado falhou e foi interrompida; havia mensagens sintéticas acumuladas
  no broker e dados de testes anteriores. Isso não comprova a causa de todas as
  falhas; o aceite foi reiniciado com bancos e broker locais isolados.
- Uma prova adicional com os três workers Nest em processos independentes,
  broker, PostgreSQL e Cosmos emulados passou: cobrança não paga foi cancelada
  no provedor simulado, Execution liberou a reserva e a Saga concluiu a
  compensação. O primeiro ensaio revelou que o publicador do OS não roteava o
  novo comando; o roteamento foi corrigido e recebeu teste unitário. As travas
  dos serviços permanecem desativadas por padrão. Ainda são necessárias provas
  dos estados e corridas com o Mercado Pago real e o ambiente implantado.
- O aceite sequencial em bancos novos passou com 22 cenários e 66 passos,
  incluindo a nova jornada dos três workers de produção com o provedor simulado.
  Um cenário adicional simulou resposta perdida após o cancelamento: os três
  workers concluíram a compensação com uma única chamada financeira. O comando
  agora também possui recuperação de DLQ auditada; teste no broker local
  confirmou persistência antes do ACK e nenhum envio sem evidência.
- O `npm audit --omit=dev` da instalação local de Billing apontou três alertas
  altos na cadeia `prisma`/`@prisma/config`/`deepmerge-ts` e alertas moderados
  em `gaxios`/`rimraf`/`glob`/`minimatch`. A construção de runtime remove o CLI
  Prisma e informou cinco alertas moderados após o prune; a imagem de migração
  mantém o CLI e precisa de revisão específica. Não foi aplicada atualização
  forçada com quebra de compatibilidade nem declarada ausência de vulnerabilidades.
- O caso de timeout foi registrado no BDD e passou isoladamente com os três
  processos. Os commits mais recentes enviados são Billing `bdc4e0c` e OS
  `dfe3f96`; os checks desses commits foram iniciados no GitHub. A execução
  acadêmica completa, a integração real de pagamento, o deploy e a avaliação
  final de todos os requisitos ainda não foram comprovados.
- Os checks de qualidade e integração de Billing e todos os checks do OS
  passaram nos commits `bdc4e0c` e `dfe3f96`. O BDD distribuído completo
  de 22 cenários passou localmente; o cenário adicional de resposta perdida
  passou em execução isolada, não junto dessa mesma rodada completa.
  Os fluxos de publicação e deploy foram ignorados pelas travas existentes.
- A correção automática de dependências foi ensaiada em cópia temporária e não
  alterou o lockfile; permanece trabalho local de análise de versões e riscos.

### Bloqueio de cancelamento e investigação de dependências

- Billing registra divergências de cancelamento e auditoria na mesma transação
  que publica `billing.charge-cancel-blocked.v1`. O OS recebe o aviso, mantém
  reconciliação e impede novas tentativas de liberação ainda pendentes; uma
  publicação já reclamada permanece como operação incerta. Os cenários de
  resposta perdida, evidência divergente e aviso tardio foram exercitados.
- O BDD completo passou com 24 cenários e 72 passos. Os commits com esse trabalho
  foram enviados para Billing `efbffdc` e OS `2c43647` nas branches de implementação da Fase 4.
- Foi ensaiada em cópia temporária uma atualização por override de
  `@prisma/config > deepmerge-ts` para 8.0.2 e `gcp-metadata > gaxios` para 8.3.2.
  O audit de produção da cópia retornou zero alertas, mas o audit completo ainda
  apontou sete baixos e oito moderados. Build, 209 testes unitários, migrations,
  integração local, imagem de migração e BDD distribuído de 24 cenários passaram;
  uma prova HTTP de metadados em loopback confirmou sucesso e erro 404. Os dois
  overrides ultrapassam os intervalos declarados pelos pacotes e precisam de
  revisão de compatibilidade e manutenção; não são parte da branch principal
  de Billing enquanto não forem incorporados expressamente.

### Deploy Kubernetes no CI, documentação e padronização das branches

- Cada serviço ganhou o job Deploy Kubernetes (kind) no CI: um cluster kind
  efêmero recebe a imagem do SHA avaliado, as dependências do serviço, as
  migrations e o overlay `deploy/kustomize/overlays/kind`. Os testes validam
  rollout e imagem implantada; no OS, `/health` com o SHA, Swagger, login
  administrativo e consulta da fila operacional no banco da Saga; em Billing,
  consulta autenticada ao PostgreSQL próprio; em Execution, token aceito com o
  acesso ao Cosmos fechado sem identidade Azure. A publicação HML de Billing e
  Execution passou a depender desse job e os testes de entrega verificam a
  dependência. Os jobs passaram nos três serviços.
- O CI publica os totais de cobertura de cada SHA no resumo do job e como
  anotação. Medições: OS completo 90,98% statements, 81,60% branches, 93,40%
  functions e 91,98% lines; Billing 87,70/82,34/88,41/92,89% no serviço e
  93,33/90,81/89,34/96,64% na infraestrutura; Execution 89,28/83,98/94,00/95,16%
  no serviço e 91,03/84,37/98,03/96,75% na infraestrutura.
- Os overrides de dependências de Billing foram incorporados à branch principal;
  `npm audit --omit=dev` não apontou vulnerabilidades e a verificação de
  metadados em loopback entrou no CI.
- Os READMEs de OS, Billing e Execution foram reorganizados com arquitetura,
  banco próprio, escolha e justificativa da Saga orquestrada, API, cobertura,
  pipeline e operação. O ADR 0001 registra a alternativa coreografada e o estado.
- As branches de trabalho foram renomeadas para o padrão `imp/` e `docs/`; a
  renomeação fechou os PRs antigos, substituídos pelos PRs listados no guia de
  retomada. O BDD distribuído remoto continua dependente do secret
  `CROSS_REPO_READ_TOKEN`, ausente no OS. Não houve deploy nem apply na nuvem.
