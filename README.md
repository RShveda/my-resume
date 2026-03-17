# Resume / CV Website

A personal resume website with a React + Tailwind frontend and a Django REST API backend, all containerized with Docker Compose.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Backend | Django 5, Django REST Framework |
| Database | PostgreSQL 16 |
| Containers | Docker, Docker Compose v2 |
| Python env | uv |

## Prerequisites

- Docker & Docker Compose v2
- Node.js 20+ and npm (for local frontend dev)
- Python 3.12+ and [uv](https://github.com/astral-sh/uv) (for local backend dev)
- GNU Make (optional, for convenience targets)

## Local Development

### With Docker (recommended)

```bash
cp .env.example .env    # edit as needed
make up                 # builds and starts all services
```

- Frontend: http://localhost:3000 (Vite dev server with HMR)
- Backend API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/
- PostgreSQL: localhost:5442

```bash
make logs   # follow container logs
make down   # stop all services
```

### Without Docker

Start the database container, then run backend and frontend locally:

```bash
make db                 # start PostgreSQL in Docker
make install            # install backend + frontend deps
make migrate            # run Django migrations
make seed               # seed resume data
make run-backend        # start Django dev server (port 8000)
make run-frontend       # start Vite dev server (port 3000) — in another terminal
```

## Running Tests

```bash
make test               # run all tests (backend + frontend)
make test-backend       # backend only (pytest)
make test-frontend      # frontend only (vitest)
```

## Production Deployment

Intended for a Cloud VM with a `git pull` + `docker compose` workflow.

### 1. Configure environment

```bash
cp .env.prod.example .env.prod
# Edit .env.prod — set strong passwords, domain, secret key
```

### 2. Obtain SSL certificate

Install certbot and get a Let's Encrypt certificate (stop any services using port 80 first):

```bash
sudo apt-get install -y certbot
sudo certbot certonly --standalone -d roman-shveda.duckdns.org
```

Set up auto-renewal:

```bash
echo "0 3 * * * certbot renew --quiet && docker compose -f ~/resume/docker-compose.prod.yml --env-file ~/resume/.env.prod restart nginx" | sudo crontab -
```

### 3. Build and start

```bash
make prod-up            # uses --env-file .env.prod automatically
```

An nginx reverse proxy handles SSL termination and routes:
- `https://roman-shveda.duckdns.org` → frontend
- `https://roman-shveda.duckdns.org/api/` → backend API
- `https://roman-shveda.duckdns.org/admin/` → Django admin

HTTP requests are redirected to HTTPS automatically.

### 4. Updating

```bash
git pull
make prod-up            # rebuilds and restarts
```

### 5. Other production commands

```bash
make prod-logs          # follow logs
make prod-down          # stop all services
```

> All `prod-*` commands pass `--env-file .env.prod` so that variable interpolation in the compose file works correctly.

## Makefile Reference

| Command | Description |
|---------|-------------|
| `make up` | Build and start dev stack |
| `make down` | Stop dev stack |
| `make logs` | Follow dev logs |
| `make db` | Start only PostgreSQL |
| `make run-backend` | Run Django dev server locally |
| `make run-frontend` | Run Vite dev server locally |
| `make migrate` | Run makemigrations + migrate |
| `make seed` | Migrate + seed resume data |
| `make test` | Run all tests |
| `make test-backend` | Run backend tests |
| `make test-frontend` | Run frontend tests |
| `make install` | Install all dependencies |
| `make prod-up` | Build and start production stack |
| `make prod-down` | Stop production stack |
| `make prod-logs` | Follow production logs |

## Project Structure

```
resume/
├── docker-compose.yml          # Dev compose
├── docker-compose.prod.yml     # Production compose
├── Makefile
├── .env.example                # Dev environment template
├── .env.prod.example           # Production environment template
├── nginx/
│   └── nginx.conf              # SSL reverse proxy config
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── config/                 # Django project settings
│   ├── resume_api/             # Django app (models, views, serializers)
│   └── tests/
└── frontend/
    ├── Dockerfile              # Multi-stage (dev + prod)
    ├── nginx.conf              # Production nginx config
    ├── src/
    │   ├── components/         # React components
    │   ├── hooks/              # Custom hooks (useFetch)
    │   ├── api/                # API client
    │   └── __tests__/          # Frontend tests
    └── package.json
```
