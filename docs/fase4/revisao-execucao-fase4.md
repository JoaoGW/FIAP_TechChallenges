# Revisão da implementação — Fase 4

Referências: enunciado original em `SOAT - Fase 4 - Tech challenge.pdf` e
matriz R01–R43 do plano. Esta revisão distingue código em PR, prova local e
aceite em ambiente real. Não houve reativação do Azure, deploy ou pagamento
real. Os PRs são rascunhos e precisam passar pelo fluxo de revisão e integração.

## Critério da estimativa

Cada um dos 43 itens recebe 1 ponto quando o artefato ou prova correspondente
está disponível, 0,5 quando há implementação ou prova parcial e 0 quando o
entregável ainda não existe. A estimativa é **23/43 = 53,5%, arredondada para
54%**: 14 completos neste critério, 18 parciais e 11 pendentes. Ela mede
cobertura de requisitos, não tempo, custo, prontidão de produção ou nota. Os
itens acadêmicos são contados individualmente, como na matriz original.

| Requisito | Estado | Evidência ou pendência principal |
| --- | --- | --- |
| R01 | Parcial | Três processos locais e três projetos; falta execução integrada em Kubernetes. |
| R02 | Completo | Repositórios OS, Billing e Execution existem; os dois últimos são privados. |
| R03 | Parcial | Manifestos e IaC preparados; isolamento/deploy na nuvem não comprovados. |
| R04 | Parcial | Bancos distintos nos testes locais; isolamento real pendente. |
| R05 | Parcial | PostgreSQL próprio testado localmente; HML pendente. |
| R06 | Parcial | Cosmos emulado; banco e acesso reais pendentes. |
| R07 | Parcial | Auth usa HTTP e serviços têm stores próprios; falta teste negativo de credenciais reais. |
| R08 | Parcial | Rotas e contratos REST existem; cutover e integração real não validados. |
| R09 | Parcial | Comandos e eventos passam pelo broker emulado; Service Bus real pendente. |
| R10 | Completo | Saga persistente e recuperação exercitadas em testes locais. |
| R11 | Parcial | Compensações testadas; estados ambíguos e cobertura de falhas exigem revisão adicional. |
| R12 | Completo | Saga orquestrada e justificativa documentadas nos serviços; confirmar versão final no aceite. |
| R13 | Parcial | Adapter, webhook e reembolso usam fixture; pagamento de teste real pendente. |
| R14 | Completo | Suítes unitárias dos três serviços executadas. |
| R15 | Completo | BDD local com fluxo feliz e compensação, incluindo broker e workers Nest. |
| R16 | Completo | Gate combinado OS e gates de Billing/Execution acima de 80%; relatórios por CI. |
| R17 | Parcial | Gates SonarJS com regras selecionadas foram preparados; não equivalem ao conjunto completo do SonarQube. |
| R18 | Parcial | Pipelines de Billing e Execution preparados e condicionados ao CI e trava; deploy real não ensaiado. |
| R19 | Completo | Builds independentes nos CIs. |
| R20 | Completo | Testes automatizados nos CIs; BDD de conjunto ainda é executado localmente. |
| R21 | Completo | Lint e cobertura bloqueantes nos CIs; não substituem R17. |
| R22 | Parcial | Manifestos existem; não há deploy Kubernetes efetivo comprovado. |
| R23 | Completo | Regras de main consultadas: PR obrigatório nos três repositórios. |
| R24 | Completo | Checks obrigatórios consultados e atualizados; requerem revisão ao mudar os workflows. |
| R25 | Parcial | Instrumentação OS/Billing/Execution preparada; rastreamento ponta a ponta ainda não demonstrado. |
| R26 | Parcial | Código está em branches/PRs; integração final e versões de entrega pendentes. |
| R27 | Completo | Dockerfile em cada repositório. |
| R28 | Completo | Manifestos em cada repositório; sua aplicação real integra R22. |
| R29 | Parcial | Workflows versionados; publicação/deploy preparados ainda precisam de validação efetiva. |
| R30 | Completo | READMEs apontam ao CI e aos relatórios por SHA; acesso aos repositórios privados precisa ser permitido aos avaliadores. |
| R31 | Parcial | Arquitetura e Saga descritas; falta confrontar a documentação com o deploy final. |
| R32 | Parcial | Swagger/contratos existem; completar e validar o conjunto final de rotas. |
| R33 | Pendente | Vídeo acessível e com até 15 minutos. |
| R34 | Pendente | Demonstração da jornada completa no vídeo. |
| R35 | Pendente | Demonstração de Saga, falha e compensação no vídeo. |
| R36 | Pendente | Demonstração do deploy e testes no vídeo. |
| R37 | Pendente | Demonstração do monitoramento e trace no vídeo. |
| R38 | Pendente | PDF final com participantes e identificadores. |
| R39 | Pendente | PDF final com links dos repositórios acessíveis. |
| R40 | Pendente | PDF final com link do vídeo. |
| R41 | Pendente | PDF final com diagrama coerente com o deploy. |
| R42 | Pendente | PDF final com estratégia de Saga. |
| R43 | Pendente | PDF final com justificativas da divisão e tecnologias. |

