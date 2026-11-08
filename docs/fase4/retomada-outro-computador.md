# Retomada em outro computador

Os repositórios e branches abaixo contêm os trabalhos da Fase 4. As alterações
estão em branches de trabalho e não estão necessariamente mescladas em `main`
ou `development`.

| Repositório | Branch de implementação | Commit conferido |
| --- | --- | --- |
| [soat-api](https://github.com/JoaoGW/soat-api) | `codex/fase4-os` | `2c43647` |
| [soat-billing-service](https://github.com/JoaoGW/soat-billing-service) | `codex/fase4-bootstrap` | `efbffdc` |
| [soat-execution-service](https://github.com/JoaoGW/soat-execution-service) | `codex/fase4-bootstrap` | `49134d1` |
| [soat-auth-function](https://github.com/JoaoGW/soat-auth-function) | `codex/fase4-auth-http` | `a2ecea4` |
| [soat-aks-infra](https://github.com/JoaoGW/soat-aks-infra) | `codex/fase4-plataforma` | `13afb2e` |
| [soat-postgres-infra](https://github.com/JoaoGW/soat-postgres-infra) | `codex/fase4-bancos-servicos` | `34015e7` |
| [FIAP_TechChallenges](https://github.com/JoaoGW/FIAP_TechChallenges) | `codex/fase4-documentacao` | documentação da Fase 4 |

Para clonar uma branch, use `git clone -b NOME_DA_BRANCH URL_DO_REPOSITORIO`.
Se o repositório já existir, execute `git fetch origin` e selecione a branch
remota correspondente, preservando alterações locais que possa haver no outro PC.

O repositório Billing também possui `codex/fase4-dependencias-experimento`, que
contém overrides experimentais de dependências e um teste de compatibilidade.
Essa branch é separada da implementação; consulte `docs/experimento-dependencias.md`
antes de decidir incorporá-la. Os overrides ultrapassam versões declaradas pelos
consumidores e não substituem a validação no ambiente real.

As credenciais e os recursos de Azure, Mercado Pago e demais serviços não estão
nos repositórios. Azure permanece desativado por decisão do responsável; não
reative recursos ou execute deploy sem avaliar custo e configuração. Leia
`progresso-implementacao-fase4.md` e a documentação operacional de cada serviço
para os testes concluídos, limitações e pendências de entrega.
