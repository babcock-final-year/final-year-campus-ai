# UniPal — Backend (Babcock University RAG Chatbot)

This repository contains the backend for UniPal — a Retrieval-Augmented Generation (RAG) chatbot prototype created for Babcock University. The backend is a Flask application that provides authentication, user/profile management, chat and history persistence, complaint reporting, and a RAG pipeline that uses local text data + embeddings + a hosted LLM to answer user queries.

This README documents the backend layout, how the RAG pipeline works, environment variables, local setup, useful commands, and how to run ingestion and the backend locally.

---

Table of contents
- Overview
- Project layout
- Key concepts (RAG pipeline)
- API highlights & routes
- Environment variables
- Quick start (local dev)
- Ingestion pipeline
- Database, migrations & tests
- Deployment notes & tips
- Troubleshooting & logs
- Contributing

---

Overview
--------
The backend is a Flask API implementing:
- Email/password + Google OAuth authentication (with JWT)
- Guest accounts
- Chat persistence: chats and messages stored in a relational DB
- RAG pipeline that:
  - Loads university documents from a `data` directory
  - Splits documents into chunks
  - Embeds them and stores vectors in a Chroma vector DB
  - Retrieves relevant chunks at query time and calls a chat LLM with a prompt
- Basic complaints ticketing system and avatar upload support
- API documentation served via Swagger (SpecTree)

Project layout
--------------
Top-level relevant files & folders (root: `apps/backend`)
- `run.py` — entry point for running the app and helper CLI commands (tests, shell context)
- `config.py` — central config and environment variables
- `requirements.txt` / `pyproject.toml` — Python dependencies and tooling
- `prompt.txt` — prompt template used by the LLM chain
- `app/` — Flask application package
  - `app/__init__.py` — application factory and extension init (DB, JWT, Mail, Spec)
  - `app/models.py` — SQLAlchemy models: `User`, `Chat`, `Message`, `Complaint`, `TokenBlocklist`
  - `app/schemas.py` — Pydantic models used for request/response validation
  - `app/api/` — API blueprints and endpoints:
    - `auth.py`, `users.py`, `chat.py`, `history.py`, `complaint.py`, plus helpers (`decorators.py`, `errors.py`)
  - `app/core/` — RAG and ingestion logic:
    - `core/ingest.py` — ingestion pipeline driver (incremental)
    - `core/rag/` — RAG components (loader, splitter, vectorstore, retriever, llm)
      - `embeddings/` — provider-specific embedding wrappers (`hf.py`, `gemini.py`)
  - `app/services/` — small helpers (mailer, logger, Chainlit demo)
  - `app/templates/` — email templates (confirmation, reset, change email)
- `chroma_db/` — (default) persistence dir for Chroma databases (configured via `CHROMA_PATH`)
- `data/` (configurable) — folder with source documents (`.md`, `.txt`, `.csv`, `.json`) used for ingestion

Key concepts — RAG pipeline
---------------------------
High-level flow when a user sends a chat message:
1. User POSTs to `/api/v1/chat/<chat_id>/message` with message content.
2. Backend saves the user message (SQL).
3. Backend instantiates:
   - `VectorStore` (Chroma wrapper) — loads embeddings backend based on `use_model` (HF or Gemini).
   - `Retriever` — returns most relevant document chunks for the query.
   - `LLM` — composes retriever -> prompt -> primary LLM (Gemini via Google GenAI) with fallback to Groq.
4. LLM returns the assistant text; backend saves assistant message and returns it to the client.

RAG implementation files:
- `app/core/rag/loader.py` — loads files into LangChain `Document`s
- `app/core/rag/splitter.py` — smart splitting (Markdown headers + recursive splitting)
- `app/core/rag/embeddings/` — provider wrappers:
  - `hf.py` — Hugging Face endpoint embeddings
  - `gemini.py` — Google Gemini embeddings
- `app/core/rag/vectorstore.py` — Chroma wrapper (persistence, add/delete/search)
- `app/core/rag/retriever.py` — returns relevant chunks (also exposes RunnableLambda for LCEL composition)
- `app/core/rag/llm.py` — chat LLM wrapper (primary Gemini + Groq fallback), loads `prompt.txt`

API highlights
--------------
Base URL prefix: `/api/v1`
(Full interactive docs are served by SpecTree at `/apidoc/swagger/`)

