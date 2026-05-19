# Upload TravelAI to GitHub

## Before you push (important)

1. **Never commit secrets.** These files are already in `.gitignore`:
   - `server/.env`
   - `ml-service/.env`
   - Any file with API keys or MongoDB passwords

2. **Rotate keys** if you ever pasted `.env` in chat or committed it by mistake.

3. Only commit `.env.example` files (placeholders, no real keys).

---

## Step 1 — Open the project on your laptop

Folder:

```text
C:\Users\ASUS\Desktop\travel-ai-app
  frontend/    ← React UI (open this in Chrome via npm run dev:web)
  server/      ← Express API
  ml-service/  ← Python ML
```

> If `frontend/` was empty before: the UI code is now in **`frontend/`** (not `client/`).

Open in Cursor: **File → Open Folder** → select that folder.

---

## Step 2 — Initialize Git (once)

In PowerShell:

```powershell
cd C:\Users\ASUS\Desktop\travel-ai-app
git init
git add .
git status
```

Confirm you do **not** see `server/.env` in the list. If you do, do not commit it.

```powershell
git commit -m "Initial commit: TravelAI full stack app"
```

---

## Step 3 — Create GitHub repository

1. Go to https://github.com/new
2. Repository name: `travel-ai-app` (or any name)
3. **Do not** add README, .gitignore, or license (you already have them locally)
4. Click **Create repository**

---

## Step 4 — Push code

Replace `YOUR_USERNAME` with your GitHub username:

```powershell
cd C:\Users\ASUS\Desktop\travel-ai-app
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/travel-ai-app.git
git push -u origin main
```

If GitHub asks you to sign in, use a **Personal Access Token** as the password (Settings → Developer settings → Tokens).

---

## Step 5 — README for recruiters

Your main `README.md` already describes how to run the app. On GitHub, add:

- Screenshot of the UI
- Link to live demo (if you deploy later)
- Tech stack bullet list

---

## Clone on another PC later

```powershell
git clone https://github.com/YOUR_USERNAME/travel-ai-app.git
cd travel-ai-app
npm install
copy server\.env.example server\.env
# edit server\.env with your keys
npm run seed
```

Then start API + frontend as in the main README.
