# Game Journal

A brutalist-style game journal: plan your game-making journey and log daily progress. Only you edit; visitors view a read-only snapshot.

## Run locally (edit mode)

```bash
npm install
npm run dev
```

- **Plan**: Add and edit goals/milestones.
- **Daily Log**: Create or edit entries by date; use “Today” for today’s entry.
- **Publish**: Click “Publish (export JSON)” in the nav to download `journal.json`.

Data is stored in SQLite in the browser (sql.js) and persisted to IndexedDB.

## View mode (public site)

The production build is **read-only**: it loads content from `public/journal.json`.

1. Run in edit mode locally, then click **Publish (export JSON)** to download `journal.json`.
2. Save the file as `public/journal.json` (replace the existing one).
3. Build and deploy:

   ```bash
   npm run build
   ```

4. Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).

Visitors see your plan and log from that snapshot; they cannot edit.

## Tech

- Vite + React + TypeScript
- React Router
- sql.js (SQLite in the browser, persisted to IndexedDB)
- No backend; static deploy
