FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

COPY . .

RUN addgroup --system app && adduser --system --ingroup app app \
    && chown -R app:app /app

EXPOSE 8000

# Default to non-root. Compose commands that need root (collectstatic with
# host volume mounts) use the entrypoint wrapper to drop privileges for
# gunicorn only.
USER app
