function parseAllowedLogins(value) {
  return [...new Set(String(value || '')
    .split(',')
    .map((login) => login.trim().toLowerCase())
    .filter(Boolean))];
}

function isReactUiAllowed(user, ui) {
  const login = String(user?.login || '').trim().toLowerCase();
  return Boolean(login && ui?.reactAllowedLogins?.includes(login));
}

function requiresTraining(user, ui) {
  return isReactUiAllowed(user, ui);
}

function getLoginStartPath(user, ui, trainingStage = 12) {
  if (requiresTraining(user, ui) && trainingStage < 12) return '/nova/treinamento';
  return ui?.reactDefault && isReactUiAllowed(user, ui)
    ? '/nova'
    : '/app#/escalas-geradas';
}

module.exports = { parseAllowedLogins, isReactUiAllowed, requiresTraining, getLoginStartPath };
