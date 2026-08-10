# Especificacao de Desenvolvimento Completo - Escala Inteligente Savegnago

Este documento define o escopo tecnico, a ordem de execucao e as validacoes obrigatorias para evoluir o sistema de escala como produto interno escalavel para multiplas lojas.

O objetivo e permitir desenvolvimento continuo sem interrupcao a cada etapa. Cada fase so deve avancar quando seus criterios de validacao forem atendidos.

## 1. Objetivo do Produto

Criar uma aplicacao web para geracao, edicao, consulta, oficializacao, auditoria e integracao RM de escalas mensais de funcionarios por loja e secao.

O sistema deve:

- Rodar em servidor Linux com Node.js e Oracle.
- Usar Oracle como fonte unica de dados.
- Controlar acesso por usuario, loja e perfil.
- Gerar escalas respeitando regras trabalhistas e regras internas.
- Permitir edicoes manuais auditadas.
- Manter historico por revisao.
- Oficializar escalas e enviar descansos ao RM.
- Suportar operacao para aproximadamente 70 lojas.

## 2. Principios Tecnicos

- O backend e a fonte oficial das regras de negocio.
- O frontend pode validar para melhorar experiencia, mas nunca substitui a validacao do backend.
- Nenhuma credencial deve ser versionada.
- Nenhuma exclusao fisica deve ocorrer em dados operacionais; usar inativacao.
- Toda alteracao de escala, usuario, perfil, permissao ou integracao deve ser auditada.
- Revisoes antigas devem ser preservadas para historico.
- O desenvolvimento deve manter compatibilidade com Oracle e Linux.

## 3. Estado Atual Observado

### Pontos fortes

- Backend Node.js organizado em rotas, servicos e middlewares.
- Oracle integrado por pool de conexoes.
- Autenticacao via JWT e cookie.
- Controle basico de loja por usuario.
- Docker local criado.
- Integracao RM ja possui servico dedicado.
- Auditoria existe.
- Regras basicas possuem alguns testes automatizados.
- Tela de criacao, abertura e escala por funcionario ja existem.

### Riscos atuais

- `public/js/app-original.js` concentra muita responsabilidade.
- Regras estao divididas entre frontend e backend.
- Cobertura de testes ainda baixa para o tamanho do dominio.
- Conceito de revisao mensal versus revisao individual ainda precisa consolidacao.
- Algumas consultas mensais dependem de revisao global, o que pode conflitar com revisoes individuais.
- Historico/auditoria ainda nao registra todos os detalhes necessarios.
- Integracao RM precisa de fila/reprocessamento mais forte.
- Encoding/acento ainda deve ser monitorado.

## 4. Escopo Funcional Final

### 4.1 Login e sessao

- Login por usuario e senha.
- Senha armazenada com hash bcrypt.
- Sessao por cookie JWT.
- Logout.
- Bloqueio por rate limit especifico para login.
- Renovacao ou expiracao clara de sessao.

### 4.2 Controle de acesso

- Cadastro, edicao e inativacao de usuarios.
- Usuario associado a uma ou mais lojas.
- Perfil de acesso com permissoes por pagina e acao.
- Permissoes por acao:
  - visualizar;
  - criar;
  - editar;
  - oficializar;
  - inativar;
  - administrar;
  - reprocessar integracao RM.

### 4.3 Cadastros

- Lojas permitidas por usuario.
- Funcionarios por loja.
- Secoes por loja.
- Turnos por secao.
- Tipos de descanso.
- Horarios padrao.
- Regras vigentes.

### 4.4 Criacao de escala

- Criar escala por loja, mes e ano.
- Impedir duplicidade de escala ativa para mesma loja/mes.
- Permitir selecionar secoes e turnos.
- Permitir criar/editar turno sem sair da criacao.
- Gerar timeline.
- Distribuir funcionarios e folgas.
- Bloquear edicao apos distribuicao ate clicar em Editar.
- Gerar escala detalhada.
- Exibir criticas por funcionario.
- Permitir correcao manual por dia.
- Salvar somente apos validacao sem divergencias.

