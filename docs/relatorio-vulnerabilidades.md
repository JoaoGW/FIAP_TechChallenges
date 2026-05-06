# Relatorio de Vulnerabilidades

## 1. Objetivo

Este relatorio apresenta a analise de vulnerabilidades do MVP do sistema da oficina mecanica, cobrindo dependencias Node.js e controles de seguranca aplicados na API.

## 2. Ferramentas utilizadas

- npm audit
- Snyk

## 3. Data da analise

- 2026-05-06

## 4. Escopo analisado

- Dependencias de producao e desenvolvimento
- Configuracao de autenticacao e autorizacao da API
- Validacao global de payloads
- Exposicao de dados em rotas publicas e administrativas

## 5. Resultados do npm audit

Arquivo gerado: `reports/security/npm-audit.json` e `reports/security/npm-audit.txt`.

Status da execucao:
- Falha por ENOSPC (sem espaco em disco no ambiente de execucao)

Contagem preliminar observada durante `npm install`:
- Critical: 0
- High: 11
- Moderate: 18
- Low: 5

## 6. Resultados do Snyk

Arquivos gerados: `reports/security/snyk-report.json` e `reports/security/snyk-report.txt`.

Status da execucao:
- Falha por ENOSPC durante instalacao via `npx snyk`

## 7. Vulnerabilidades encontradas

| Ferramenta | Pacote | Severidade | Descricao | Mitigacao |
|---|---|---|---|---|
| npm audit | (multiplos) | high/moderate/low | Contagem preliminar registrada durante instalacao de dependencias | Executar `npm audit` completo apos liberar espaco e aplicar atualizacoes seguras |
| Snyk | N/A | N/A | Scan nao concluido por falta de espaco em disco | Liberar espaco, autenticar Snyk e rerodar scan |

## 8. Mitigacoes realizadas

- Implementado login administrativo com JWT (`POST /auth/login`)
- Rotas administrativas protegidas por `JwtAuthGuard` real (Passport + strategy JWT)
- Segredo JWT e configuracoes sensiveis movidos para `.env`
- Validacao obrigatoria de variaveis com `@nestjs/config` + Zod
- Senha administrativa armazenada como hash bcrypt (`ADMIN_PASSWORD_HASH`)
- `ValidationPipe` global com:
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `transform: true`
- Swagger configurado com Bearer Auth para rotas administrativas
- Rota publica sem JWT mantida com exposicao minima de dados

## 9. Riscos aceitos

- Scan de vulnerabilidades incompleto por limitacao operacional de disco (ENOSPC) no ambiente local atual.
- Contagem detalhada por pacote e CVE do npm audit/Snyk pendente de nova execucao apos liberacao de espaco.

## 10. Medidas preventivas aplicadas no projeto

- JWT nas rotas administrativas
- Hash bcrypt para senha administrativa
- Variaveis sensiveis em `.env`
- `.env` fora do versionamento
- Validacao global de payloads
- Rejeicao de campos extras
- Swagger com Bearer Auth
- Rota publica com exposicao minima de dados

## 11. Conclusao

O MVP recebeu controles essenciais de autenticacao, autorizacao e validacao de entrada. A superficie de ataque administrativa foi reduzida com JWT e restricao de payload. A etapa restante para fechamento total da analise de seguranca e rerodar `npm audit` e Snyk apos liberar espaco em disco, para consolidar o inventario completo de vulnerabilidades por pacote/CVE.
