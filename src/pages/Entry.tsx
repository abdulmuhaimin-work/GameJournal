import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { isEditMode } from '../config'
import { loadJournal } from '../data/loadJournal'
import { getLogByDate, saveLogEntry, type LogEntry } from '../db/logs'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function Entry() {
  const { date } = useParams<{ date: string }>()
  const resolvedDate = date === 'today' ? todayStr() : (date ?? '')
  const [entry, setEntry] = useState<LogEntry | null>(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEditMode) {
      const e = getLogByDate(resolvedDate)
      setEntry(e ?? null)
      setContent(e?.content ?? '')
    } else {
      loadJournal().then((snapshot) => {
        const e = snapshot?.logEntries.find((x) => x.date === resolvedDate) ?? null
        setEntry(e ?? null)
      })
    }
  }, [resolvedDate])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditMode) return
    setSaving(true)
    try {
      const saved = await saveLogEntry({ date: resolvedDate, content, id: entry?.id })
      setEntry(saved)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <p><Link to="/log">← Back to log</Link></p>
      <h2 className="page-title">{resolvedDate || 'Entry'}</h2>

      {isEditMode ? (
        <form onSubmit={handleSave}>
          <p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you do today?"
              rows={12}
              style={{ width: '100%', maxWidth: '600px', resize: 'vertical' }}
            />
          </p>
          <p>
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </p>
        </form>
      ) : (
        <div style={{ whiteSpace: 'pre-wrap' }}>{entry ? entry.content : <em>No entry for this date.</em>}</div>
      )}
    </>
  )
}
