# Escopo de Desenvolvimento - Escala Inteligente

Documento baseado no arquivo `escopo_dev.odt`.

## Nome e identidade

- Alterar `Escala Digital` para `Escala Inteligente`.
- Na tela inicial, alterar `Escala Web` para `Escala Inteligente Savegnago`.
- Melhorar textos visíveis da aplicação.

## Menu e navegação

- Menu lateral:
  - em telas menores, manter apenas ícones;
  - em telas normais, exibir ícone + nome do menu;
  - avaliar nomes para submenus/páginas filhas.
- Permitir acesso direto a páginas específicas por URL, quando o usuário já estiver logado.
- Exibir no topo:
  - nome do usuário logado;
  - loja atrelada ao usuário;
  - botão de logout.

## Filtros por loja

- Em todas as páginas com filtro de loja, mostrar apenas lojas permitidas para o login do usuário.
- O backend já aplica permissão por loja, mas a UI deve refletir isso de forma clara.

## Tela Home

- Melhorar responsividade da Linha do Tempo para ocupar melhor a tela.
- Manter visualização mínima aproximada de 8 horas.
- Remover o formulário fixo `Adicionar Turno` da lateral.
- Criar botão para abrir modal de turno.
- No modal:
  - permitir selecionar turnos pré-cadastrados da loja;
  - permitir digitar turno personalizado.
- Criar página filha/CRUD para cadastro de turnos.
- Não permitir criar mais turnos do que funcionários ativos da loja.
- Exibir contadores:
  - `Funcionários na loja: X`;
  - `Turnos criados: Y`;
  - `Turnos restantes: X - Y`.

## Gerador de Escala

- Melhorar responsividade e uso do espaço vertical.
- A lista deve mostrar colaboradores e turnos selecionados anteriormente.
- Permitir trocar `Colaborador 1`, `Colaborador 2`, etc. por funcionário ativo da loja.
- Essa seleção deve ser uma lista/componente de escolha.
- Funcionário já escolhido em um colaborador não deve aparecer novamente em outro.
- Botão `Carregar Funcionários`:
  - deve substituir nomes genéricos por funcionários ativos da loja;
  - deve distribuir aleatoriamente quando houver mais funcionários do que turnos;
  - deve respeitar o limite de turnos criados.
- Verificar funcionamento do botão `Carregar Funcionários` contra o banco.
- Verificar funcionamento do botão `Distribuir Folgas 5x2`.

## Escala Detalhada

- Revisar validação de trabalho contínuo de 30 dias.
- A causa provável pode estar no fluxo anterior de folgas 5x2 não aplicado.
- Botão `Salvar` deve salvar no mês proposto.
- A escala deve ser salva de forma completa, mantendo:
  - quem criou;
  - mês;
  - quantidade de funcionários;
  - possibilidade de download/exibição semelhante ao `Ver Escala Detalhada`.
- Também deve ser salva a escala individual de cada funcionário.
- Persistência:
  - cabeçalho/topo em `SGN_ESC_PROG`;
  - dias/itens em `ESC_PROG_DIA`.

## Registros Atuais

- Renomear para `Escalas Geradas`.
- Remover botão `Importar Escala`.
- Corrigir/rever botões:
  - `Consultar Banco Local`;
  - `Sincronizar Banco Local`.
- Rever conceito de `Escalas Salvas` vs `Escalas no Banco Local`.
- Proposta:
  - página 1: registro geral da escala gerada, com data, usuário, quantidade de funcionários etc.;
  - página 2: tabela topo da escala gerada com filtro de mês.

## Funcionários

- Renomear `Funcionários da Loja` para `Funcionários`.
- Carregar funcionários diretamente do banco ao acessar a página.
- Não exigir clique no botão `Carregar`.
- Transformar em CRUD parcial:
  - permitir editar informações;
  - não permitir criar funcionário novo;
  - não permitir excluir funcionário real do cadastro.
- Item incompleto no escopo original: `Criar uma ...`

## Usuários e Acessos

- Renomear para `Controle de Acesso`.
- Criar duas páginas:
  - `Usuários`: listar usuários da loja pela `SGN_ESC_USUARIO`;
  - `Administrativo`: listar apenas usuários com role `ADMIN`.
- Tela de usuários:
  - não criar novo usuário;
  - permitir atualizar;
  - permitir inativar.
- Tela de admin:
  - permitir criar novo usuário.
- Ambas devem funcionar como CRUD.

## Configurações

- Página de roles com CRUD para manutenção das roles existentes.
- Tela para editar permissões de cada role.
- Exibir telas de role/permissão apenas para admin.
- Criar página `Configurações Escala` com:
  - configuração da Linha do Tempo;
  - regras de turno;
  - melhor uso de espaço;
  - comportamento de CRUD.
- Remover Backup e Restauração.

## Dependências técnicas novas

Para atender 100% do escopo, será necessário confirmar/criar no banco:

- Tabela de turnos pré-cadastrados por loja.
- Tabela de roles/perfis, caso hoje `PERFIL` seja apenas texto em `SGN_ESC_USUARIO`.
- Tabela de permissões por role.
- Campos de auditoria para escala gerada:
  - usuário criador;
  - data/hora de criação;
  - status;
  - quantidade de funcionários;
  - referência de loja/mês.

## Ordem recomendada de implementação

1. Ajustes de identidade, topo, logout e menu lateral.
2. Normalizar filtro de loja em todas as telas.
3. Corrigir fluxo Home/Gerador:
   - modal de turno;
   - limite por quantidade de funcionários;
   - seleção única de funcionário;
   - carregar funcionários;
   - folgas 5x2.
4. Reestruturar salvamento e consulta em `Escalas Geradas`.
5. Evoluir tela de Funcionários para CRUD parcial.
6. Evoluir Controle de Acesso.
7. Criar Configurações/Roles/Permissões.
8. Remover Backup/Restauração e termos de banco local.
