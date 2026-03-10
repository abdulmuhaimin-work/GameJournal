import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isEditMode } from '../config'
import { loadJournal } from '../data/loadJournal'
import { getLogEntries } from '../db/logs'
import type { LogEntry } from '../db/logs'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function Log() {
  const [entries, setEntries] = useState<LogEntry[]>([])

  const refresh = () => {
    if (isEditMode) setEntries(getLogEntries())
  }

  useEffect(() => {
    if (isEditMode) {
      refresh()
    } else {
      loadJournal().then((snapshot) => {
        if (snapshot) setEntries(snapshot.logEntries)
      })
    }
  }, [])

  return (
    <>
      <h2 className="page-title">Daily Log</h2>
      <p style={{ marginBottom: '1rem' }}>
        {isEditMode && (
          <>
            <Link to={`/log/${todayStr()}`}>
              <button type="button">Today</button>
            </Link>
            {' '}
          </>
        )}
        Log entries by date.
      </p>

      <ul className="list-unstyled">
        {entries.length === 0 && <li><em>No log entries yet.</em></li>}
        {entries.map((e) => (
          <li key={e.id} style={{ marginBottom: '0.75rem' }}>
            <Link to={`/log/${e.date}`}>
              <strong>{e.date}</strong>
            </Link>
            {e.content && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                {e.content.slice(0, 120)}
                {e.content.length > 120 ? '…' : ''}
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