### 4.5 Abrir e editar escala salva

- Abrir escala mensal por loja/mes.
- Exibir tabs por secao.
- Exibir timeline e escala detalhada da secao.
- Editar pelo dia, nao por celula de horario.
- Aplicar a mesma modal de edicao usada na criacao e escala do funcionario.
- Marcar funcionario com `CRITICA` apos ajuste manual.
- Validar antes de salvar.
- Salvar revisao apenas do funcionario alterado.
- Oficializar nova revisao conforme regra definida.

### 4.6 Escala por funcionario

- Listar funcionarios com escala por loja/mes/ano.
- Abrir escala mensal individual.
- Permitir editar dias.
- Validar regras.
- Salvar revisao individual.
- Imprimir escala com campo `Ciente` apenas na impressao.
- Permitir navegar entre meses disponiveis.

### 4.7 Oficializacao e RM

- Oficializar escala.
- Validar CPF antes de enviar ao RM.
- Buscar dados do funcionario por CPF.
- Obter `CODTABFOLGA` e `CODCOLIGADA`.
- Buscar folgas existentes no RM.
- Comparar RM versus escala.
- Excluir no RM folgas que nao existem mais na escala.
- Inserir no RM novas folgas/ferias.
- Registrar sucesso/falha.
- Permitir reprocessamento.
- Mascarar dados sensiveis nos logs.

### 4.8 Historico e auditoria

- Registrar criacao de escala.
- Registrar edicao de dia.
- Registrar revisao individual.
- Registrar oficializacao.
- Registrar envio RM.
- Registrar falha RM.
- Registrar reprocessamento RM.
- Registrar inativacao.
- Registrar alteracao de usuarios, perfis e permissoes.
- Exibir historico em pagina propria, nao modal.

### 4.9 Impressao

- Impressao da timeline.
- Impressao da escala detalhada.
- Impressao da escala do funcionario.
- Campo `Ciente` deve aparecer apenas na impressao.
- Layout deve caber em A4, preferencialmente paisagem para escala mensal.

## 5. Regras de Escala

As regras devem existir em modulo compartilhavel, mas a validacao final deve ocorrer no backend.

Regras obrigatorias:

- Jornada total padrao de 08:48.
- Intervalo padrao de 01:10.
- Maximo de 6h continuas sem intervalo.
- 5x2 como regra base.
- Domingo 1 sim / 1 nao.
- Interjornada minima de 11h.
- Descanso de 35h apos folga quando aplicavel.
- Ausencias obrigatorias devem bloquear trabalho.
- Ferias devem ser tratadas como descanso.
- Outros descansos devem ser parametrizados por tipo.
- Remover ou desativar regra de 2 folgas seguidas caso exista como bloqueio automatico.

## 6. Modelo de Revisao

### 6.1 Conceito recomendado

A revisao deve ser controlada por funcionario dentro da escala mensal.

Exemplo:

- Escala de setembro criada.
- Todos funcionarios entram na revisao 0.
- Funcionario A alterado.
- Funcionario A recebe revisao 1.
- Demais funcionarios continuam em revisao 0.
- Consulta mensal deve buscar a maior revisao de cada funcionario.

### 6.2 Validacoes obrigatorias

- A revisao antiga do funcionario alterado deve permanecer no banco.
- A revisao nova deve conter todos os dias do funcionario.
- Outros funcionarios nao devem ser copiados para nova revisao.
- A consulta mensal deve combinar a maior revisao por funcionario.
- Historico deve permitir identificar o que mudou.

## 7. Modelo de Oficializacao

Existem duas alternativas tecnicas. A recomendada e separar oficializacao mensal de oficializacao individual.

### 7.1 Alternativa atual

Usar `OFICIALIZADA` em `SGN_ESC_PROG`.

Risco:

- Como `SGN_ESC_PROG` e por funcionario, o status mensal pode ficar ambiguo.

### 7.2 Alternativa recomendada

