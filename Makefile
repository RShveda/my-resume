# Docker commands
up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

# Local backend (connects to Docker DB on port 5442)
db:
	docker compose up db -d

run-backend: db
	cd backend && .venv/bin/python manage.py runserver

makemigrations:
	cd backend && .venv/bin/python manage.py makemigrations

migrate: makemigrations
	cd backend && .venv/bin/python manage.py migrate

seed: migrate
	cd backend && .venv/bin/python manage.py seed_resume

createsuperuser:
	cd backend && .venv/bin/python manage.py createsuperuser

# Local frontend
run-frontend:
	cd frontend && npm run dev

# Tests
test-backend:
	cd backend && .venv/bin/pytest

test-frontend:
	cd frontend && npx vitest run

test: test-backend test-frontend

# Backend dependencies (uv)
install-backend:
	cd backend && uv pip install -r requirements.txt

# Frontend dependencies
install-frontend:
	cd frontend && npm install

install: install-backend install-frontend

# Production commands
prod-up:
	docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d

prod-down:
	docker compose -f docker-compose.prod.yml --env-file .env.prod down

prod-logs:
	docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f

.PHONY: up down logs db run-backend makemigrations migrate seed createsuperuser run-frontend test-backend test-frontend test install-backend install-frontend install prod-up prod-down prod-logs
