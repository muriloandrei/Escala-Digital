const { LAST_STAGE } = require('./trainingStages');

function parseAllowedLogins(value) {
  return [...new Set(String(value || '')
    .split(',')
    .map((login) => login.trim().toLowerCase())
    .filter(Boolean))];
}

function isReactUiAllowed(user, ui) {
  const login = String(user?.login || '').trim().toLowerCase();
  const allowedLogins = ui?.reactAllowedLogins || [];
  return Boolean(login && (allowedLogins.includes(login)
    || (allowedLogins.length === 1 && allowedLogins[0] === '*')));
}

function requiresTraining(user, ui) {
  return isReactUiAllowed(user, ui);
}

function getLoginStartPath(user, ui, trainingStage = LAST_STAGE) {
  if (requiresTraining(user, ui) && trainingStage < LAST_STAGE) return '/nova/treinamento';
  return '/nova';
}

module.exports = { parseAllowedLogins, isReactUiAllowed, requiresTraining, getLoginStartPath };
