# TravelAI — Project structure

```
travel-ai-app/
│
├── frontend/                    # React web app (Vite + Tailwind)
│   ├── public/
│   ├── src/
│   │   ├── components/          # UI pieces
│   │   ├── context/             # Auth (JWT)
│   │   ├── lib/                 # API client, helpers
│   │   ├── pages/               # Login, Register, Dashboard
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                      # Node.js Express API
│   ├── src/
│   │   ├── routes/              # auth, places, chat
│   │   ├── services/            # Gemini chat, ML client
│   │   ├── middleware/          # JWT auth
│   │   ├── config.js
│   │   ├── db.js                # MongoDB
│   │   └── app.js               # Entry point
│   ├── scripts/
│   │   ├── seed-places.mjs      # Load CSV into MongoDB
│   │   └── list-gemini-models.mjs
│   ├── data/
│   │   └── places.csv           # Place dataset
│   ├── .env                     # Secrets (not in git)
│   └── package.json
│
├── ml-service/                  # Python ML microservice
│   ├── main.py                  # FastAPI
│   ├── recommend_engine.py      # scikit-learn ranking
│   ├── requirements.txt
│   └── .env.example
│
├── package.json                 # Root scripts (npm run dev, dev:web)
├── README.md
├── GITHUB.md
├── STRUCTURE.md                 # This file
└── .gitignore
```

## Ports

| Service   | Port | URL                      |
|-----------|------|--------------------------|
| Frontend  | 5173 | http://localhost:5173  |
| API       | 8000 | http://127.0.0.1:8000    |
| ML        | 5050 | http://127.0.0.1:5050    |

## Commands (from project root)

| Command            | What it does              |
|--------------------|---------------------------|
| `npm install`      | Install all workspaces    |
| `npm run dev`      | Start Express API         |
| `npm run dev:web`  | Start React frontend      |
| `npm run seed`     | Seed MongoDB places       |
| `npm run gemini:models` | List valid Gemini models |

## Note about `client/` folder

If you still see an empty or old **`client/`** folder, ignore it. The official frontend is **`frontend/`**. Delete `client/` after closing all dev servers.
