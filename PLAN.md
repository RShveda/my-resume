# Resume/CV Website - Phase 1 Plan

## Context
Build a personal resume/CV website to practice and showcase React, Tailwind, Django, PostgreSQL, and Docker. The site displays Roman Shveda's professional background with dynamic Skills and Experience sections managed through Django Admin. Phase 2 (AI chat widget) is scoped separately but confirmed feasible.

## Architecture Overview

```
┌─────────────────────┐       ┌─────────────────────┐       ┌────────────┐
│  React + Tailwind   │──API──│  Django + DRF        │──ORM──│ PostgreSQL │
│  (Vite, SPA)        │       │  (REST API + Admin)  │       │            │
│  Port 3000          │       │  Port 8000           │       │  Port 5442 │
└─────────────────────┘       └─────────────────────┘       └────────────┘
         └─── All running in Docker Compose (v2) ───┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS 3 |
| Backend | Django 5 + Django REST Framework |
| Database | PostgreSQL 16 |
| Containerization | Docker + Docker Compose v2 (`docker compose`, not `docker-compose`) |
| Python env | uv (virtual environment + package management) |
| API Communication | REST (JSON), read-only |

## Project Structure

```
resume/
├── docker-compose.yml
├── .env / .env.example
├── CLAUDE.md
├── PLAN.md
├── backend/
│   ├── Dockerfile (uses uv)
│   ├── requirements.txt
│   ├── manage.py
│   ├── .venv/                # uv virtual environment
│   ├── pytest.ini
│   ├── config/               # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── resume_api/           # Django app
│   │   ├── models.py         # Skill, Experience, ExperienceBullet, Certification, ChatLog
│   │   ├── serializers.py
│   │   ├── views.py          # REST viewsets + SSE chat view
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── prompt.py         # System prompt builder
│   │   ├── llm.py            # LLM client (Groq SDK)
│   │   ├── data/
│   │   │   ├── resume_context.json
│   │   │   └── qa_pairs.json
│   │   └── management/commands/seed_resume.py
│   └── tests/
│       ├── test_api.py
│       └── test_chat.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── test-setup.js
        ├── api/
        │   └── client.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Hero.jsx
        │   ├── Skills.jsx
        │   ├── Experience.jsx
        │   ├── Education.jsx
        │   ├── Certifications.jsx
        │   ├── Contact.jsx
        │   ├── ChatWidget.jsx
        │   ├── ThemeToggle.jsx
        │   └── Footer.jsx
        ├── hooks/
        │   └── useFetch.js
        └── __tests__/
            ├── App.test.jsx
            ├── ChatWidget.test.jsx
            ├── Hero.test.jsx
            └── Skills.test.jsx
```

## Django Models

### Skill
- `name`, `category` (Programming, Frameworks, Databases, DevOps, AI, Methodologies), `order`

### Experience
- `company`, `role`, `start_date`, `end_date` (nullable), `location`, `is_remote`, `order`

### ExperienceBullet (child of Experience)
- `experience` (FK), `text`, `order`

### Certification
- `name`, `issuer`, `year` (optional), `order`

## API Endpoints (read-only, no auth)

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/api/health/` | `{"status": "ok"}` |
| GET | `/api/skills/` | All skills |
| GET | `/api/experience/` | Experiences with nested bullets |
| GET | `/api/certifications/` | Certification entries |
| POST | `/api/chat/` | SSE stream of AI chat tokens |

## Frontend Sections

1. **Navbar** — Sticky, anchor links, mobile hamburger, theme toggle
2. **Hero** — Name, title, summary, contact links (static)
3. **Skills** — Dynamic from API, grouped badges by category
4. **Experience** — Dynamic from API, timeline cards with bullets
5. **Education** — Static
6. **Certifications** — Dynamic from API, card grid
7. **Contact** — Static (email, LinkedIn, location)
8. **Footer** — Minimal

**Theme**: Light default, dark toggle via `localStorage`.

## Implementation Steps

