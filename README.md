FreshShelf

A shared fridge tracker for an office kitchen or a group of roommates. People add what they put in the fridge and when it expires. The app shows what is about to go bad, lets someone mark an item used or tossed, and keeps simple waste stats.

Two processes, both local. Nothing is hosted.

```text

Browser ──► Next.js shell ──props──► UI components

                │                        │

                │                        └── callbacks

                └── /api  (rewrite) ──► FastAPI ──► backend/data/items.json

```

The shell owns state, fetching, validation, and refresh. Components render props and send events back. They do not fetch, and they do not calculate expiry.

## Run it

You need Python 3.11 or newer and Node 20 or newer. Use two terminals. Start the API first.

### Backend (Windows)

```bat

cd backend

py -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000

```

### Backend (Mac)

```bash

cd backend

python3 -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000

```

The first request creates `backend/data/items.json` with 10 items dated from that day, so the list includes fresh, expiring, and expired items. Later restarts keep the file. Adds, used, and tossed survive a restart. That file is the database, so it is not committed.

### Frontend (Windows and Mac)

```bash

cd frontend

npm install

npm run dev

```

Open [http://localhost:3000](http://localhost:3000)

The UI playground renders every component with fake props and does not call the API. It is at [http://localhost:3000/playground](http://localhost:3000/playground)

### Tests

Backend, from `backend` with the venv active:

```bash

pytest

```

Frontend, from `frontend`:

```bash

npm test

```

## Architecture

- `backend/app/expiry.py` is the only place that decides fresh, expiring, and expired. `days_left` of 0 or less is expired, including an item that expires today. 1, 2, and 3 are expiring. 4 or more is fresh. The 3 is the constant `EXPIRING_WITHIN_DAYS`.

- `backend/app/store.py` reads and writes the JSON file. `status` and `days_left` are added on the response. They are not stored.

- `GET /items` returns `state: "active"` only. `status` and `owner` are optional filters and can be combined. Owner match is exact. All, in the UI, sends no `status` param.

- Used and tossed rows stay in the file so `GET /stats` can count them, and they drop off the list.

- `waste_rate` is `tossed / (used + tossed)`, or `0` when that denominator is 0. The shell formats it as a percent.

- `frontend/src/api/items.ts` is the only fetch client. Next.js rewrites `/api/*` to `http://127.0.0.1:8000`. FastAPI also allows `http://localhost:3000` through CORS.

- `frontend/src/transform/` holds pure functions: table rows, stat labels, owner options, the “Updated …” label, and draft validation.

- `frontend/src/components/` is UI only. `frontend/src/shell/FridgeShell.tsx` loads data, holds the filter, refetches after add / used / tossed, and refreshes every 60 seconds. The timer is cleared on unmount.

## Tradeoffs

- One JSON file with a process lock and an atomic replace, instead of a real database. Two API processes would race. One `uvicorn` process is the setup this README runs.

- Polling every 60 seconds instead of a live connection. A second person sees changes on the next refresh.

- One Next.js app with a shell and presentational components, not a separately deployed micro frontend. The split is the boundary the brief asked for. A second deployable is not needed for a local fridge.

- The seed is generated on first run so the three statuses still exist whenever someone clones the repo. Committing fixed dates would go stale.

- Owner is optional free text. There is no login.

## With more time

- Accounts, so owner is a person instead of a typed name.

- Edit quantity and expiry without deleting the row.

- A lock that is safe across more than one server process, or a move to a real database.

- Share the expiry helper with the frontend tests from one source, instead of mirroring the badge rules in `toItemRows`.

## Hours spent  
- Approx 5.5