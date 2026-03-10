import initSqlJs from 'sql.js';
import { loadFromIndexedDB, saveToIndexedDB } from './persistence';

export interface Database {
  run(sql: string): void;
  exec(sql: string): { columns: string[]; values: unknown[][] }[];
  prepare(sql: string): unknown;
  export(): Uint8Array;
}

let db: Database | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'not_started',
  createdAt TEXT NOT NULL,
  targetDate TEXT,
  sortOrder INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS log_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  content TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
`;

export async function initDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file: string) => `/${file}`,
  });

  const persisted = await loadFromIndexedDB();
  if (persisted) {
    db = new SQL.Database(persisted);
  } else {
    db = new SQL.Database();
  }

  db.run(SCHEMA);
  return db;
}

export function getDb(): Database | null {
  return db;
}

export async function saveDb(): Promise<void> {
  if (!db) return;
  const data = db.export();
  await saveToIndexedDB(data);
}
