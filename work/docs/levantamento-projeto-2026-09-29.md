# Levantamento do projeto Escala Inteligente

Data: 29/09/2026. Base analisada: branch `Escala-2.0`, commit `2108efa`.

## Escopo e limites

Revisão do código de frontend, API, serviços, regras, autenticação, autorização, integração RM, estrutura Oracle versionada, migrations, testes e documentação de implantação. As imagens fornecidas na conversa também orientaram a avaliação de usabilidade.

`npm test`: 78 testes aprovados, sem falhas. Foi feita uma reprodução adicional, em memória, da reconciliação RM na passagem de mês, sem conexão ao banco.

O servidor em `localhost:3000` estava indisponível. Não foram executados fluxos autenticados no navegador, testes de carga, consultas ao Oracle de produção ou chamadas reais ao RM. A avaliação visual é baseada no HTML/CSS e nas imagens, e não constitui uma auditoria completa de acessibilidade. Nenhuma regra de negócio ou dado operacional foi alterado neste levantamento.

Classificação: **confirmado** significa comportamento identificado diretamente no código ou reproduzido isoladamente; **risco** significa possibilidade sustentada pelo código que exige teste integrado; **proposta** significa evolução recomendada. P1 indica prioridade alta, P2 média e P3 evolução posterior. Esforços são relativos: pequeno, médio ou grande, não estimativas de prazo.

## Diagnóstico principal

O sistema já cobre boa parte da operação: liberação, geração, subseções, fixos, ausências, edição individual, impressão, perfis e integração. O principal investimento agora deve ser a consistência entre esses fluxos.

Os sintomas relatados como cache podem ter origens distintas: consultas com períodos diferentes, cadastro atual aplicado sobre dados históricos, versões de schema, cópias de estado no navegador, concorrência e falhas convertidas em listas vazias. Forçar logout não corrige essas causas.

Recomendo evoluir o monólito atual por módulos, preservando Node.js e Oracle. Não há evidência nesta revisão que justifique o custo de uma migração para microsserviços ou de uma reescrita completa da interface.

## Achados prioritários

### 1. RM e escala utilizam períodos diferentes — P1, confirmado

**Evidência:** `src/routes/escalaRoutes.js:696` consulta o RM entre `mesRef` e `getMonthEndIso(mesRef)`. `src/services/rmIntegrationService.js:511` também usa início e fim do mês civil. A geração usa primeira segunda-feira até o domingo anterior à primeira segunda-feira seguinte, em `src/services/monthlyReleaseService.js:57`.

**Impacto:** outubro/2026 corresponde a 05/10–01/11, mas a integração consulta 01/10–31/10. A reconciliação em `src/services/escalaService.js:1846` converte uma folga `F` em trabalho se ela não estiver na resposta do RM, sem distinguir data fora do intervalo consultado. Na reprodução em memória, uma folga em 01/11 tornou-se `TRB` ao receber uma lista vazia. Isso demonstra o efeito da reconciliação; não comprova quais registros produtivos foram afetados. A sincronização de saída também pode comparar/remover eventos de 01–04/10, que pertencem ao período operacional anterior.

**Melhoria:** um único contrato de período operacional, compartilhado entre geração, consultas, integração e impressão. Informar início/fim efetivamente consultados e reconciliar somente dentro deles. Fora desse intervalo, preservar os dados. Diferenciar resposta vazia válida de consulta incompleta ou falha.

**Aceite:** gerar outubro, sincronizar repetidamente e preservar 01/11; não alterar 01–04/10 de setembro; testar também dezembro/janeiro e meses com cinco semanas. Esforço médio.

### 2. Redistribuição individual altera dias protegidos no rascunho — P1, confirmado

**Evidência:** `public/js/app-original.js:4836`, função `distribuirFolgasFuncionario`, redefine todos os dias futuros como `TRB` antes de distribuir folgas, sem excluir férias, afastamentos e fixos. O botão continua presente em `views/app-original.html:725`.

**Impacto:** a tela pode substituir ausências e compromissos fixos por trabalho/folga. A rota de salvamento individual valida ausências (`src/routes/escalaRoutes.js:558`), portanto não se pode concluir que toda alteração incorreta será persistida; o usuário ainda pode receber um rascunho inválido e erro posterior.