Criar tabela de controle mensal, por exemplo:

```sql
SGN_ESC_ESCALA_MES
  ESCESCALA_ID
  LOJA
  MES_REF
  STATUS
  OFICIALIZADA
  ATIVA
  DT_HR_INCL
  USUARIO_INCL
  DT_HR_ALT
  USUARIO_ALT
```

Manter `SGN_ESC_PROG` como cabecalho por funcionario/revisao.

## 8. Melhorias Arquiteturais

### 8.1 Frontend

Quebrar `app-original.js` em modulos:

- `apiClient.js`
- `navigation.js`
- `modalService.js`
- `printService.js`
- `escalaCriacaoPage.js`
- `escalaDetalhePage.js`
- `escalaFuncionarioPage.js`
- `funcionariosPage.js`
- `catalogosPage.js`
- `accessPage.js`
- `rmPage.js`
- `rulesClient.js`

Validacao:

- Nenhum arquivo novo de tela deve ultrapassar 800 linhas sem justificativa.
- Funcoes devem ter responsabilidade unica.
- Eventos devem ser registrados no modulo da propria tela.

### 8.2 Backend

Separar melhor dominio:

- `escalaRulesService`
- `escalaRevisionService`
- `escalaOfficializationService`
- `rmQueueService`
- `auditTrailService`

Validacao:

- Rotas devem apenas validar entrada, chamar servico e retornar resposta.
- SQL deve ficar em services/repositories.
- Regras de negocio nao devem ficar dentro da rota.

### 8.3 Banco

Criar pasta formal:

```txt
work/db/migrations
work/db/seeds
work/db/views
```

Validacao:

- Toda alteracao de tabela deve ter migration.
- Toda migration deve ter rollback ou observacao explicita de irreversibilidade.
- README deve indicar migrations obrigatorias.

## 9. Plano de Desenvolvimento por Fases

### Fase 0 - Baseline e saneamento

Objetivo:

- Garantir que branch, testes e estrutura atual estejam estaveis antes de refatorar.

Entregas:

- Rodar testes atuais.
- Conferir branch de desenvolvimento.
- Confirmar que nao ha mocks ativos.
- Confirmar `.env.example`.

Validacoes:

```bash
npm test
node --check src/server.js
node --check public/js/app-original.js
git diff --check
```

Criterio de aceite:

- Todos os comandos passam.
- Nenhum arquivo de mock participa do fluxo produtivo.

### Fase 1 - Regras centralizadas

Objetivo:

- Criar fonte unica de validacao de escala.

Entregas:

- `src/rules/escalaRules.js` revisado.
- Testes cobrindo regras principais.
- Frontend consumindo estrutura compativel.

Validacoes:

- Teste de domingo 1 sim / 1 nao.
- Teste de interjornada 11h.
- Teste de descanso 35h.
- Teste de jornada 08:48.
- Teste de maximo 6h continuas.
- Teste de ferias/folga/outros descansos.

Criterio de aceite:

- Backend rejeita escala invalida mesmo que frontend tente salvar.

### Fase 2 - Revisao individual consolidada

Objetivo:

- Garantir que alteracao de um funcionario nao gere revisao dos demais.

Entregas:

- Servico de revisao individual.
- Consulta mensal por maior revisao de cada funcionario.
- Testes de persistencia.

Validacoes:

- Alterar 1 funcionario.
- Verificar que apenas ele tem nova revisao.
- Verificar que os demais continuam aparecendo na escala mensal.
- Verificar que revisao anterior continua no banco.

Criterio de aceite:

- Nenhum funcionario nao alterado recebe nova revisao.

### Fase 3 - Oficializacao

Objetivo:

- Deixar claro quando escala esta oficializada e quando precisa nova oficializacao.

Entregas:

- Definir se oficializacao sera por `SGN_ESC_PROG` ou tabela mensal.
- Ajustar tela de escalas.
- Ajustar auditoria.

Validacoes:

- Criar escala: oficializada 0.
- Oficializar: oficializada 1.
- Alterar funcionario: nova revisao oficializada conforme regra definida.
- Historico registra oficializacao.

