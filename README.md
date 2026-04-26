# Fairy Tails â Test Trial


A self-contained trial of the staff Whiteboard with a real backend.
**This is a sandbox. It does not touch any operational system.**


What you get:
- **Backend** â Node 20 + Express + SQLite (file-based, zero config). Lives in `server/`.
- **Frontend** â the mobile staff Whiteboard, wired to the API. Lives in `public/`.
- **Seed data** â 12 dogs created on first start.


## Run it locally


You need Node 20+ installed.


```bash
npm install
npm start
```


Then open **http://localhost:3000/** in a browser.


The first time you run it, a SQLite file is created at `data/whiteboard.sqlite` and seeded with 12 dogs. Delete that file (or `POST /api/_reset` and restart) to start over.


## Run it with Docker


```bash
docker compose up --build
```


The `data/` folder is mounted as a volume so the database survives container restarts.


## API surface


| Method | Path | Notes |
|---|---|---|
| `GET`  | `/api/health` | Liveness probe. |
| `GET`  | `/api/dogs` | All dogs, ordered by id. |
| `POST` | `/api/dogs` | Create. Body: `{name, surname, breed, service, vanAm, vanPm, needsWalk, walkDone, photoDone}`. Only `name` is required. |
| `PATCH`| `/api/dogs/:id` | Partial update. Same field names as POST. |
| `DELETE`| `/api/dogs/:id` | Remove. |
| `POST` | `/api/_reset` | Clear DB. **Restart server to re-seed.** |


The frontend uses optimistic UI: photo and walk toggles update locally immediately, then save in the background. If the save fails, the toggle reverts and a "Save failed" toast appears.


## What this trial proves


1. The mobile whiteboard reads from a real database, not a hard-coded array.
2. Photo and walk ticks **persist** across page reloads and across devices (try opening two browser windows side-by-side).
3. The "+ Add dog" sheet writes to the database and the new dog appears for everyone on the next 20-second poll.
4. The API contract (`/api/dogs`, the field names, the data shape) is the contract any production backend would have to honour.


## What it does NOT do


- No authentication. Don't expose this to the internet without putting it behind something (Cloudflare Access, Tailscale, basic auth, etc).
- No multi-day data. Every dog is "today's" dog. Date scoping is a future concern.
- No realtime. Polls every 20 seconds. Add WebSockets / SSE later if needed.
- No reporting. The "Reports" tab is a placeholder.


## File map


```
test-repo/
ââ server/index.js        # Express + SQLite, all the API handlers
ââ public/                # Static frontend served by the same Express
â  ââ index.html          # The trial app, wired to /api
â  ââ MobileWhiteboard.jsx
â  ââ AddDogSheet.jsx
â  ââ Toast.jsx
â  ââ colors_and_type.css
â  ââ assets/logo.png
ââ data/                  # SQLite file lives here (gitignored)
ââ Dockerfile
ââ docker-compose.yml
ââ package.json
ââ README.md
```


## Pushing to the test repo


This trial is intended to live at `https://github.com/Fairytails123/test`.


To push the contents of this folder to that repo from your machine:


```bash
cd test-repo
git init
git add .
git commit -m "Initial trial: whiteboard + Express/SQLite backend"
git branch -M main
git remote add origin https://github.com/Fairytails123/test.git
git push -u origin main
```


If the repo on GitHub is not empty, do `git pull origin main --allow-unrelated-histories` first, resolve any conflicts, then push.