**Melhoria:** fazer essa ação usar o mesmo serviço da geração individual/seção, com os mesmos dias protegidos, jornada do aprendiz e cálculo de cobertura. Eliminar o segundo algoritmo de distribuição.

**Aceite:** a ação preserva férias, afastamentos, fixos e dias passados; nenhum outro funcionário muda; aprendiz mantém 05:15. Esforço médio.

### 3. Edições simultâneas não têm controle explícito de versão — P1, risco

**Evidência:** `src/services/escalaService.js:1624` lê a programação e substitui seus dias na mesma revisão. Em `:1688`, a criação de revisão usa o máximo atual mais um. Nos caminhos examinados não há versão esperada no comando nem bloqueio explícito de leitura para serializar a operação.

**Impacto:** duas sessões podem preparar alterações a partir do mesmo estado. A última gravação pode sobrescrever a anterior; na criação de revisão, uma restrição produtiva pode converter a disputa em erro de unicidade. As transações existentes são importantes, mas não detectam sozinhas que o usuário editou uma versão desatualizada.

**Melhoria:** separar revisão funcional de versão técnica de gravação. Enviar `expectedVersion`, atualizar condicionalmente e responder conflito quando houver mudança concorrente. Definir bloqueio e unidade transacional por loja, período e escopo afetado. Adotar identificador de operação para repetição segura após timeout.

**Aceite:** duas sessões editam o mesmo funcionário; a segunda recebe conflito identificável, sem perda silenciosa. Alterações em subseções diferentes preservam ambas. Esforço grande.

### 4. Cadastro de permissões pode não representar o acesso efetivo — P1, confirmado

**Evidência:** `src/services/accessService.js:104` usa `Math.max` entre permissões cadastradas e padrões por perfil. Um zero explícito pode virar um. Além disso, o padrão concede oficialização a Gerente/RH/Controladoria, enquanto a rota exige Admin em `src/routes/escalaRoutes.js:454`.

**Impacto:** desmarcar uma permissão pode não revogá-la; a configuração de perfil e a autorização real podem divergir. A restrição Admin na rota continua vigente, apesar da permissão declarada.

**Melhoria:** definir uma única política com ação e escopo: perfil, lojas, seções e subseções. Padrões devem preencher valores ausentes, não sobrepor recusas explícitas. Restrições temporárias, como oficialização exclusiva de Admin, devem aparecer nessa política e na administração.

**Aceite:** testar Admin, Líder, RH, Gerente e Controladoria por ação e por loja, inclusive acesso negado via API. Esforço médio.

### 5. Histórico indisponível aparece como histórico vazio — P1, confirmado

**Evidência:** `src/services/escalaService.js:791` retorna `[]` para falhas consideradas recuperáveis. A rota em `src/routes/escalaRoutes.js:368` retorna HTTP 200 com `indisponivel: true` para outras falhas. A tela em `public/js/app-original.js:4312` usa somente `data.historico`, ignorando esse indicador.

**Impacto:** o operador pode interpretar falha técnica como ausência de alterações. A mudança recente evita o erro 500 visível, mas não garante a disponibilidade do histórico.

**Melhoria:** estados distintos de carregando, vazio, indisponível e disponível. Preservar `requestId` nos logs e na mensagem de erro. Corrigir o contrato de auditoria/schema, sem transformar incompatibilidade de banco em sucesso aparente.

**Aceite:** falha de Oracle exibe indisponibilidade e opção de tentar novamente; consulta válida vazia exibe ausência de registros. Esforço pequeno/médio.

### 6. Auditoria pode falhar separadamente da alteração — P1, confirmado

**Evidência:** `src/services/auditService.js:89` abre outra conexão, confirma a auditoria separadamente e absorve erros. `compactDetails`, em `:40`, trunca os detalhes em 1.000 caracteres. Algumas operações auditam depois de salvar a escala.

**Impacto:** é possível alterar a escala e perder o registro da ação. Mudanças extensas podem perder detalhes de antes/depois, limitando a investigação.

**Melhoria:** para alterações críticas, gravar evento estruturado na mesma transação da escala, ou gravar uma pendência durável nessa transação. Guardar autor, instante, escopo, motivo, origem, versão e diferenças completas; renderizar um resumo na tela. Alertar quando a auditoria estiver indisponível.

