# Migracao gradual para React

## Estado atual

- `/nova/escalas-liberadas` consulta `/api/catalog/lojas` e `/api/escalas/resumo` com a sessao e as permissoes existentes. Abre a consulta mensal na propria interface React.
- `/nova/escalas/:lojaId/:mesRef` consulta a escala real, o periodo operacional e as secoes. Exibe visoes mensal e diaria, filtro de secao/subsecao e detalhes de cada dia. Gerar e resetar usam os endpoints existentes por secao, passando os IDs dos funcionarios quando uma subsecao e selecionada. Exigem permissao de edicao e confirmacao; o filtro continua selecionado apos a operacao. O endpoint `/api/escalas/mensal` agora devolve tambem `periodo: { inicio, fim }`; as regras de geracao nao foram alteradas.
- `/nova/funcionarios`, `/nova/secoes` e `/nova/secoes/:lojaId/:secaoId/subsecoes` consultam cadastros, horarios-base e vinculacoes. A lista de subsecoes inclui funcionarios sem vinculacao valida e subsecoes inativas. O horario-base de funcionario nao aprendiz pode ser editado com previa do impacto na escala, usando os mesmos endpoints e validacoes do fluxo legado.
- `/nova/alteracoes` consulta `/api/escalas/eventos`, com filtros de loja, mes e secao, resumo e paginacao. As paginas de secoes, subsecoes e alteracoes apenas consultam dados.
- `/nova/treinamento` e um exercicio ficticio por usuario: loja, periodo, secao, geracao, correcao de critica, salvamento e conclusao. Usa somente memoria e `localStorage` versionado (`escala:treinamento:v1:<usuarioId>`). Nao chama APIs de escrita, Oracle ou RM. O progresso nao acompanha o usuario em outro navegador.
- `/app` continua sendo a interface de edicao dos dias da escala, oficializacao e impressao. Tambem permanece disponivel para geracao, reset e horario-base enquanto a nova tela e validada em homologacao. Os links de retorno em cada modulo mantem a operacao disponivel durante a migracao. O login e a autenticacao continuam sob Express.
- O menu React respeita as permissoes de visualizacao presentes na sessao; a API continua sendo a autoridade de autorizacao para cada consulta.
- As paginas React sao protegidas por `requireAuth` e redirecionam ao login quando nao existe sessao. Os assets com hash podem ser servidos estaticamente; nenhum dado de usuario esta embutido neles.

## Build e publicacao

No checkout `work`, use `npm ci`, `npm run check:client`, `npm run build:client` e `npm test`. O build sai em `dist/react`, ignorado pelo Git. O Dockerfile possui etapa de build; `docker compose up -d --build app` recompila a imagem. O bind mount local de `dist` permite iteracao com `npm run build:client` sem reconstruir a imagem a cada CSS alterado. Para Linux sem Docker, execute o build no host antes de remover as dependencias de desenvolvimento.

## Proximos modulos

Migrar a edicao da escala por contexto (loja, periodo, secao e subsecao), com testes de caracterizacao dos comandos antes de substituir cada fluxo legado. Depois, migrar escritas de funcionarios/subsecoes, impressao e administracao. Durante a transicao, manter a API como unica fonte de autorizacao e regras de negocio. A troca do destino apos login so deve ocorrer quando gerar, resetar, editar, imprimir e navegar entre subsecoes estiverem cobertos por testes e validacao de usuarios.
