# Regime 12x36 por funcionario nos postos

O regime pode ser configurado no cadastro do funcionario das lojas 700 a 799 por usuario com permissao de edicao de funcionarios. Cada alteracao grava uma nova configuracao com mes de inicio, data ancora de plantao, quatro horarios e autor. A configuracao mais recente em vigor no mes consultado prevalece; as anteriores permanecem para auditoria.

O plantao alterna a cada dois dias corridos a partir da ancora, inclusive na virada de mes e ano. A validacao exige 12 horas entre entrada e saida, intervalo interno minimo de 1 hora e no maximo 6 horas continuas por trecho. Ferias, afastamento e FDO em feriado nacional podem substituir um plantao. O regime nao recebe as duas folgas semanais nem a regra dominical do 5x2.

Nao e possivel mudar o regime se existir escala ativa oficializada a partir do mes de vigencia. Se ja houver rascunho, gere novamente a escala do funcionario no mes escolhido; a mudanca de cadastro nao reescreve a revisao anterior. A oficializacao valida a alternancia conforme a configuracao daquele mes.

Antes de publicar o aplicativo, aplicar no Oracle `20261109_regime_12x36_funcionario.sql` e `20261109_postos_horarios_padrao.sql` pelo executor de migrations. A segunda migration cadastra os modelos 08:48/01:40 e 08:24/01:10 ou 01:40 para uso apenas nos postos. Nao altera `PK_ESCALA_INTELIGENTE`.