**Aceite:** falha provocada na auditoria não produz uma alteração sem rastreabilidade; diferenças extensas podem ser consultadas integralmente. Esforço médio/grande.

### 7. Oficialização e envio ao RM possuem confirmações separadas — P1, risco

**Evidência:** `src/routes/escalaRoutes.js:470` oficializa no Oracle antes de chamar o RM. `src/services/rmIntegrationService.js:218` repete requisições após falhas, inclusive escritas, sem política diferenciada por método/status. A integração já possui logs, contagem de falhas e reprocessamento, que devem ser aproveitados.

**Impacto:** a escala pode estar oficializada localmente com envio parcial. Um timeout após o RM aceitar uma escrita deixa o resultado incerto; repetir pode duplicar a tentativa. Isso não prova duplicação no RM, cuja semântica precisa ser validada.

**Melhoria:** separar estado de aprovação de estado de sincronização. Persistir uma fila de envio na transação local; processar por funcionário/operação com tentativas controladas, reconciliação e resultado consultável. Uma fila no próprio Oracle é uma opção inicial. Não é necessário adicionar outro serviço de infraestrutura de imediato.

**Aceite:** simular timeout, envio parcial e reinício; retomar apenas pendências, sem mudar silenciosamente a revisão enviada. Esforço grande.

### 8. Migrations e implantação podem produzir ambientes diferentes — P1, confirmado

**Evidência:** existem 24 arquivos em `db/migrations` e 22 em `docker/oracle/migrations`. Os arquivos `20260921_fiscal_remoto_escopo_lider.sql` e `20260921_inativar_transporte_aereo_loja_999.sql` estão somente na primeira pasta. O README orienta migrations pela segunda. Não foi encontrado um executor versionado de migrations nos scripts npm. A documentação de deploy usa `/opt/escala-app`, enquanto a operação relatada usa `/opt/escala-app/work`.

**Impacto:** seguir instruções diferentes pode deixar regras/cadastros distintos entre ambientes e causar os erros de comando ou schema já relatados. Não foi verificado o conjunto efetivamente aplicado em produção.

**Melhoria:** pasta única de migrations, registro de aplicação com checksum, comando de diagnóstico pré-deploy, versão mínima de schema e roteiro único para Linux sem Docker. Separar DDL, correções pontuais de dados e seeds de teste. Para Oracle, planejar recuperação de DDL com backup/compensação, sem presumir rollback transacional de toda migration.

**Aceite:** banco novo e banco atualizado chegam ao mesmo contrato; implantação acusa pendências antes de receber usuários. Esforço médio/grande.

## Arquitetura e organização

### 9. Dividir responsabilidades do frontend — P2, confirmado/proposta

`public/js/app-original.js` possui 10.162 linhas; `public/css/app-original.css`, 5.523. Os módulos de página existentes ainda incluem adaptadores que apenas repassam funções do arquivo central, como `public/js/escala-criacao-page.js`.

Extrair progressivamente contexto/navegação, consulta de escala, edição, subseções, impressão e administração. Cada módulo deve possuir seu estado, eventos e renderização. Manter o funcionamento de uma tela por vez durante a extração; remover os caminhos antigos somente após mapear seus consumidores. Uma troca de framework não é requisito para iniciar.

### 10. Unificar contratos de domínio — P2, confirmado/proposta

O período operacional é calculado no frontend e em dois serviços. Regras de jornada/distribuição aparecem em `src/rules/escalaRules.js`, `monthlyReleaseService.js`, `public/js/escala-rules-core.js` e no arquivo central. Há conversões repetidas entre campos Oracle em maiúsculas e propriedades JavaScript.

Criar contratos explícitos para período, dia de escala, jornada, vínculo e crítica. O backend decide o resultado final; a interface usa a mesma definição para a pré-validação. Padronizar horários como minutos no domínio e datas civis como `YYYY-MM-DD`, deixando formatação e fuso nas fronteiras. Versionar regras e registrar qual versão gerou/validou a programação.

Preservar as regras aprovadas através de testes de caracterização antes de mover funções. Mudança de arquitetura não deve introduzir novas regras de folga ou jornada.

