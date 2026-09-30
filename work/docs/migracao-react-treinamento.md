# Migracao gradual para React

## Estado atual

- `/nova/escalas-liberadas` e a primeira tela operacional React. Consulta `/api/catalog/lojas` e `/api/escalas/resumo` com a sessao e as permissoes existentes. Abre a escala na interface anterior, sem alterar o contrato da API nem as regras de geracao.
- `/nova/treinamento` e um exercicio ficticio por usuario: loja, periodo, secao, geracao, correcao de critica, salvamento e conclusao. Usa somente memoria e `localStorage` versionado (`escala:treinamento:v1:<usuarioId>`). Nao chama APIs de escrita, Oracle ou RM. O progresso nao acompanha o usuario em outro navegador.
- `/app` continua sendo a interface de edicao. O link `Nova interface` no menu antigo permite testar a migracao sem interromper a operacao. O login e a autenticacao continuam sob Express.
- As paginas React sao protegidas por `requireAuth` e redirecionam ao login quando nao existe sessao. Os assets com hash podem ser servidos estaticamente; nenhum dado de usuario esta embutido neles.

## Build e publicacao

No checkout `work`, use `npm ci`, `npm run check:client`, `npm run build:client` e `npm test`. O build sai em `dist/react`, ignorado pelo Git. O Dockerfile possui etapa de build; `docker compose up -d --build app` recompila a imagem. O bind mount local de `dist` permite iteracao com `npm run build:client` sem reconstruir a imagem a cada CSS alterado. Para Linux sem Docker, execute o build no host antes de remover as dependencias de desenvolvimento.

## Proximos modulos

Migrar a consulta detalhada e a edicao da escala por contexto (loja, periodo, secao, subseção), com testes de caracterizacao dos comandos antes de substituir cada fluxo legado. Em seguida, migrar funcionarios, alteracoes, subsecoes, impressao e administracao. Durante a transicao, manter a API como unica fonte de autorizacao e de regras de negocio. A troca do destino apos login so deve ocorrer quando gerar, resetar, editar, imprimir e navegar entre subsecoes estiverem cobertos por testes e validacao de usuarios.
