# `backend`

## Setup

You'll need `uv` to do anything, get it from the official website [here](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer).

For typegen, you'll need [bun](https://bun.sh) since it's use to install `json2ts` on the fly.

## Database (dev)

If you see errors like `sqlite3.OperationalError: no such table: users`, your local dev SQLite DB hasn't been migrated yet.

Run the migrations to create tables:

```sh
PYTHONPATH=. .venv/bin/flask --app wsgi.py db upgrade
```

This will create/update the dev DB file configured by `DEV_DATABASE_URL` (or default `data-dev.db`).

## Run (dev)

If you see errors like `The current Flask app is not registered with this 'SQLAlchemy' instance`, it usually means you're running Flask with the wrong entrypoint.

Run the dev server with the `wsgi.py` entrypoint:

```sh
uv run python -m flask --app wsgi.py run --host 0.0.0.0 --port 5000 --debug
```
