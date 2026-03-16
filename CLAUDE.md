# Resume/CV Website

## Plan Tracking
- The project plan lives in `PLAN.md` at the repository root.
- When a task/step is completed, mark it as done (`[x]`) in `PLAN.md`.
- When requirements change (new features, tech changes, structural changes), update `PLAN.md` to reflect the current state.
- Keep the project structure, tech stack, and verification checklist in `PLAN.md` accurate and up to date.

## Key Conventions
- Use `docker compose` (v2, no hyphen), NOT `docker-compose` (v1 is outdated on this machine).
- Python environment: `uv` for venv and package management. Backend venv is at `backend/.venv/`.
- DB container maps to host port **5442** (5432 is used by local PostgreSQL).
- Backend tests: `cd backend && .venv/bin/pytest` (local) or `docker compose exec backend pytest` (Docker).
- Frontend tests: `cd frontend && npx vitest run` (local) or `docker compose exec frontend npx vitest run` (Docker).

## Running Backend Locally (outside Docker)
1. Start just the DB: `docker compose up db`
2. Activate venv: `cd backend && source .venv/bin/activate`
3. Run migrations: `python manage.py migrate`
4. Seed data: `python manage.py seed_resume`
5. Run server: `python manage.py runserver`
6. Run tests: `pytest`

Config is loaded from `backend/.env` (auto-read by `settings.py`, uses `os.environ.setdefault` so Docker env vars take precedence).