### 11. Definir histórico de vínculo e precedência de horários — P2, risco/proposta

`src/services/escalaService.js:1092` incorpora cadastro atual ao consultar a escala mensal, inclusive seção e subseção. `catalogService.js:381` pode obter horários de um dia da escala e combiná-los com horários cadastrais.

Isso merece um contrato explícito: horário cadastral/padrão, exceção de um dia e programação já publicada são conceitos diferentes. Transferências precisam de vigência; relatórios históricos devem identificar a alocação válida na data. A regra de usar `DT_DEMISS IS NULL` para disponibilidade atual não deve apagar a participação do funcionário em períodos históricos.

Proposta: histórico de alocação por início/fim, origem dos eventos (`RM`, cadastro, manual, geração) e precedência documentada. Migração de registros sem origem deve classificá-los como legados, sem inventar autoria.

### 12. Tornar consultas proporcionais ao volume — P2, confirmado/risco

`src/services/escalaService.js:2013` consulta ausências uma vez para cada dia trabalhado de cada funcionário. Uma validação com 100 funcionários e 20 dias trabalhados pode executar 2.000 consultas apenas nessa etapa. Autenticação também consulta usuário, schema, lojas e permissões em cada requisição.

Buscar ausências por lote/período, indexar em memória durante a operação e padronizar cache de metadados. Medir antes de adicionar índices; examinar planos Oracle das consultas reais por loja/período/funcionário/revisão. Usar paginação para consultas extensas; a listagem de usuários já tem um caminho paginado, que pode orientar as demais.

Metas devem ser definidas a partir de uma linha de base: tempo p95, número de consultas, uso do pool, tamanho da resposta e duração da geração. Não há medição produtiva neste levantamento.

### 13. Separar tarefas longas da requisição HTTP — P2, risco/proposta

O agendador mensal usa `setInterval` e controles em memória em `src/services/monthlyReleaseService.js:1347`. Reinícios apagam esse controle; múltiplos processos têm controles independentes. Uma indisponibilidade no horário programado pode impedir a execução daquele horário.

Persistir execução, escopo, progresso, tentativas e último resultado; usar trava compartilhada e retomada. O comando manual e o automático devem chamar o mesmo caso de uso. Na interface, apresentar andamento e resultado por seção, sem depender de manter uma requisição longa aberta.

### 14. Melhorar atualização de versão, sessão e diagnóstico — P2, confirmado/proposta

`src/server.js:33` calcula versão a partir dos horários de modificação dos arquivos de frontend; mudanças somente no backend não entram nessa identificação, salvo versão informada externamente. `public/js/app-original.js:2410` recarrega a página automaticamente quando detecta mudança. `/health` responde positivamente sem consultar a saúde atual do banco.

Usar identificador de release baseado no commit, build reproduzível, assets versionados e compatibilidade API/schema. Avisar sobre atualização preservando alterações não salvas, filtros e contexto. Separar verificação de processo vivo de prontidão para operar com Oracle.

A expiração de sessão já existe; o padrão em `src/config/env.js` é quatro horas, e Docker configura JWT de oito horas separadamente. Unificar essas configurações e considerar revogação por sessão/usuário para suporte. Logout periódico é controle de sessão, não mecanismo de correção de dados.

### 15. Consolidar autenticação e vínculo com lojas — P2, confirmado/proposta

`src/services/authService.js:147` prioriza loja inferida do login/nome e pode atualizar a loja principal durante a resolução de sessão. A inferência verifica se a loja já está permitida, portanto não equivale a conceder uma loja arbitrária. Ainda assim, pode sobrepor uma preferência cadastral válida ou restringir um usuário com vários vínculos.

Usar vínculos explícitos como autoridade. Deixar inferência por nome somente em diagnóstico/correção assistida de legado. Mostrar no cadastro e no suporte o acesso efetivo e sua origem.

Já existem bcrypt, upgrade de MD5 após login, cookie HttpOnly, validação JWT, CSRF e rate limiting. Preservar essas proteções. O código atual examinado não contém a senha mestra solicitada anteriormente; para suporte, preferir acesso delegado temporário com registro de ator e usuário representado.

### 16. Remover contratos legados enganosos — P2, confirmado

