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

function getLoginStartPath(user, ui) {
  return ui?.reactDefault && isReactUiAllowed(user, ui)
    ? '/nova'
    : '/app#/escalas-geradas';
}

module.exports = { parseAllowedLogins, isReactUiAllowed, getLoginStartPath };
