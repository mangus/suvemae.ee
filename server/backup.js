// Copies the lab database into data/backup/ before a deploy restarts the
// server, keeping the newest 50 copies. Run by deploy/opalstack.sh.
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const configFile = path.join(__dirname, 'config.json');
const config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : {};
const db = path.resolve(__dirname, config.db || 'data/labor.db');
if (!fs.existsSync(db)) process.exit(0);

const dir = path.join(__dirname, 'data', 'backup');
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, new Date().toISOString().replace(/[:.]/g, '-') + '.db');
new DatabaseSync(db).exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
for (const old of fs.readdirSync(dir).filter((f) => f.endsWith('.db')).sort().slice(0, -50)) {
  fs.unlinkSync(path.join(dir, old));
}
console.log(`Backed up ${db} to ${file}`);