`src/services/stateService.js` responde `ok: true, persisted: false` para gravações ignoradas. Antes de remover, identificar consumidores e substituir por persistência real de preferências ou resposta explícita de operação descontinuada. Configuração de tela e escala oficial devem ter contratos diferentes.

## Funcionalidade e design

As propostas abaixo tratam a aplicação como ferramenta operacional: informação densa, legível, ações previsíveis e pouca navegação desnecessária.

| Área | Melhoria proposta | Critério de validação |
|---|---|---|
| Contexto da escala | Cabeçalho persistente com loja, período real, seção, subseção, versão e situação da gravação. | Gerar/resetar/editar mantém a subseção e a posição de rolagem; voltar/avançar recupera o contexto. |
| Escopo das ações | Botões nomeados conforme alvo, como “Gerar Caixa”, com quantidade de funcionários e período afetado nas confirmações. | Usuário identifica se altera um funcionário, uma subseção ou toda a seção antes de confirmar. |
| Situação operacional | Mostrar separadamente liberada, gerada, pendente de salvar, oficializada e sincronização RM. Resumo por subseção com autor/data da última geração. | Admin distingue escala ainda não gerada, falha de consulta e escala sem funcionários. |
| Grade | Primeira coluna e cabeçalho fixos, semanas bem demarcadas, seleção de data completa e opção de densidade. | Último funcionário e última semana permanecem operáveis; nomes completos acessíveis sem ampliar a página. |
| Críticas | Painel filtrado pelo escopo com contagem, motivo, regra, funcionário e data; clicar leva à célula. Separar impedimentos de alertas de cobertura. | Crítica de Caixa não contamina Menor Aprendiz; o sistema explica uma geração inviável. |
| Menu do funcionário | Um componente reutilizável com posicionamento ajustado à janela, fechamento ao selecionar e ações derivadas da política. | Funciona no último registro, com rolagem, teclado e aprendiz; não altera a posição da grade. |
| Cores | Tokens únicos: azul para folga, roxo para fixos, amarelo para ausência; crítica com indicador adicional. | Legenda e siglas permitem entender o dado em impressão monocromática e sem depender só da cor. |
| Edição de horário | Formulário compacto com jornada calculada e escolha explícita do alcance temporal permitido. | Exibe 08:48/05:15 conforme regra vigente; a atualização aparece na consulta e impressão correspondentes. |
| Subseções | Preservar lista/detalhe e “Sem subseção”; mostrar ativos/inativos e quantidade de alocados; transferências com vigência visível. | Remover vínculo mantém funcionário localizável; mudança futura não reclassifica silenciosamente o passado. |
| Impressão | Um modelo de dados para prévia e saída; layouts específicos por modo com paginação planejada, identificação, assinatura e período real. | Semanal com dois colaboradores por página; tabelas não partidas; dias, horários e seleção iguais aos da prévia. |
| Dashboard Admin | Data e filtros claros, indicadores com fórmula conhecida, última atualização e links para as pendências. | Total, presentes, folgas e ausências são reconciliáveis; “sem programação” não vira presença por suposição. |
| Mensagens | Diferenciar sem dados, sem permissão, indisponibilidade, conflito e operação parcial. | Falha não aparece como sucesso nem como lista vazia. |
| Acessibilidade | Rótulos, foco visível, gerenciamento de foco em modal, Escape e navegação por teclado. | Fluxos de consulta/edição operáveis sem mouse; verificar contraste e zoom em navegador. |

O serviço de modal examinado não centraliza confinamento/restauração de foco e tratamento de Escape. O CSS contém muitas sobreposições de impressão com `!important`, e há templates de saída tanto no serviço de impressão quanto no arquivo central. Isso reforça a necessidade de componentes e estilos específicos por responsabilidade.

O HTML carrega Tailwind via CDN e fontes/ícones externos; o servidor desativa CSP. Gerar CSS no build e servir os recursos necessários localmente permite reduzir dependência externa e implantar CSP compatível com os componentes. Não foi realizada exploração de XSS; o uso de HTML dinâmico exige revisão de escape por contexto.

## Arquitetura-alvo incremental

