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

/** Try to write journal to public/journal.json via local publish server and optionally git push; fall back to download if server not running. */
export async function publishToRepo(): Promise<{ wrote: boolean; deployed?: boolean; noChanges?: boolean; error?: string }> {
  const data = exportJournal()
  try {
    const res = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, deploy: true }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { wrote: false, error: err.error || res.statusText }
    }
    const result = (await res.json()) as { wrote?: boolean; deployed?: boolean; noChanges?: boolean; error?: string }
    return { wrote: true, deployed: result.deployed, noChanges: result.noChanges, error: result.error }
  } catch {
    /* server not running */
  }
  downloadJournalJson()
  return { wrote: false }
}