Auth & users
- `POST /api/v1/auth/register` — register (email/password)
- `GET  /api/v1/auth/confirm/<token>` — confirm registration via token
- `POST /api/v1/auth/login` — login (returns access & refresh JWTs)
- `POST /api/v1/auth/refresh` — refresh access token (requires refresh JWT)
- `POST /api/v1/auth/guest` — get a guest account
- `POST /api/v1/auth/google` — Google OAuth token exchange
- `POST /api/v1/auth/logout` — revoke current token
- `GET  /api/v1/auth/me` — current user
- `PUT  /api/v1/users/<user_id>` — update profile (guarded)
- `POST /api/v1/users/<user_id>/avatar` — upload avatar (file multipart)

Chat & RAG
- `POST /api/v1/chat` — create a new chat
- `GET  /api/v1/chat/<chat_id>` — fetch chat history
- `POST /api/v1/chat/<chat_id>/message` — post a message → triggers RAG and returns assistant reply

History
- `GET /api/v1/history/chats` — list user's chats
- `DELETE /api/v1/history/chats` — delete all user's chats
- `GET /api/v1/history/chat/<chat_id>/messages` — messages in a chat
- `DELETE /api/v1/history/chat/<chat_id>` — delete chat
- `POST /api/v1/history/chat/<chat_id>/message/<msg_id>/like` — like/unlike a message
- `GET /api/v1/history/search?q=...` — search messages across the user's chats

Complaints
- `POST /api/v1/complaints` — create complaint
- `GET  /api/v1/complaints` — list complaints (admins / confirmed users see all)
- `GET  /api/v1/complaints/<id>` — get a complaint (with ownership checks)

Environment variables
---------------------
The app reads configuration from environment variables (defaults are in `config.py`). Important variables:

Authentication / app
- `SECRET_KEY` — Flask secret key (defaults to random if not set)
- `JWT_SECRET_KEY` — JWT signing secret (defaults to random if not set)
- `FLASK_CONFIG` — one of `development`, `testing`, `production` (defaults to `development`)
- `BASE_URL` — frontend base (used to construct email confirmation/reset links)

Database & persistence
- `DEV_DATABASE_URL`, `TEST_DATABASE_URL`, `DATABASE_URL` — connection URIs (production)
- `DATA_DIRECTORY` — directory containing source files for ingestion (default: `data`)
- `CHROMA_PATH` — directory where Chroma persistence is stored (default: `chroma_db`)
- `PROMPT_PATH` — path to prompt template used by LLM (default: `prompt.txt`)
- `TOP_K` — number of documents to retrieve for each query (default 5)
- `UPLOAD_FOLDER` — path to store uploaded avatars (default: `uploads/`)

Mail (for confirmation / reset)
- `MAIL_USERNAME` — SMTP username
- `MAIL_PASSWORD` — SMTP password
- `MAIL_DEFAULT_SENDER` — default sender email

LLM / embeddings providers
- `GEMINI_API_KEY` — Google Gemini API key (primary LLM + embeddings if used)
- `GEMINI_LLM_MODEL` — Gemini LLM model id (default set in config)
- `GEMINI_EMBEDDINGS_MODEL` — Gemini embeddings model id
- `HF_EMBEDDINGS_MODEL` — Hugging Face embeddings endpoint/model (when using HF)
- `HF_ACCESS_TOKEN` — Hugging Face token for endpoint use
- `GROQ_API_KEY` — Groq API key (fallback model)
- `GROQ_LLM_MODEL` — Groq LLM model id

Other
- `GOOGLE_CLIENT_ID` — for Google OAuth verification
- Email token expiry settings: `CONFIRM_TOKEN_EXPIRES`, `RESET_TOKEN_EXPIRES`, `EMAIL_CHANGE_TOKEN_EXPIRES`

Quick start — local development
-------------------------------
1. Create a Python venv and activate it
   - Use a recent Python (project targets 3.13 in pyproject)
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and set required values (see environment variables above). In development you can leave many keys blank but you should set:
   - `DEV_DATABASE_URL` (or rely on default sqlite `data-dev.db`)
   - `GEMINI_API_KEY` / `HF_ACCESS_TOKEN` / `GROQ_API_KEY` if you plan to use RAG
   - Mail credentials if you want email flows
