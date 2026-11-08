# Retomada em outro computador

Os repositórios e branches abaixo contêm os trabalhos da Fase 4. As alterações
estão em branches de trabalho e não estão necessariamente mescladas em `main`
ou `development`.

| Repositório | Branch de implementação | Commit conferido | PR |
| --- | --- | --- | --- |
| [soat-api](https://github.com/JoaoGW/soat-api) | `imp/fase4-os-service` | `4d1ddcb` | [#15](https://github.com/JoaoGW/soat-api/pull/15) |
| [soat-billing-service](https://github.com/JoaoGW/soat-billing-service) | `imp/fase4-billing-service` | `abf5fb5` | [#2](https://github.com/JoaoGW/soat-billing-service/pull/2) |
| [soat-execution-service](https://github.com/JoaoGW/soat-execution-service) | `imp/fase4-execution-service` | `0cf7b65` | [#2](https://github.com/JoaoGW/soat-execution-service/pull/2) |
| [soat-auth-function](https://github.com/JoaoGW/soat-auth-function) | `imp/fase4-auth-http` | `a2ecea4` | [#25](https://github.com/JoaoGW/soat-auth-function/pull/25) |
| [soat-aks-infra](https://github.com/JoaoGW/soat-aks-infra) | `imp/fase4-plataforma` | `13afb2e` | [#26](https://github.com/JoaoGW/soat-aks-infra/pull/26) |
| [soat-postgres-infra](https://github.com/JoaoGW/soat-postgres-infra) | `imp/fase4-bancos-servicos` | `34015e7` | [#8](https://github.com/JoaoGW/soat-postgres-infra/pull/8) |
| [FIAP_TechChallenges](https://github.com/JoaoGW/FIAP_TechChallenges) | `docs/fase4-documentacao` | documentação da Fase 4 | — |

Para clonar uma branch, use `git clone -b NOME_DA_BRANCH URL_DO_REPOSITORIO`.
Se o repositório já existir, execute `git fetch origin` e selecione a branch
remota correspondente, preservando alterações locais que possa haver no outro PC.

Os overrides de dependências da antiga branch experimental de Billing
(`imp/fase4-dependencias-billing`) foram incorporados a `imp/fase4-billing-service`;
a branch experimental permanece apenas como referência histórica.

As credenciais e os recursos de Azure, Mercado Pago e demais serviços não estão
nos repositórios. Azure permanece desativado por decisão do responsável; não
reative recursos ou execute deploy sem avaliar custo e configuração. Leia
`progresso-implementacao-fase4.md` e a documentação operacional de cada serviço
para os testes concluídos, limitações e pendências de entrega.
