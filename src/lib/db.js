import Database from "better-sqlite3";
import path from "path";

// Initialize the database file in the root of the project
const dbPath = path.join(process.cwd(), "aegis.db");
const db = new Database(dbPath);

// Enforce strict foreign keys and Write-Ahead Logging for better performance
db.pragma("journal_mode = WAL");

// Create the links table if it does not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_id TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
