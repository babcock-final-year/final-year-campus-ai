#!/usr/bin/env python3
"""
Small helper script to ensure database tables exist for the backend.

Usage:
  - Create tables (safe default):
      python ensure_tables.py

  - Force create tables against any DB (use with care in production):
      python ensure_tables.py --yes

  - Drop all tables then recreate (destructive):
      python ensure_tables.py --drop --yes

Notes:
  - This script adds the backend package path to sys.path so it can be
    executed from the repository root or from this scripts directory.
  - It prefers safety: if the configured SQLALCHEMY_DATABASE_URI does not
    look like a local sqlite file the script will refuse unless --yes is provided.
"""
from __future__ import annotations

import argparse
import os
import sys
import traceback
from typing import Optional

# Ensure the backend package is importable when script is executed from repo root.
# This script lives in: apps/backend/scripts/ensure_tables.py
# We want to add apps/backend to sys.path so `import app` works.
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.normpath(os.path.join(SCRIPT_DIR, ".."))
sys.path.insert(0, BACKEND_ROOT)

try:
    from app import create_app, db  # type: ignore
except Exception as exc:  # pragma: no cover - runtime guard
    print("ERROR: Failed to import application package `app`.")
    print("Make sure you run this script from the repository, and that the backend dependencies are installed in your virtualenv.")
    print("Import error details:")
    traceback.print_exc()
    raise SystemExit(2)


def is_sqlite_uri(uri: Optional[str]) -> bool:
    if not uri:
        return False
    uri = uri.lower().strip()
    return uri.startswith("sqlite://") or uri.startswith("sqlite:")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Ensure DB tables exist for the backend (uses app.create_app/config)."
    )
    parser.add_argument(
        "--config",
        "-c",
        default=os.getenv("FLASK_CONFIG", "default"),
        help="Flask config name (default: environment FLASK_CONFIG or 'default')",
    )
    parser.add_argument(
        "--yes",
        "-y",
        action="store_true",
        help="Proceed without interactive confirmation (required to run against non-sqlite DB).",
    )
    parser.add_argument(
        "--drop",
        action="store_true",
        help="Drop all tables before creating them (destructive). Requires --yes for non-sqlite DBs.",
    )
    args = parser.parse_args()

    app = create_app(args.config)

    db_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    print(f"Using SQLALCHEMY_DATABASE_URI: {db_uri!r}")

    if not is_sqlite_uri(db_uri) and not args.yes:
        print(
            "\nDetected a non-sqlite database URI. To avoid accidental data loss this script will refuse to run "
            "unless you provide --yes on the command line.\nIf you intended to proceed, re-run with --yes.\n"
        )
        return 3

    try:
        with app.app_context():
            if args.drop:
                print("Dropping all tables (db.drop_all())...")
                db.drop_all()
                print("Drop complete.")

            print("Creating tables from models (db.create_all())...")
            db.create_all()
            print("Tables created/ensured with create_all().")

            # Best-effort: if Flask-Migrate (Alembic) is available, stamp the migrations
            # repository to the current head so future `flask db upgrade` calls do not try
            # to reapply these changes.
            try:
                from flask_migrate import stamp  # type: ignore

                try:
                    stamp()
                    print("Alembic repository stamped to current head (if migrations exist).")
                except Exception:
                    print("Alembic stamp operation failed (non-fatal).")
                    traceback.print_exc()
            except Exception:
                # flask-migrate not installed or not available; ignore.
                pass

    except Exception:
        print("ERROR: Failed while creating tables.")
        traceback.print_exc()
        return 4

    print("Database table ensure operation finished successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