Criterio de aceite:

- Usuario consegue identificar status real sem ambiguidade.

### Fase 4 - Edicao padronizada de dia

Objetivo:

- Usar a mesma modal de edicao em criacao, abrir escala e escala do funcionario.

Entregas:

- Componente unico de modal de dia.
- Tipo do dia: Trabalho ou Descanso.
- Descanso: tipo de descanso.
- Trabalho: Entrada 1, Saida 1, Entrada 2, Saida 2.
- Justificativa obrigatoria.
- Auto calculo pela Entrada 1.

Validacoes:

- Edicao em criacao funciona.
- Edicao em abrir escala funciona.
- Edicao em escala do funcionario funciona.
- Justificativa obrigatoria em todos os fluxos.
- Erro aparece acima do modal.

Criterio de aceite:

- Nao existe fluxo antigo editando diretamente celula de horario.

### Fase 5 - Criticas e bloqueio de salvamento

Objetivo:

- Impedir salvamento sem validacao limpa.

Entregas:

- Botao `CRITICA` por funcionario.
- Modal com lista de criticas.
- Botao salvar oculto ate validacao sem erro.

Validacoes:

- Ajuste manual gera critica.
- Validacao com erro mantem salvar oculto.
- Validacao sem erro mostra salvar.
- Clique em `CRITICA` mostra divergencias.

Criterio de aceite:

- Nenhuma escala invalida e salva pelo fluxo normal.

### Fase 6 - Integracao RM robusta

Objetivo:

- Tornar envio ao RM rastreavel e reprocessavel.

Entregas:

- Validacao de CPF.
- Busca funcionario RM.
- Busca folgas existentes.
- Comparacao escala x RM.
- Delete e POST no RM.
- Logs por etapa.
- Reprocessamento.

Validacoes:

- CPF ausente bloqueia envio.
- Timeout RM registra falha.
- RM indisponivel nao quebra aplicacao.
- Reprocessamento gera novo log.
- Payload nao expoe senha/token.

Criterio de aceite:

- Operador consegue identificar e reprocessar falhas pela tela.

### Fase 7 - Auditoria detalhada

Objetivo:

- Registrar trilha completa de mudancas.

Entregas:

- Valor anterior e novo.
- Funcionario.
- Dia.
- Usuario.
- Loja.
- Mes.
- Revisao anterior e nova.
- Justificativa.

Validacoes:

- Alterar horario registra auditoria.
- Alterar descanso registra auditoria.
- Oficializar registra auditoria.
- Reprocessar RM registra auditoria.
- Alterar permissao registra auditoria.

Criterio de aceite:

- Historico permite reconstruir o que aconteceu.

### Fase 8 - Controle de acesso completo

Objetivo:

- Aplicar permissoes reais por pagina e acao.

Entregas:

- Middleware por permissao.
- Frontend oculta botoes sem permissao.
- Backend bloqueia mesmo que usuario chame API manualmente.

Validacoes:

- Usuario visualizador nao salva.
- Usuario sem loja nao consulta loja.
- Usuario sem permissao de RM nao reprocessa.
- Admin mantem acesso total.

Criterio de aceite:

- Permissao e garantida no backend.

### Fase 9 - Refatoracao frontend

Objetivo:

- Reduzir risco de manutencao do `app-original.js`.

Entregas:

- Separacao incremental por modulos.
- Sem alterar regra funcional.
- Testes manuais por tela.

Validacoes:

- Login.
- Escalas geradas.
- Criacao.
- Abrir escala.
- Escala funcionario.
- Funcionarios.
- Secoes.
- Turnos.
- Tipos de descanso.
- Acessos.
- RM.

Criterio de aceite:

- Funcionalidades preservadas e arquivo principal reduzido.

### Fase 10 - Observabilidade e operacao Linux

Objetivo:

- Facilitar suporte em producao.

Entregas:

