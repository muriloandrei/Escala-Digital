const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'js', 'app-original.js');
let source = fs.readFileSync(filePath, 'utf8');

source = source.replace(
  /const syncResult = await sincronizarEscalaComBanco\(escalaParaAtualizar\);\s*const syncCount = syncResult\.saved \? syncResult\.saved\.length : 0;\s*showInfoModal\(syncCount > 0 \? 'Escala atualizada e sincronizada com o banco local!'[\s\S]*?renderizarTabelaRegistros\(\);/,
  `const syncResult = await tentarSincronizarEscalaComBanco(escalaParaAtualizar);
                    showInfoModal(syncResult.ok && syncResult.count > 0 ? 'Escala atualizada e sincronizada com o banco local!' : \`Escala atualizada, mas não sincronizada com o banco local: \${syncResult.message || 'carregue funcionários da loja antes de gerar a escala.'}\`, syncResult.ok && syncResult.count > 0 ? 'success' : 'error');
                    renderizarTabelaRegistros();`
);

source = source.replace(
  /const syncResult = await sincronizarEscalaComBanco\(novaEscala\);\s*const syncCount = syncResult\.saved \? syncResult\.saved\.length : 0;\s*([\s\S]*?currentLoadedScale = novaEscala;\s*)showInfoModal\(syncCount > 0 \? "Escala salva e sincronizada com o banco local![\s\S]*?renderizarTabelaRegistros\(\);/,
  `const syncResult = await tentarSincronizarEscalaComBanco(novaEscala);
                $1showInfoModal(syncResult.ok && syncResult.count > 0 ? "Escala salva e sincronizada com o banco local! Agora você pode continuar editando e salvar as alterações." : \`Escala salva, mas não sincronizada com o banco local: \${syncResult.message || 'carregue funcionários da loja antes de gerar a escala.'}\`, syncResult.ok && syncResult.count > 0 ? "success" : "error");
                renderizarTabelaRegistros();`
);

fs.writeFileSync(filePath, source, 'utf8');
console.log('Fluxo de erro de sincronizacao ajustado.');
