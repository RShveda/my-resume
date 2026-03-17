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

## Production Deployment (GCP)
- **Host**: GCP e2-micro (1 GB RAM) in us-west1 with a static external IP.
- **Domain**: `roman-shveda.duckdns.org` (DuckDNS free dynamic DNS).
- **SSL**: Let's Encrypt via `certbot`, auto-renewed by certbot's built-in scheduled task.
- **Swap**: 1 GB swap file on the VM to compensate for limited RAM.
- **Docker API**: `DOCKER_API_VERSION=1.41` is set in `~/.bashrc` on the VM (client/engine version mismatch workaround).

### Architecture
```
Internet → nginx (ports 80/443, SSL termination)
             ├── /           → frontend (nginx serving static React build, port 3000)
             ├── /api/       → backend (gunicorn, port 8000)
             ├── /admin/     → backend (Django admin)
             └── /static/    → backend (Django static files)
           HTTP → HTTPS redirect
           PostgreSQL (internal only, port 5432)
```

### Key Files
- `docker-compose.prod.yml` — production stack (db, backend, frontend, nginx reverse proxy).
- `nginx/nginx.conf` — SSL reverse proxy config.
- `.env.prod` — production secrets (not committed). Template: `.env.prod.example`.

### Production Commands
- All `make prod-*` commands use `--env-file .env.prod` for compose variable interpolation.
- `make prod-up` — build and start. `make prod-down` — stop. `make prod-logs` — follow logs.
- Gunicorn runs with **2 workers** (reduced from 3 for e2-micro memory constraints).

### Deploy Workflow (on the VM)
```bash
cd ~/resume && git pull && make prod-up
```
