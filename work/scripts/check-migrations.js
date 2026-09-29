const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const directories = ['db/migrations', 'docker/oracle/migrations'];
const entries = directories.map((directory) => {
  const folder = path.join(root, directory);
  return new Map(fs.readdirSync(folder)
    .filter((name) => name.endsWith('.sql'))
    .map((name) => [name, crypto.createHash('sha256').update(fs.readFileSync(path.join(folder, name))).digest('hex')]));
});

const names = [...new Set(entries.flatMap((entry) => [...entry.keys()]))].sort();
const divergent = names.filter((name) => entries[0].get(name) !== entries[1].get(name));
if (divergent.length) {
  console.error('Migrations ausentes ou divergentes entre db/migrations e docker/oracle/migrations:');
  for (const name of divergent) console.error(`- ${name}`);
  process.exitCode = 1;
} else {
  console.log(`${names.length} migrations identicas nas duas pastas.`);
}
