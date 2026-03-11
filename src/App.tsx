import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { isEditMode } from './config'
import { initDb } from './db/init'
import { syncJournalFromFile } from './data/syncJournal'
import Layout from './components/Layout'
import Home from './pages/Home'
import Plan from './pages/Plan'
import Log from './pages/Log'
import Entry from './pages/Entry'

function App() {
  const [ready, setReady] = useState(!isEditMode)

  useEffect(() => {
    if (!isEditMode) {
      setReady(true)
      return
    }
    initDb()
      .then(() => syncJournalFromFile())
      .then(() => setReady(true))
      .catch(console.error)
  }, [])

  if (!ready) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <p>Loading…</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/log" element={<Log />} />
          <Route path="/log/:date" element={<Entry />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
