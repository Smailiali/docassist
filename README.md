<div align="center">

# 📄 DocAssist

*An AI-powered document assistant — upload a PDF and ask anything about it.*

---

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Claude API](https://img.shields.io/badge/Claude_API-Anthropic-2E75B6?style=flat-square)](https://console.anthropic.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

</div>

---

## ✨ Features

- **PDF Upload & Parsing** — drag-and-drop any PDF up to 10 MB; text is extracted and stored automatically.
- **AI Chat** — ask natural-language questions about the document; answers stream word-by-word in real time.
- **Document Summary** — one click generates a structured summary: document type, parties, key topics, and overview.
- **Key Terms Extraction** — extracts up to 20 significant names, dates, amounts, and legal terms with in-document context.
- **Deadline Detection** — identifies all time-sensitive obligations and sorts them chronologically by due date.
- **Export** — download all extracted insights and chat history as a formatted PDF or plain-text file.

---

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18.3 + Vite 5.4 |
| Styling | Tailwind CSS 3.4 + Lucide React 0.577 |
| Backend | Node.js 20 + Express 4.21 (ESM) |
| Database | PostgreSQL + pg 8.13 |
| AI | Claude API via `@anthropic-ai/sdk` 0.37 |
| PDF Parsing | pdf-parse 1.1 |
| File Uploads | Multer 1.4 |
| PDF Generation | pdfkit 0.17 |

---

## 📋 Prerequisites

- **Node.js 20.x** — the project is built and tested on Node 20.10.0. Vite 5 requires Node ≥ 18.
- **PostgreSQL** — any recent version works (tested with pg driver 8.13). You can use a local install or a hosted service like [Neon](https://neon.tech).
- **Anthropic API key** — create one at [console.anthropic.com](https://console.anthropic.com).

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/docassist.git
cd docassist
```

### 2. Install dependencies

The frontend and backend are separate packages — install both:

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
# From the project root
cp .env.example .env
```

Open `.env` and set:

```env
ANTHROPIC_API_KEY=sk-ant-...        # Your Anthropic API key
DATABASE_URL=postgresql://...       # Your PostgreSQL connection string
PORT=3001                           # Optional — defaults to 3001
```

### 4. Set up the database

Create the database, then run the migration script to apply the schema:

```bash
# Create the database (local PostgreSQL)
createdb docassist

# Or using psql:
psql -U postgres -c "CREATE DATABASE docassist;"
```

Then apply the schema using the migration script:

```bash
cd server
node db/migrate.js
```

You should see: `Schema applied successfully.`

> **Using a hosted database (e.g. Neon)?** Skip `createdb` — just point `DATABASE_URL` at your hosted connection string and run `node db/migrate.js`.

### 5. Start the app

Open two terminals:

```bash
# Terminal 1 — backend (http://localhost:3001)
cd server
npm run dev
```

```bash
# Terminal 2 — frontend (http://localhost:5173)
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

To verify the backend is running: `http://localhost:3001/api/health` should return `{"status":"ok"}`.

---

## 📁 Project Structure

<details>
<summary>Show directory tree</summary>

```
docassist/
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/       # UI components (Chat, Sidebar, views)
│   │   ├── hooks/            # Custom React hooks (useChat, useDocuments, useAIFeatures)
│   │   ├── pages/            # Page components (Dashboard)
│   │   └── services/         # API fetch wrappers
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                   # Express backend
│   ├── db/
│   │   ├── index.js          # pg Pool connection
│   │   ├── migrate.js        # Runs schema.sql against the database
│   │   └── schema.sql        # Table definitions
│   ├── middleware/
│   │   └── upload.js         # Multer config (PDF only, 10 MB)
│   ├── routes/
│   │   ├── documents.js      # Upload, list, get, delete
│   │   ├── chat.js           # SSE chat + message history
│   │   └── ai-features.js    # Summary, terms, deadlines, export
│   ├── services/
│   │   ├── claude.js         # streamChat() and complete() wrappers
│   │   ├── pdf.js            # extractTextFromPDF()
│   │   └── prompts.js        # System prompts for all four AI features
│   └── server.js             # Express entry point
│
├── uploads/                  # Uploaded PDFs (gitignored)
├── .env.example              # Environment variable template
├── LICENSE
└── README.md
```

</details>

---

## 📡 API Reference

<details>
<summary>Show all endpoints</summary>

| Method | Endpoint | Description | Notes |
|---|---|---|---|
| `POST` | `/api/documents/upload` | Upload a PDF | `multipart/form-data`, field: `file` |
| `GET` | `/api/documents` | List all documents | Returns id, title, page_count, created_at |
| `GET` | `/api/documents/:id` | Get a single document | Includes cached AI results |
| `DELETE` | `/api/documents/:id` | Delete a document | Cascades to messages |
| `POST` | `/api/documents/:id/chat` | Send a chat message | 🟢 SSE — streams `data: {"text":"..."}`, ends with `data: [DONE]` |
| `GET` | `/api/documents/:id/messages` | Get full chat history | Ordered chronologically |
| `POST` | `/api/documents/:id/summary` | Generate summary | Cached in DB; add `?force=true` to regenerate |
| `POST` | `/api/documents/:id/terms` | Extract key terms | Cached in DB; add `?force=true` to regenerate |
| `POST` | `/api/documents/:id/deadlines` | Extract deadlines | Cached in DB; add `?force=true` to regenerate |
| `GET` | `/api/documents/:id/export` | Download insights | `?format=pdf` (default) or `?format=text` |
| `GET` | `/api/health` | Health check | Returns `{"status":"ok"}` |

</details>

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Yes | Your Claude API key from [console.anthropic.com](https://console.anthropic.com) |
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `PORT` | No | Port for the Express server. Defaults to `3001` |

---

## 📝 Development Notes

- **ESM throughout** — the server uses `"type": "module"`. All local imports must include the `.js` file extension (e.g. `import pool from './db/index.js'`).

- **pdf-parse import** — the package is imported as `import pdfParse from 'pdf-parse/lib/pdf-parse.js'` (pointing directly at the library file) to avoid errors caused by a test file that pdf-parse tries to load in ESM environments.

- **File uploads** — Multer enforces a 10 MB limit and rejects non-PDF files at the middleware level. The `uploads/` directory is gitignored.

- **AI response caching** — summary, key terms, and deadlines are stored as JSONB in the `documents` table after the first generation. Subsequent tab opens return the cached result instantly. Append `?force=true` to any of those POST endpoints to bypass the cache.

- **Node version** — use Node 20.x. Vite 5 requires Node ≥ 18, but the project is developed and tested on 20.10.0. Vite 6+ is not compatible and should not be installed.

- **SSL for hosted databases** — the pg pool automatically applies `ssl: { rejectUnauthorized: false }` for non-localhost `DATABASE_URL` values, which is required by most hosted providers (Neon, Railway, Supabase).

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

*Built with the [Claude API](https://console.anthropic.com) by Anthropic*

</div>
