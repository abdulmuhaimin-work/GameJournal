import { loadJournal } from './loadJournal'
import { getDb, saveDb } from '../db/init'
import { getPlans } from '../db/plans'
import { getLogEntries } from '../db/logs'

/**
 * In dev mode: import journal.json into local SQLite when DB is empty, so published content is visible.
 * Skips sync if local DB already has data (preserves unsaved edits).
 */
export async function syncJournalFromFile(): Promise<boolean> {
  const db = getDb()
  if (!db) return false

  const hasLocalData = getPlans().length > 0 || getLogEntries().length > 0
  if (hasLocalData) return false

  const snapshot = await loadJournal()
  if (!snapshot || (snapshot.plans.length === 0 && snapshot.logEntries.length === 0)) {
    return false
  }

  const plansStmt = db.prepare(
    'INSERT OR REPLACE INTO plans (id, title, description, status, createdAt, targetDate, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ) as { bind: (p: unknown[]) => void; step: () => boolean; reset: () => void; free: () => void }

  for (const p of snapshot.plans) {
    plansStmt.reset()
    plansStmt.bind([
      p.id,
      p.title,
      p.description ?? '',
      p.status,
      p.createdAt,
      p.targetDate ?? null,
      p.sortOrder ?? 0,
    ])
    plansStmt.step()
  }
  plansStmt.free()

  const logsStmt = db.prepare(
    'INSERT OR REPLACE INTO log_entries (id, date, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)'
  ) as { bind: (p: unknown[]) => void; step: () => boolean; reset: () => void; free: () => void }

  for (const e of snapshot.logEntries) {
    logsStmt.reset()
    logsStmt.bind([e.id, e.date, e.content ?? '', e.createdAt, e.updatedAt])
    logsStmt.step()
  }
  logsStmt.free()

  await saveDb()
  return true
}
