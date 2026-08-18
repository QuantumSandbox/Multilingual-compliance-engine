# Multilingual Regulatory Document Intelligence & Compliance Workflow Engine

An AI system that ingests multilingual regulatory documents (circulars,
accreditation rules, procurement policies), extracts obligations / deadlines /
responsible units / evidence requirements, converts them into **traceable tasks**
with exact source citations, compares document versions to **detect conflicts**,
and surfaces everything in a compliance dashboard with role-based access.

## Features
- **Multilingual ingestion** — PDF / DOCX / TXT, language detection (incl. Hindi/Odia),
  Gemini translation with original text preserved for citation.
- **Hybrid extraction** — regex pre-filter + Gemini structured extraction, with a
  **rule-based fallback** that works with no API key (so the demo never breaks).
- **Traceability** — every task links back to `document + page + paragraph + exact
  quoted passage` (see the Citation drawer with embedded PDF viewer).
- **Version comparison & conflict detection** — embedding-based clause alignment
  across versions; flags Added / Removed / Modified / Conflicting obligations and
  cross-document deadline conflicts.
- **Compliance dashboard** — obligation counts, deadline alerts, unit & source-type
  breakdowns, Kanban task board.
- **Security** — JWT auth, RBAC (admin / officer / dept_head / viewer), sensitive
  document restriction, data-retention tagging + expiry, audit log.

## Tech stack
- Backend: FastAPI · SQLAlchemy + SQLite · PyMuPDF · sentence-transformers
  (multilingual-e5) · google-generativeai (Gemini).
- Frontend: React · Vite · TailwindCSS · Recharts · React Router.
- No external databases to run — everything is local & offline-friendly.

## Quick start

### 1. Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1        # Windows
pip install -r requirements.txt
cp .env.example .env                 # optional: add GEMINI_API_KEY
python -m seed.make_samples          # generate sample circulars
python -m seed.seed_docs             # ingest + extract + compare (creates DB)
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                          # http://localhost:5173 (proxies /api -> :8000)
```

### 3. Demo accounts
| Username    | Password   | Role / scope                                  |
|-------------|------------|-----------------------------------------------|
| `admin`     | `admin123` | Administrator — full access                   |
| `hod_finance`| `hod123`  | Dept Head — sees only Finance-unit tasks      |
| `hod_cse`   | `hod123`   | Dept Head — (no Finance tasks → demonstrates scoping) |
| `viewer`    | `viewer123`| Read-only, no sensitive documents             |

## Using Gemini (optional but recommended)
Add `GEMINI_API_KEY=...` to `backend/.env` (free key at https://aistudio.google.com/apikey).
Without it the engine still works fully via the rule-based extractor and skips
live translation (the Hindi sample then shows language detection only).

## Demo flow
1. Login as **admin** → Dashboard shows extracted obligations, upcoming deadlines, conflicts.
2. **Documents** → upload `AICTE_v2.pdf` under the same *Family ID* as v1 to trigger
   side-by-side conflict detection (deadline: Mar 31 → Apr 30, etc.).
3. **Tasks** → click any card → Citation drawer opens the exact source passage + PDF.
4. **Conflicts** → review Added / Modified / Conflicting clauses, resolve them.
5. Login as **hod_finance** vs **viewer** to see RBAC scoping in action.

## Project layout
```
backend/
  app/ingestion   text extraction, language, translation, chunking
  app/extraction  rules, Gemini LLM, embeddings, date parsing
  app/comparison  clause alignment, diff, conflict detection
  app/tasks       task generation pipeline
  app/retention   retention tagging + expiry
  app/api         REST routers
  seed/           sample-doc generator + ingestion script
frontend/
  src/pages       Login, Dashboard, Tasks, Conflicts, Documents
  src/components  Layout, CitationDrawer
sample_data/      generated regulatory documents
```
