import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isEditMode } from '../config'
import { loadJournal } from '../data/loadJournal'
import { getPlans, type Plan } from '../db/plans'
import { getLogEntries, getLogByDate, type LogEntry } from '../db/logs'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function Home() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [todayEntry, setTodayEntry] = useState<LogEntry | null>(null)

  useEffect(() => {
    if (isEditMode) {
      setPlans(getPlans())
      setLogEntries(getLogEntries())
      setTodayEntry(getLogByDate(todayStr()))
    } else {
      loadJournal().then((snapshot) => {
        if (snapshot) {
          setPlans(snapshot.plans)
          setLogEntries(snapshot.logEntries)
          setTodayEntry(snapshot.logEntries.find((e) => e.date === todayStr()) ?? null)
        }
      })
    }
  }, [])

  const nextPlans = plans.filter((p) => p.status !== 'done').slice(0, 5)
  const recentLogs = logEntries.slice(0, 5)

  return (
    <>
      <h2 className="page-title">Dashboard</h2>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Today</h3>
        {todayEntry ? (
          <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {todayEntry.content.slice(0, 200)}
            {todayEntry.content.length > 200 ? '…' : ''}
          </p>
        ) : (
          <p><em>No entry for today.</em></p>
        )}
        {isEditMode && (
          <p style={{ marginTop: '0.5rem' }}>
            <Link to={`/log/${todayStr()}`}>
              <button type="button">{todayEntry ? 'Edit today' : 'Log today'}</button>
            </Link>
          </p>
        )}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
          <Link to="/plan">Plan</Link>
        </h3>
        {nextPlans.length === 0 && <p><em>No plan items.</em></p>}
        <ul className="list-unstyled" style={{ margin: 0 }}>
          {nextPlans.map((p) => (
            <li key={p.id} style={{ marginBottom: '0.25rem' }}>
              {p.title} — <span style={{ fontSize: '0.875rem' }}>{p.status.replace('_', ' ')}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
          <Link to="/log">Recent log</Link>
        </h3>
        {recentLogs.length === 0 && <p><em>No log entries yet.</em></p>}
        <ul className="list-unstyled" style={{ margin: 0 }}>
          {recentLogs.map((e) => (
            <li key={e.id} style={{ marginBottom: '0.25rem' }}>
              <Link to={`/log/${e.date}`}>{e.date}</Link>
              {e.content && <span style={{ fontSize: '0.875rem' }}> — {e.content.slice(0, 50)}{e.content.length > 50 ? '…' : ''}</span>}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
