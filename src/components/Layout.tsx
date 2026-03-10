import { Link, Outlet } from 'react-router-dom'
import { isEditMode } from '../config'
import { downloadJournalJson } from '../lib/export'

export default function Layout() {
  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--border)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Game Journal
          </Link>
        </h1>
        <nav>
          <Link to="/">Home</Link>
          {' · '}
          <Link to="/plan">Plan</Link>
          {' · '}
          <Link to="/log">Daily Log</Link>
          {isEditMode && (
            <>
              {' · '}
              <span style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>Edit mode</span>
              {' · '}
              <button type="button" onClick={downloadJournalJson} style={{ marginLeft: '0.25rem' }}>
                Publish (export JSON)
              </button>
            </>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
