import type { JournalSnapshot } from '../data/loadJournal'
import { getPlans } from '../db/plans'
import { getLogEntries } from '../db/logs'

export function exportJournal(): JournalSnapshot {
  return {
    plans: getPlans(),
    logEntries: getLogEntries(),
    exportedAt: new Date().toISOString(),
  }
}

export function downloadJournalJson(): void {
  const data = exportJournal()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'journal.json'
  a.click()
  URL.revokeObjectURL(url)
}

/** Try to write journal to public/journal.json via local publish server; fall back to download if server not running. */
export async function publishToRepo(): Promise<{ wrote: boolean }> {
  const data = exportJournal()
  try {
    const res = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) return { wrote: true }
  } catch {
    /* server not running */
  }
  downloadJournalJson()
  return { wrote: false }
}
