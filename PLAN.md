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
│   │   ├── models.py         # Skill, Experience, ExperienceBullet, Certification
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── management/commands/seed_resume.py
│   └── tests/
│       └── test_api.py
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
        │   ├── ThemeToggle.jsx
        │   └── Footer.jsx
        ├── hooks/
        │   └── useFetch.js
        └── __tests__/
            ├── App.test.jsx
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

## Verification Checklist

- [x] `docker compose up --build` starts all 3 services without errors
- [x] `docker compose exec backend pytest` — all backend tests pass
- [x] `docker compose exec frontend npx vitest run` — all frontend tests pass
- [x] Django Admin at `localhost:8000/admin/` — can CRUD skills/experience/certifications
- [x] API returns JSON at `localhost:8000/api/skills/`, `/api/experience/`, `/api/certifications/`
- [x] Frontend at `localhost:3000` renders all sections with data from API
- [x] Theme toggle switches between light and dark mode
- [x] Site is responsive on mobile viewport

## Phase 2 (Future): AI Chat Widget

| Decision | Recommendation |
|----------|---------------|
| Chat UI | `@chatscope/chat-ui-kit-react` |
| Communication | SSE via Django `StreamingHttpResponse` |
| AI Backend | Groq free tier (Llama 3.3 70B) |
| Rate Limiting | `django-ratelimit` (10 req/hr per IP) |
| Cost | $0/month |
