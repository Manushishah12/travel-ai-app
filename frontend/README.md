# TravelAI — Frontend

React + Vite + Tailwind UI for the travel assistant.

## Run

```bash
# From project root
npm run dev:web

# Or from this folder
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Folder structure

```
frontend/
├── public/                 # Static assets (favicon, icons)
├── src/
│   ├── assets/             # Images
│   ├── components/         # Reusable UI
│   │   ├── Sidebar.jsx
│   │   ├── ChatPanel.jsx
│   │   ├── ChatMessage.jsx
│   │   ├── TripPlanView.jsx
│   │   ├── DayCard.jsx
│   │   ├── DetailCard.jsx
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx # Login state + JWT
│   ├── lib/
│   │   ├── api.js          # Calls Express API (/api proxy)
│   │   └── utils.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx   # Main app (chat + trip plan)
│   ├── App.jsx             # Routes
│   ├── main.jsx            # Entry
│   └── index.css           # Tailwind + theme
├── index.html
├── vite.config.js          # Dev server + API proxy → :8000
├── package.json
└── .env.example
```

## API proxy

In development, requests to `/api/*` are proxied to `http://127.0.0.1:8000`. Start the **server** before using chat.