```text
Interface por funcionalidade
  contexto de navegação + estado de edição + componentes comuns
                         |
API com contratos explícitos e autorização por ação/escopo
                         |
Casos de uso: liberar, gerar, editar, transferir, resetar, publicar
                         |
Domínio: período operacional, jornada, ausência, cobertura, revisão
                         |
Repositórios Oracle + auditoria transacional + fila de integração RM
```

Começar extraindo período operacional e política de autorização, depois persistência/revisões e impressão. A migração de cada fluxo deve preservar entradas e saídas verificadas por testes. O núcleo de regras deve aceitar dados explícitos de entrada, sem depender de DOM, conexão Oracle ou estado global.

## Verificação e qualidade

Os 78 testes dão uma base útil para jornadas, distribuição, semanas operacionais, reset com ausências, aprendiz, erros e integração. Parte dos testes substitui serviços ou verifica SQL montado, o que não comprova execução nas versões Oracle de produção.

Não foi encontrado pipeline de CI versionado no checkout. Existem scripts de smoke que gravam dados; não foram executados durante esta revisão.

Adicionar progressivamente:

1. Testes Oracle isolados: constraints, tipos/precisões, migrations, transações e consultas do histórico.
2. Concorrência: duas sessões, duplo clique, repetição após timeout e duas subseções no mesmo período.
3. Fluxos de navegador por perfil: login, loja correta, geração, reset, edição e manutenção de contexto.
4. RM simulado: passagem de mês, resposta incompleta, timeout após aceite, erro parcial e reprocessamento.
5. Impressão: PDFs de referência com dois colaboradores por página, nomes longos, quatro/cinco semanas e virada de ano.
6. Regressões de domínio: aprendizes, férias, três folgas manuais pós-férias, transferências e isolamento de críticas.
7. Deploy: banco novo e atualizado, smoke em ambiente de homologação, release identificável e recuperação ensaiada.

## Sequência recomendada

| Etapa | Entregas | Condição para avançar |
|---|---|---|
| 1. Consistência operacional | Corrigir período RM, redistribuição individual, histórico indisponível e permissões efetivas. | Casos de regressão reproduzidos e corrigidos, com validação Oracle/RM de homologação. |
| 2. Proteção das gravações | Versão técnica, concorrência, revisão por escopo, auditoria confiável e resultado de integração separado. | Testes de duas sessões e recuperação de falha sem perda de outras escalas. |
| 3. Publicação previsível | Migrations únicas, diagnóstico de schema, roteiro Linux correto, release por commit e CI. | Instalação nova e atualização reproduzíveis. Pode iniciar em paralelo com a etapa 1. |
| 4. Interface e impressão | Contexto persistente, componentes, críticas navegáveis e modelos únicos de impressão. | Fluxos por perfil e PDFs validados visualmente em tamanhos distintos. |
| 5. Escala operacional | Consultas em lote, tarefas duráveis, métricas e otimização por medição. | Volume representativo das lojas atende às metas acordadas. |

Antes de estimar calendário, confirmar versão do Oracle produtivo, processo de deploy realmente utilizado, volume simultâneo de usuários, ambiente de homologação RM e fluxo definitivo de oficialização por escopo. Essas informações refinam o plano, mas não impedem iniciar as correções confirmadas da primeira etapa.

## Pontos essenciais levantados pelos usuários

Os pontos abaixo passam a ser requisitos da evolução e devem ser tratados antes ou durante a migração para React. A migração da interface não corrige esses comportamentos sozinha; os contratos de persistência e domínio precisam ser acertados primeiro.

### 1. Rascunho que reaparece zerado

Há dois fluxos com nomes semelhantes. O fluxo atual de criação salva a escala pelo endpoint Oracle `/api/escalas`, mas o código legado ainda possui `salvarEscalasNoStorage`, que chama `/api/state/escalas`. Esse endpoint responde `ok: true`, porém declara `persisted: false` e não grava o conteúdo. Qualquer tela que ainda passe por esse caminho pode comunicar sucesso sem garantir recuperação posterior.

Também existe risco de uma consulta posterior selecionar outra revisão ou outro recorte, fazendo uma gravação real parecer perdida. Portanto, a correção não deve se limitar a guardar o rascunho no navegador.

