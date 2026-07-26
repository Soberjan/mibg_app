# AGENTS.md

## Commands
- Install runtime deps with `pip install -r requirements.txt`; there is no lockfile or task runner.
- Run the app from the repo root so relative static/template paths resolve: `fastapi dev src/main.py`.
- Focused tests use pytest directly, for example `pytest tests/core/test_lobbies.py`; `pyproject.toml` adds `src` to `PYTHONPATH` and limits discovery to `tests`.
- Current `pytest` collection is broken: tests import stale top-level modules (`core.*`, `database.database_fixture`, `core.player`) while app code uses package-relative imports under `src`.

## App Wiring
- Main FastAPI entrypoint is `src/main.py`; importing it calls `load_dotenv()` and `Config.init()` before routers are imported.
- Startup creates `Database()`, calls `connect()`, stores `database`, `hostess`, and `templates` on `app.state`, restores lobby state from Postgres, and starts a 1-second heartbeat task.
- Templates and static files are hard-coded as `src/static/templates/` and `src/static`, so commands must run from the repository root unless the code is changed.
- Routers live in `src/routers/` and `src/routers/lobby/`; shared request dependencies are only thin accessors in `src/dependencies.py`.

## Database
- Required env vars are shown in `env_template`: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`; only host/name/user/password are read by `src/config.py`.
- The app expects PostgreSQL via `psycopg2`; startup will try to connect immediately and query/update tables such as `server_state`, `loan`, `deposit`, and `lobby`.
- Migrations are plain SQL files in `src/migrations/`; tests apply them with `sorted(os.listdir("src/migrations"))`, so keep numeric filename prefixes zero-padded and ordered.
- Database tests, when repaired, create/drop a `testing` schema in the configured database and run migrations into that schema.

## Repository Notes
- There is no README, CI workflow, formatter/linter config, or existing agent instruction file in the repo.
- Do not rely on generated code or migration tooling; none is configured.
- Existing untracked/local secrets are ignored via `.env`, `.token`, and `.imap`; do not commit local environment files.
