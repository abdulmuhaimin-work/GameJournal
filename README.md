# Game Journal

A brutalist-style game journal: plan your game-making journey and log daily progress. Only you edit; visitors view a read-only snapshot.

## Run locally (edit mode)

```bash
npm install
npm run dev
```

This starts both the Vite dev server and a small **publish server** (port 31337). The app proxies `/api/publish` to it.

- **Plan**: Add and edit goals/milestones.
- **Daily Log**: Create or edit entries by date; use “Today” for today’s entry.
- **Publish**: Click **Publish** in the nav:
  - If the publish server is running, it writes `public/journal.json` on disk. Then **commit and push**; your CI will deploy the new content.
  - If you ran only `npm run dev:vite`, Publish falls back to downloading `journal.json` (you can save it to `public/journal.json` yourself).

Data is stored in SQLite in the browser (sql.js) and persisted to IndexedDB.

## Continuous deployment

1. Run `npm run dev` (Vite + publish server).
2. Edit your journal in the browser.
3. Click **Publish** → `public/journal.json` is updated on disk.
4. Commit and push (e.g. `git add public/journal.json && git commit -m "Update journal" && git push`).
5. Your host (Vercel, Netlify, GitHub Pages, etc.) builds from the repo and deploys; the new snapshot is live.

No manual copy/paste: the published site always comes from the file in the repo.

## View mode (public site)

The production build is **read-only**: it loads content from `public/journal.json`. Deploy the `dist/` folder to any static host. Visitors see your plan and log; they cannot edit.

## Scripts

- `npm run dev` — Vite + publish server (use this when editing and publishing).
- `npm run dev:vite` — Vite only (Publish will download JSON instead of writing to disk).
- `npm run build` — Production build (view-only, uses `public/journal.json`).

## Tech

- Vite + React + TypeScript
- React Router
- sql.js (SQLite in the browser, persisted to IndexedDB)
- Local publish server (Node) to write `public/journal.json` for CD
- Static deploy; no backend in production
