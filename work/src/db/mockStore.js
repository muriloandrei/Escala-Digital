const fs = require('fs/promises');
const path = require('path');

function getDataFile() {
  return process.env.MOCK_DB_FILE || path.join(__dirname, '..', '..', 'data', 'mock-db.json');
}

async function readData() {
  const dataFile = getDataFile();
  const content = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(content);
}

async function writeData(data) {
  const dataFile = getDataFile();
  await fs.writeFile(dataFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function nextId(rows, field) {
  return rows.reduce((max, row) => Math.max(max, Number(row[field] || 0)), 0) + 1;
}

module.exports = {
  readData,
  writeData,
  getDataFile,
  nextId
};