**Decisão:** criar rascunho persistente no Oracle, identificado por loja, período operacional, seção/subseção, usuário e versão técnica. O salvamento deve retornar a versão confirmada e a tela deve reler essa versão antes de exibir sucesso. Alterações locais recebem estado explícito: `não salvo`, `salvando`, `salvo em <hora>` e `conflito`. Salvar rascunho não oficializa nem dispara RM.

**Proteção adicional:** recuperação automática após queda de sessão/navegador, aviso ao sair com alterações pendentes e controle de concorrência para impedir sobrescrita silenciosa.

### 2. Horário único do colaborador

Hoje o sistema já possui uma rota que atualiza o cadastro do funcionário e os dias futuros de uma escala informada (`/api/escalas/funcionario/horario`). Porém ainda existem telas que atualizam diretamente o cadastro e edições de dias que não passam pelo mesmo contrato. Isso permite divergência.

**Decisão:** horário-base do colaborador será a fonte única para novas gerações. Toda edição de horário, partindo da escala ou da tela do funcionário, chamará o mesmo caso de uso. A alteração terá vigência definida e atualizará:

- o horário-base usado nas próximas gerações;
- os dias de trabalho ainda editáveis da escala atual, quando essa opção fizer parte da ação;
- consultas e impressão, que devem ler a programação persistida da revisão ativa.

Dias passados e descansos protegidos não serão reescritos. Horário pontual de um dia será tratado como exceção do dia e não substituirá silenciosamente o horário-base. Para aprendiz, a jornada fixa de 05:15 continua controlada pela regra vigente.

### 3. Afastados ou transferidos ainda presentes por atraso do RM

A tela atual inativa um funcionário preenchendo `DT_DEMISS` com a data de hoje. Isso é semanticamente incorreto para afastamento ou atraso de sincronização e pode ser desfeito ou conflitar com a próxima carga do RM.

**Decisão:** manter o RM como fonte oficial de cadastro e criar uma camada operacional local separada, sem falsificar demissão. O colaborador poderá receber uma suspensão da escala com motivo, início, fim opcional, autor e status de reconciliação. Exemplos: `aguardando RM`, `transferido`, `afastamento pendente`.

O bloqueio local retira o colaborador de novas gerações e sinaliza o impacto em escalas já existentes. Quando o RM confirmar a mudança, a pendência é conciliada automaticamente. Ações manuais ficam restritas aos perfis definidos e sempre auditadas.

Diminuir o job para poucos minutos não é a primeira escolha: aumenta carga e ainda não resolve indisponibilidade ou atraso na origem. A melhor combinação é manter carga periódica, permitir sincronização sob demanda e usar a pendência local com prazo. A frequência final deve ser definida após medir custo e tempo do job.

### 4. Novos funcionários e transferências ainda não recebidos

Não é recomendável liberar cadastro manual completo como fluxo normal, pois ele pode gerar identificadores, CPF, lotação ou função divergentes do RM.

**Decisão:** oferecer `Atualizar funcionários agora` por loja e, quando houver chave segura, por colaborador. A interface mostrará última sincronização, resultado, registros incluídos, alterados, inativados e pendentes. Novos funcionários entram na área `Sem subseção` até serem alocados quando necessário.

Como contingência, Admin/RH poderá criar uma inclusão temporária vinculada a uma referência do RM, com prazo, justificativa e auditoria. O registro temporário deve ser reconciliado com o cadastro oficial em vez de criar uma segunda pessoa.

### 5. Editor único para horário, folga e fixos

As validações de jornada aparecem em vários pontos do frontend e backend. Algumas exigem períodos menores que seis horas, total de 08:48 e intervalo mínimo de 01:10, mas os formulários e mensagens não são uniformes.

**Decisão:** criar um componente de jornada compartilhado pela escala e cadastro do funcionário, sustentado por um único validador no backend. O formulário exibirá em tempo real primeiro período, intervalo, segundo período e total. O usuário escolhe o alcance da alteração e vê quais dias serão afetados antes de confirmar.

Folga normal, folga fixa, horário fixo, férias e afastamento terão operações distintas. Férias e afastamento serão somente leitura quando vierem do sistema. O mesmo contrato de validação atenderá edição individual, geração e salvamento em lote.

### 6. Tour de primeiro acesso e treinamento prático

É possível criar o tour, mas apenas destacar botões na base real é insuficiente para ensinar geração e oferece risco operacional.

