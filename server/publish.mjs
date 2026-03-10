/**
 * Local publish server: POST /api/publish with JSON body writes to public/journal.json.
 * If body.deploy === true, runs git add, commit, push so CD (Vercel, Netlify, etc.) deploys.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = 31337
const JOURNAL_PATH = path.join(process.cwd(), 'public', 'journal.json')

function tryDeploy() {
  const cwd = process.cwd()
  try {
    execSync('git add public/journal.json', { cwd, stdio: 'pipe' })
    try {
      execSync('git commit -m "Update journal"', { cwd, stdio: 'pipe' })
    } catch (e) {
      if (!/nothing to commit|no changes/.test((e.stderr || e.message || '').toString())) throw e
      return { deployed: true, noChanges: true }
    }
    execSync('git push', { cwd, stdio: 'pipe' })
    return { deployed: true }
  } catch (err) {
    const msg = err.stderr?.toString() || err.message || String(err)
    return { deployed: false, error: msg.trim() }
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/publish') {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf8')
        const parsed = JSON.parse(body)
        const { deploy, ...data } = parsed
        const isDeploy = deploy === true
        fs.writeFileSync(JOURNAL_PATH, JSON.stringify(data, null, 2), 'utf8')
        let result = { ok: true, wrote: true }
        if (isDeploy) {
          result = { ...result, ...tryDeploy() }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(result))
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: String(err) }))
      }
    })
    return
  }
  res.writeHead(404)
  res.end()
})

server.listen(PORT, () => {
  console.log(`Publish server: POST http://localhost:${PORT}/api/publish → public/journal.json (+ optional git push)`)
})
