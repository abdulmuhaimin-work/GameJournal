import { getDb, saveDb } from './init';

export interface LogEntry {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function rowToEntry(row: unknown[]): LogEntry {
  return {
    id: row[0] as string,
    date: row[1] as string,
    content: row[2] as string,
    createdAt: row[3] as string,
    updatedAt: row[4] as string,
  };
}

export function getLogEntries(): LogEntry[] {
  const db = getDb();
  if (!db) return [];
  const result = db.exec('SELECT id, date, content, createdAt, updatedAt FROM log_entries ORDER BY date DESC, updatedAt DESC');
  if (!result.length || !result[0].values.length) return [];
  return result[0].values.map(rowToEntry);
}

export function getLogByDate(date: string): LogEntry | null {
  const db = getDb();
  if (!db) return null;
  const stmt = db.prepare('SELECT id, date, content, createdAt, updatedAt FROM log_entries WHERE date = ?') as { bind: (p: unknown[]) => void; step: () => boolean; get: () => unknown[]; free: () => void };
  stmt.bind([date]);
  const row = stmt.step() ? stmt.get() : null;
  stmt.free();
  return row ? rowToEntry(row) : null;
}

export function getLogById(id: string): LogEntry | null {
  const db = getDb();
  if (!db) return null;
  const stmt = db.prepare('SELECT id, date, content, createdAt, updatedAt FROM log_entries WHERE id = ?') as { bind: (p: unknown[]) => void; step: () => boolean; get: () => unknown[]; free: () => void };
  stmt.bind([id]);
  const row = stmt.step() ? stmt.get() : null;
  stmt.free();
  return row ? rowToEntry(row) : null;
}

export async function saveLogEntry(entry: { date: string; content: string; id?: string }): Promise<LogEntry> {
  const db = getDb();
  if (!db) throw new Error('DB not initialized');
  const now = new Date().toISOString();
  const existing = entry.id ? getLogById(entry.id) : getLogByDate(entry.date);

  if (existing) {
    const stmt = db.prepare('UPDATE log_entries SET content = ?, updatedAt = ? WHERE id = ?') as { bind: (p: unknown[]) => void; step: () => boolean; free: () => void };
    stmt.bind([entry.content, now, existing.id]);
    stmt.step();
    stmt.free();
    await saveDb();
    return { ...existing, content: entry.content, updatedAt: now };
  }

  const id = crypto.randomUUID();
  const stmt = db.prepare('INSERT INTO log_entries (id, date, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)') as { bind: (p: unknown[]) => void; step: () => boolean; free: () => void };
  stmt.bind([id, entry.date, entry.content, now, now]);
  stmt.step();
  stmt.free();
  await saveDb();
  return { id, date: entry.date, content: entry.content, createdAt: now, updatedAt: now };
}

export async function deleteLogEntry(id: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('DB not initialized');
  const stmt = db.prepare('DELETE FROM log_entries WHERE id = ?') as { bind: (p: unknown[]) => void; step: () => boolean; free: () => void };
  stmt.bind([id]);
  stmt.step();
  stmt.free();
  await saveDb();
}
