import { Link, Outlet } from 'react-router-dom'
import { isEditMode } from '../config'
import { publishToRepo } from '../lib/export'
import { useState } from 'react'

export default function Layout() {
  const [publishStatus, setPublishStatus] = useState<string | null>(null)

  const handlePublish = async () => {
    setPublishStatus(null)
    const { wrote } = await publishToRepo()
    setPublishStatus(wrote ? 'Written to public/journal.json — commit & push to deploy.' : 'Downloaded journal.json (publish server not running).')
  }

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
              <button type="button" onClick={handlePublish} style={{ marginLeft: '0.25rem' }}>
                Publish
              </button>
              {publishStatus && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>{publishStatus}</span>
              )}
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
