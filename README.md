# Travel AI

Travel recommendation web app: **Express** API + **MongoDB** + **Gemini** chat, with **Python** microservice for ML-based ranking.

## Project layout

| Path | Role |
|------|------|
| `server/` | Main backend (auth, places, chat, calls ML service) |
| `frontend/` | Vite + React + Tailwind web app |
| `ml-service/` | Python FastAPI + scikit-learn TF-IDF recommendations |
| `server/data/places.csv` | Dataset used by `npm run seed` |

## Quick start

### 1. API server (Node)

From the **project root** (`travel-ai-app`):

```bash
cp server/.env.example server/.env
# Edit server/.env: MONGO_URL, JWT_SECRET, GEMINI_API_KEY, ML_SERVICE_URL (default http://127.0.0.1:5050)
npm install
npm run seed
npm run dev
```

This uses an **npm workspace** so `package.json` at the repo root can run the server. You can still use `cd server` and `npm run dev` there if you prefer.

If your prompt already ends with `...\travel-ai-app\server>`, run `npm install` and `npm run dev` inside `server/` instead (no root `package.json` needed in that case).

API: `http://127.0.0.1:8000` (default `PORT` in `.env`).

### 2. ML service (Python)

In a **second** terminal — start from the **project root** (`travel-ai-app`), not from `server/`:

```powershell
cd C:\Users\ASUS\Desktop\travel-ai-app\ml-service
```

If you are still inside `server/`, go up first: `cd ..` then `cd ml-service`.

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 5050
```

Use `python -m uvicorn` so you do not rely on `uvicorn` being on your PATH.

If the ML service is down, `POST /recommend` still returns places using a **rating fallback**.

### Gemini not working?

1. Create a key at https://aistudio.google.com/apikey (not an old/random string).
2. In `server/.env`:
   ```env
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-2.0-flash
   ```
3. List models **your key** supports:
   ```powershell
   cd server
   npm run gemini:models
   ```
   Copy the suggested `GEMINI_MODEL` into `.env`, restart API (`npm run dev` from project root).
4. If errors mention **429** or **quota**, wait or use a new API key.

**Why 404 happens:** Names like `gemini-1.5-flash-latest` are retired on the v1beta API. The server now auto-discovers valid models for your key.

See [STRUCTURE.md](./STRUCTURE.md) for the full folder tree. See [GITHUB.md](./GITHUB.md) for uploading to GitHub.

## Main HTTP routes (same shape as the old FastAPI app)

- `POST /register`, `POST /login`, `GET /me` (Bearer token)
- `GET /places`, `POST /places`
- `POST /recommend` — body: `{ "city": "Jaipur", "category": "food", "limit": 10, "user_signals": { "preferred_categories": ["historical"], "query_text": "forts" } }`  
  Optional `Authorization: Bearer …` to blend in recent chat messages as signals.
- `POST /chat/session`, `POST /chat`, `GET /chat/sessions`, `GET /chat/sessions/:id`

## Frontend (Week 4)

From the project root, in a **third** terminal (API + ML should already be running):

```bash
npm install
npm run dev:web
```

Open **http://localhost:5173** — register, start a **New trip**, chat through onboarding, then open the **Trip plan** tab when the Ready badge appears.

The Vite dev server proxies `/api` → `http://127.0.0.1:8000`. Ensure `FRONTEND_ORIGINS` in `server/.env` includes `http://localhost:5173`.