4. Initialize DB migrations (one-time):
   - `export FLASK_APP=run.py` (or set equivalent on Windows)
   - `flask db init` (only on fresh repo)
   - `flask db migrate -m "initial"` 
   - `flask db upgrade`
   Alternatively, the app uses `run.py` and you can also create schema programmatically if needed.
5. Run the app:
   - `python run.py`
   - App listens on port 5000 by default. The application factory registers routes under `/api/v1` and serves API docs at `/apidoc/swagger/`.

Notes:
- To run the tests: `python run.py test` will discover tests under `tests/`.
- Set `FLASK_CONFIG=development` for debug mode (or `production` when deploying).

Ingestion pipeline
------------------
- Incremental ingestion is implemented in `app/core/ingest.py`.
- The ingestion script discovers files under `DATA_DIRECTORY`, computes file hashes to avoid re-ingesting unchanged files, splits and embeds changed files, and upserts deterministic chunk IDs to Chroma.
- Supported source file extensions: `.md`, `.txt`, `.csv`, `.json`.
- How to run:
  - `python -m app.core.ingest --model hf` (or `--model gemini`)
  - In production you should set the appropriate provider environment variables: e.g. `HF_EMBEDDINGS_MODEL` + `HF_ACCESS_TOKEN` or `GEMINI` keys.

Database & migrations
---------------------
- SQLAlchemy is used with Flask-Migrate (Alembic).
- Migration workflow:
  - `flask db migrate -m "desc"`
  - `flask db upgrade`
- Development defaults to SQLite (`data-dev.db`) but production should use `DATABASE_URL` (Postgres recommended).

Testing
-------
- Unit tests are discovered by `python run.py test`.
- Use test-specific database settings via `TEST_DATABASE_URL` (defaults to in-memory SQLite).

Deployment notes
----------------
- The app is a WSGI Flask application. For production use a WSGI server such as Gunicorn or a containerized deployment (Docker + orchestrator).
- Example (conceptual): run with Gunicorn:
  - `gunicorn -w 4 -b 0.0.0.0:8000 run:app`
- Ensure secure values for `SECRET_KEY`, `JWT_SECRET_KEY`, and provider API keys in production — do not commit them to source control.
- If using Chroma on disk, mount persistent storage at `CHROMA_PATH`.

Logging & monitoring
--------------------
- The project includes a simple logger service in `app/services/logger.py`. Logs are used across ingestion and API code to help debugging and to track ingestion results.
- Unhandled exceptions are caught at the API blueprint level and return standardized JSON error responses.

Security considerations
-----------------------
- JWTs are used for authentication; revoked tokens are stored in `TokenBlocklist`.
- Email confirmation flows add protection for account creation; `member_required` decorator enforces confirmed, non-guest members for sensitive operations.
- Uploaded files are currently stored on disk (see `UPLOAD_FOLDER`) and served by the frontend. In production, stream to cloud storage (S3/GCS) and do file type validation.

Troubleshooting (common)
------------------------
- Missing embeddings keys → ingestion or RAG searches will fail with provider errors. Ensure `HF_ACCESS_TOKEN` or `GEMINI_API_KEY` is set depending on `--model`.
- No documents found during ingestion → ensure `DATA_DIRECTORY` contains supported files and path is correct.
- Rate limits for Gemini → `vectorstore.add_documents` includes a short sleep when `model == "gemini"` to mitigate rate limits; tune if needed.
- "Session expired / missing token" errors come from JWT handlers — check token lifetimes and refresh flow.

Useful developer tips
---------------------
- The RAG LLM chain reads the prompt from `prompt.txt`. Edit it to change system instructions, temperature, or other behavior.
- `TOP_K` in `config.py` controls how many chunks are retrieved per query.
- The `ingest` script uses deterministic chunk IDs so re-running will upsert rather than duplicate content.
- SpecTree provides automatic request/response validation using the Pydantic schemas defined in `app/schemas.py`.

Contributing
------------
- Keep API contracts stable. If changing an endpoint, update `app/schemas.py` and SpecTree decorators.
- Add tests for new features and run `python run.py test`.
- Run code lint/formatting tools as defined in `pyproject.toml` (`ruff`) before submitting PRs.

License & authors
-----------------
- This project is a university prototype. Add your preferred license and contributor information here.

---
