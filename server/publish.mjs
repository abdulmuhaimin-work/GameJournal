/**
 * Local publish server: POST /api/publish with JSON body writes to public/journal.json.
 * Run alongside `npm run dev` so "Publish" in the app updates the file on disk for CD.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = 31337
const JOURNAL_PATH = path.join(process.cwd(), 'public', 'journal.json')

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/publish') {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf8')
        const data = JSON.parse(body)
        fs.writeFileSync(JOURNAL_PATH, JSON.stringify(data, null, 2), 'utf8')
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
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
  console.log(`Publish server: POST http://localhost:${PORT}/api/publish → public/journal.json`)
})