**Decisão:** implementar um `Modo Treinamento` com loja, funcionários e período fictícios, isolado das tabelas produtivas e da integração RM. O guia terá etapas por perfil e pedirá ações reais no ambiente simulado: escolher loja, abrir período, selecionar seção, gerar, corrigir uma crítica, salvar rascunho e concluir.

O sistema persistirá versão do tutorial, etapas concluídas, opção de retomar e acesso posterior pela ajuda. Tours curtos de contexto podem aparecer na primeira visita a cada tela, mas o treinamento completo será uma experiência própria. Na migração React, menus e alvos terão identificadores estáveis para que mudanças de layout não quebrem o guia.

### 7. Estratégia de branches

Estado verificado em 29/09/2026:

- `Escala-2.0` contém integralmente `Escala-Dev` e `codex/oracle-integration`;
- a `main` antiga possui dois commits exclusivos de junho que corrigem `SGN_ESC_FUNC` para `SGN_ESC_FUNCIONARIO`; o código equivalente já está correto na `Escala-2.0`;
- `origin/HEAD` já aponta para `main`.

**Decisão:** preservar a história da `main` antiga em um merge de ancestralidade, promover o conteúdo da `Escala-2.0` para `main`, criar `homologacao` a partir dela e remover as branches antigas após publicação. O fluxo passa a ser:

```text
feature/* -> homologacao -> main
```

`main` representa produção. `homologacao` recebe as mudanças do levantamento. Correções urgentes partem de `main`, são publicadas nela e depois incorporadas à homologação. Recomenda-se proteger `main` contra push direto após esta reorganização.

### 8. Visão consolidada das alterações dos colaboradores

A auditoria atual registra várias ações, mas usa texto compacto de até 1.000 caracteres, pode falhar separadamente da alteração e não fornece um modelo adequado para consolidar diferenças por colaborador.

**Decisão:** criar eventos estruturados e transacionais. Cada evento terá loja, período, seção/subseção, colaborador, data afetada, ação, origem, antes/depois, autor, instante, versão/revisão e situação da escala naquele momento (`criação`, `rascunho`, `oficializada`, `pós-oficialização`). Alterações em lote possuirão um identificador comum de operação.

A nova tela oferecerá:

- indicadores de colaboradores alterados, alterações antes e depois da oficialização e pendências RM;
- filtros por loja, período, seção, subseção, colaborador, autor, ação e origem;
- linha do tempo por colaborador, com antes/depois e justificativa;
- destaque para edições unitárias, mudança de horário, transferência, suspensão e regeneração;
- exportação do resultado filtrado e acesso direto à escala afetada.

O evento deve ser gravado na mesma transação da alteração. A tela não deve reconstruir o histórico comparando apenas o estado atual, pois isso perde autoria e contexto.

## Plano ajustado para React e estabilização

| Fase | Entregas principais |
|---|---|
| 0. Segurança dos dados | Rascunho persistente, controle de concorrência, período RM correto, horário único e eventos estruturados. |
| 1. Base React | TypeScript, navegação, sessão, política de acesso, biblioteca visual, tratamento de consultas e testes de componentes. |
| 2. Primeiro fluxo React | Escalas Liberadas, abertura da escala e editor padronizado de horário; interface antiga continua disponível para os fluxos ainda não migrados. |
| 3. Operação de pessoas | Funcionários, sincronização sob demanda, pendências locais, novos/transferidos e subseções. |
| 4. Grade e impressão | Escala mensal/diária, fixos, folgas, críticas, geração por escopo e impressão. |
| 5. Aprendizado e controle | Modo Treinamento, tours de contexto e visão consolidada de alterações. |

O backend Express pode permanecer nesta etapa. Os novos casos de uso devem ser organizados para que uma eventual adoção de NestJS seja uma mudança estrutural futura, não uma reescrita simultânea ao frontend.

## Resultado esperado

Uma mesma programação deve produzir o mesmo resultado para Líder, Gerente, RH, Controladoria e Admin dentro de seus escopos, tanto na grade quanto na visão individual, impressão e integração. Atualizações precisam ser diagnosticáveis por versão e schema, e cada alteração deve ter autoria, alcance e resultado verificáveis.