- [x] **Step 1.0**: Project scaffolding — docker-compose, Django project/app, Vite+React+Tailwind, CORS, uv venv
- [x] **Step 1.1**: Hello World — verify Docker Compose runs all 3 services, frontend talks to backend, backend talks to DB
- [x] **Step 1.2**: Test frameworks — pytest+pytest-django (backend), Vitest+RTL (frontend), verify tests pass
- [x] **Step 2**: Django backend — models, admin, serializers, viewsets, seed command, unit tests
- [x] **Step 3**: React frontend — Tailwind theming, useFetch hook, all components, API wiring, smooth scroll, responsive, tests
- [x] **Step 4**: Integration & polish — full stack Docker Compose, seed on first run, loading/error states
- [x] **Step 5**: Production readiness — multi-stage Dockerfile, nginx, docker-compose.prod.yml, Django hardening, .dockerignore, Makefile targets, README
- [x] **Step 6**: SSL + reverse proxy — nginx reverse proxy with Let's Encrypt SSL, HTTPS redirect, routes `/api/` and `/admin/` to backend

## Verification Checklist

- [x] `docker compose up --build` starts all 3 services without errors
- [x] `docker compose exec backend pytest` — all backend tests pass
- [x] `docker compose exec frontend npx vitest run` — all frontend tests pass
- [x] Django Admin at `localhost:8000/admin/` — can CRUD skills/experience/certifications
- [x] API returns JSON at `localhost:8000/api/skills/`, `/api/experience/`, `/api/certifications/`
- [x] Frontend at `localhost:3000` renders all sections with data from API
- [x] Theme toggle switches between light and dark mode
- [x] Site is responsive on mobile viewport

## Phase 2: AI Chat Widget

### Architecture
```
User → ChatWidget (React) → POST /api/chat/ → Django view
         ↑ streaming tokens                      ↓
         ← text/event-stream            ┌── PromptBuilder (context layer)
                                        │     reads static files:
                                        │     ├── resume_context.json
                                        │     └── qa_pairs.json
                                        │     builds system prompt
                                        └── LLMClient (API layer)
                                              Groq SDK → Llama 3.3 70B
```

### Key Files
- `backend/resume_api/data/resume_context.json` — structured resume data
- `backend/resume_api/data/qa_pairs.json` — pre-answered Q&A pairs
- `backend/resume_api/prompt.py` — loads context, builds system prompt
- `backend/resume_api/llm.py` — Groq SDK wrapper (swappable)
- `backend/resume_api/models.py` — ChatLog model
- `frontend/src/components/ChatWidget.jsx` — floating chat widget

### Implementation Steps
- [x] **Step 7**: Backend dependencies — `groq`, `django-ratelimit`
- [x] **Step 8**: Static context files — `resume_context.json`, `qa_pairs.json`
- [x] **Step 9**: Prompt builder (`prompt.py`) and LLM client (`llm.py`)
- [x] **Step 10**: ChatLog model and admin registration
- [x] **Step 11**: SSE chat view (`POST /api/chat/`) with rate limiting
- [x] **Step 12**: Nginx SSE support (`proxy_buffering off`)
- [x] **Step 13**: ChatWidget React component and App mount
- [x] **Step 14**: Backend tests (`test_chat.py`) and frontend tests (`ChatWidget.test.jsx`)
- [x] **Step 15**: Environment variables update (`.env`, `.env.example`, `.env.prod.example`)

## Phase 3: Chat Endpoint Security Hardening

### Implementation Steps
- [x] **Step 16**: Honeypot field — hidden `website` field in frontend, backend silently returns fake response for bots
- [x] **Step 17**: Re-enable CSRF protection — removed `@csrf_exempt`, added `CSRF_COOKIE_HTTPONLY = False`, frontend sends `X-CSRFToken` header
- [x] **Step 18**: Groq API timeout — `timeout=30` on Groq client to prevent hanging workers
- [x] **Step 19**: Nginx hardening — `client_max_body_size 2k` on `/api/`, `limit_req_zone` + `limit_req` for `/api/chat/` (2r/s burst 5)
- [x] **Step 20**: JS timestamp challenge — frontend sends `_ts` (widget open time), backend rejects requests < 3s old
- [x] **Step 21**: Updated tests — honeypot, timestamp, CSRF enforcement tests; rate-limit bypass for streaming tests
