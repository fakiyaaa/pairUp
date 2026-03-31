const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "database.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT,
    bio TEXT,
    role TEXT,
    interview_types TEXT,
    topics TEXT,
    calendly_url TEXT,
    created_at TEXT
  )
`);

module.exports = db;