## Ainda implementável sem setup externo

Atualização em 5/11/2026: foram acrescentados testes distribuídos de trace e
de recuperação após SIGKILL de Billing e Execution, além de detalhes REST no
Swagger do OS e no OpenAPI de Billing. Esses avanços não encerram os itens 2 a
5 abaixo: a instrumentação real e a Function ainda não foram cobertas no mesmo
trace, a causa da intermitência anterior de reembolso continua desconhecida e
o gate SonarJS usa apenas regras selecionadas. A correção temporária do Multer
removeu o respectivo alerta alto, mas Billing ainda tem alertas altos da cadeia
Prisma/deepmerge-ts e os dois serviços têm alertas moderados.

A evidência de cancelamento divergente em Billing agora gera, atomicamente com
o registro do incidente, evento assinado recebido pelo OS. A Saga passa a
reconciliação sem liberar peças; um cenário distribuído exercitou a falha com
evidência corrompida no banco de teste e broker emulado. A resolução do
incidente segue operacional e os demais casos incertos continuam em revisão.

Em 6/11/2026, uma prova com Function e controller do OS reais, HTTPS e banco
locais confirmou a cadeia W3C usando a instrumentação de produção e detectou
duplicação de `tracestate`, corrigida na Auth. O host Azure, o Kong implantado,
o coletor externo e uma cadeia única entre todos os serviços continuam sem
prova. O workflow manual fixa também o SHA da Auth, mas o repositório ainda
não possui o secret `CROSS_REPO_READ_TOKEN` necessário para executá-lo.

1. Revisar e testar os workflows de publicação e deploy de Billing e Execution
   em mais cenários locais. Estão condicionados ao mesmo SHA aprovado e à trava;
   a validação de rollout real depende de ambiente autorizado.
2. Completar reconciliação operacional para estados ainda ambíguos e cobrir a
   matriz de falhas sem inferir estorno, cancelamento ou liberação por timeout.
3. Completar e provar propagação e spans W3C em todas as fronteiras de OS,
   Billing, Execution e Auth, além das métricas operacionais; validar o trace
   distribuído antes de usar New Relic.
4. Ampliar o BDD pelas APIs HTTP reais e sob interrupção abrupta, além de
   validar o workflow manual de CI e fixar as imagens da combinação final.
   Investigar a intermitência já observada no reembolso: três repetições e a
   suíte limpa passaram, mas a causa da falha anterior não foi identificada.
5. Preparar um analisador estático comparável ao Sonar e seu gate, completar a
   documentação REST e revisar os READMEs/evidências das versões finais.

## Providências externas agrupadas — cerca de 9

1. Decidir ambiente viável sem cobrança indesejada; o Azure atual permanece
   desativado e não deve ser reativado sem essa decisão.
2. Disponibilizar acesso, estado Terraform, quotas, identidades OIDC/workload,
   rede, DNS/HTTPS e secrets para o ambiente escolhido.
3. Configurar credenciais e contas de teste do Mercado Pago, loja/caixa e webhook.
4. Disponibilizar SMTP e New Relic, ou informar os serviços equivalentes.
5. Configurar o ambiente de análise de qualidade e acesso dos avaliadores aos
   repositórios privados; realizar as revisões/aprovações necessárias dos PRs.
6. Autorizar e acompanhar o aceite em Kubernetes no ambiente escolhido,
   inclusive testes reais, isolamento, traces e um deploy demonstrável.
7. Fornecer nomes, identificadores acadêmicos e confirmar o prazo no portal.
8. Gravar e publicar o vídeo com até 15 minutos, verificando o acesso.
9. Revisar o PDF final com dados e links verdadeiros e submetê-lo ao portal.

Essa contagem agrupa configurações relacionadas; não representa nove cliques e
algumas etapas podem ser executadas pelo assistente depois que o acesso e as
decisões necessárias existirem.