- Logs estruturados.
- Request id.
- Health check Oracle.
- Health check RM.
- Documentacao PuTTY atualizada.
- Checklist de deploy.

Validacoes:

- `GET /health` responde.
- Diagnostico Oracle responde autenticado.
- Diagnostico RM informa conectividade sem expor senha.
- Logs mostram rota, usuario e tempo.

Criterio de aceite:

- Falhas comuns podem ser diagnosticadas sem alterar codigo.

## 10. Validacoes Padrao Antes de Cada Commit

Executar:

```bash
node --check src/server.js
node --check public/js/app-original.js
npm test
git diff --check
```

Quando alterar backend:

```bash
node --check src/routes/escalaRoutes.js
node --check src/services/escalaService.js
node --check src/services/catalogService.js
node --check src/services/rmIntegrationService.js
```

Quando alterar CSS/HTML:

- Abrir a tela no navegador.
- Conferir desktop.
- Conferir largura menor.
- Conferir impressao quando aplicavel.

## 11. Validacoes Manuais por Fluxo

### Login

- Login valido entra no sistema.
- Login invalido mostra erro.
- Sessao expirada redireciona para login.

### Escalas geradas

- Carrega automaticamente do banco.
- Filtros funcionam.
- Botao criar escala abre modal.
- Escala duplicada ativa bloqueia criacao.
- Escala inativa nao bloqueia criacao.

### Criacao de escala

- Seleciona loja/mes/ano.
- Seleciona secoes/turnos.
- Cria turno no modal.
- Gera timeline.
- Distribui funcionarios.
- Gera detalhada.
- Edita dia.
- Valida.
- Salva.

### Abrir escala

- Abre escala mensal.
- Exibe tabs por secao.
- Edita por dia.
- Mostra `CRITICA`.
- Valida.
- Salva revisao individual.
- Imprime com `Ciente`.

### Escala por funcionario

- Filtra por loja/mes/ano.
- Abre funcionario.
- Edita por dia.
- Valida.
- Salva revisao individual.
- Imprime com `Ciente`.

### RM

- Oficializacao com CPF ausente bloqueia.
- Oficializacao com RM offline registra falha.
- Reprocessamento chama RM novamente.
- Logs aparecem na tela.

## 12. Criterio de Pronto do Projeto

O projeto so deve ser considerado pronto quando:

- Todas as regras obrigatorias estiverem testadas.
- Revisao individual estiver consistente.
- Oficializacao estiver sem ambiguidade.
- RM tiver log e reprocessamento.
- Auditoria registrar alteracoes relevantes.
- Permissoes forem aplicadas no backend.
- Impressao estiver validada.
- Deploy Linux estiver documentado.
- Docker local estiver funcional.
- Nao houver mock ativo na branch produtiva.

## 13. Protocolo de Execucao Autonoma

Durante o desenvolvimento:

1. Implementar a fase atual.
2. Rodar as validacoes da fase.
3. Corrigir falhas encontradas.
4. Rodar validacoes padrao.
5. Commitar.
6. Enviar para Git.
7. Prosseguir para a fase seguinte.

Nao e necessario parar para pedir autorizacao entre fases, exceto quando:

- houver mudanca destrutiva de banco;
- for necessario alterar credenciais;
- houver decisao funcional ambigua sem criterio neste documento;
- for necessario executar comando externo sensivel no servidor real.

## 14. Ordem Recomendada de Execucao

1. Fase 0 - Baseline e saneamento.
2. Fase 1 - Regras centralizadas.
3. Fase 2 - Revisao individual consolidada.
4. Fase 4 - Edicao padronizada de dia.
5. Fase 5 - Criticas e bloqueio de salvamento.
6. Fase 3 - Oficializacao.
7. Fase 6 - Integracao RM robusta.
8. Fase 7 - Auditoria detalhada.
9. Fase 8 - Controle de acesso completo.
10. Fase 9 - Refatoracao frontend.
11. Fase 10 - Observabilidade e operacao Linux.

Esta ordem prioriza primeiro a corretude da escala e depois a manutencao/operacao.
