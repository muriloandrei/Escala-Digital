# Sprint longa de estabilizacao da escala

Branch de trabalho: `homologacao`. A geracao aprovada de folgas e jornadas nao deve mudar incidentalmente.

## Critérios de aceite

1. **Rascunhos e revisoes.** Duas sessoes no mesmo funcionario produzem conflito explicito; secoes e subsecoes distintas preservam suas programacoes. Resposta perdida pode ser consultada por operacao. Uma revisao parcial nao apaga dias. Saida/reabertura preserva filtros e rascunho recuperavel.
2. **Horario unico.** Cadastro, escala mensal/diaria, consulta individual e impressao exibem os mesmos horarios persistidos. Edicao de horario-base tem vigencia explicita e nao substitui excecoes manuais nem dias protegidos. Edicao de um dia continua sendo excecao local. Aprendiz segue 05:15.
3. **Pessoas e RM.** Suspensoes locais nao falsificam demissao e distinguem pendencia do RM. Dias ja gravados impactados sao visiveis. O cadastro de novos funcionarios aguarda exclusivamente o RM; nao ha inclusao provisoria. Sincronizacao sob demanda depende de contrato seguro com o job existente, que nao esta disponivel no repositorio.
4. **Transferencias.** Vigencia imediata, proxima semana e proximo mes tem datas reais, historico consultavel e geracao restrita aos dias afetados. Falha parcial nunca aparece como transferencia concluida.
5. **Alteracoes e treinamento.** Filtros por colaborador, subseção, autor, acao e origem; antes/depois e justificativa legiveis. Tour contextual de primeiro acesso inicia exercicio ficticio, sem tocar no RM ou em escalas reais.
6. **Homologacao e publicacao.** Testar os fluxos de cada perfil e loja no Oracle, com migrations verificadas, smoke de navegador e impressao. Tornar React padrao fora do Docker local apenas apos aceite. Fila RM deve ser validada com falhas simuladas; envio real permanece sem comprovacao ate existir RM de homologacao gravavel.

## Resultado nesta branch

- React cobre as telas principais; `/app` e contingencia. Login React padrao esta habilitado apenas no Docker local.
- O rascunho tem confirmacao por operacao, revisao individual e bloqueio de perda de datas. A interface legada recupera edicoes nao salvas na sessao do navegador somente se as revisoes e os dias ainda coincidirem. Resta provar concorrencia com duas sessoes reais na homologacao compartilhada.
- O horario-base calcula e salva dias editaveis de todos os meses futuros gerados em uma transacao, preservando excecoes manuais e protegidas. A previa lista os meses impactados.
- Suspensao local, fila RM e eventos transacionais exibem impacto e auditoria. Alteracoes podem ser filtradas por colaborador, subsecao, autor, acao, origem e situacao. O treinamento ficticio inicia automaticamente no primeiro acesso React sem escrever escalas reais.
- Transferencias futuras sao agendadas em Oracle e executadas por worker na vigencia; o vinculo muda e os dias futuros do funcionario sao regerados, sem incluir manualmente quem ainda nao veio do RM. Falhas e meses parcialmente processados permanecem consultaveis. No mes da transferencia, as abas de subsecao exibem apenas seus proprios dias; operacoes em lote sobre uma aba mista ficam bloqueadas para nao afetar a outra.
- Inclusao provisoria de funcionario foi descartada pelo usuario: o cadastro deve aguardar sincronizacao do RM.
- As migrations `20261001_evento_subsecao.sql` e `20261001_transferencia_subsecao_agendada.sql` foram aplicadas e registradas no Oracle Docker local. `npm run migrations:check` confirma paridade das pastas, nao a execucao em outros bancos. O deploy externo precisa aplicar SQL antes do codigo e so entao ativar `ESCALA_TRANSFER_SCHEDULER_ENABLED=true`.
- Testes unitarios, build TypeScript, smoke de perfis, evento em rollback, fila RM em rollback e contrato Oracle local passaram. O smoke local do perfil Lider nao tem secoes na massa de teste; validar o perfil em uma loja real de homologacao.
- Sem RM de homologacao com escrita, o aceite de envio externo sera separado do aceite da aplicacao local. Tambem nao ha contrato do job RM para disparo/consulta sob demanda. Esses dois itens nao devem ser apresentados como validados.
