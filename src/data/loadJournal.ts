import type { Plan } from '../db/plans'
import type { LogEntry } from '../db/logs'

export interface JournalSnapshot {
  plans: Plan[]
  logEntries: LogEntry[]
  exportedAt: string
}

const JOURNAL_URL = '/journal.json'

export async function loadJournal(): Promise<JournalSnapshot | null> {
  try {
    const res = await fetch(JOURNAL_URL)
    if (!res.ok) return null
    const data = (await res.json()) as JournalSnapshot
    return data
  } catch {
    return null
  }
}
