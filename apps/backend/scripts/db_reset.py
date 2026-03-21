#!/usr/bin/env python3
"""
Safe DB reset helper for the backend.

This script will drop and recreate all tables using the application's models.
It includes safeguards to avoid accidentally resetting a non-local (production)
database.

Usage:
  - Interactive (safe, default):
      python db_reset.py

  - Non-interactive / force (use with care):
      python db_reset.py --yes

  - Force reset even if DB looks non-sqlite (dangerous):
      python db_reset.py --yes --force

Notes:
  - The script expects to be located at: apps/backend/scripts/db_reset.py
    and will add the backend package path to sys.path so `import app` works.
  - Prefer using Alembic migrations in production. This script is intended
    for development and test environments.
"""
from __future__ import annotations

import argparse
import os
import sys
import traceback
from typing import Optional

# Ensure we can import the backend package when executed from the repository root.
# Script path is: repo/apps/backend/scripts/db_reset.py
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.normpath(os.path.join(SCRIPT_DIR, ".."))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

try:
    from app import create_app, db  # type: ignore
except Exception as exc:  # pragma: no cover - runtime guard
    print("ERROR: Failed to import backend application package `app`.")
    print("Make sure you run this script from the repository and that the backend virtualenv dependencies are installed.")
    print("Import error details:")
    traceback.print_exc()
    raise SystemExit(2)


def _is_sqlite_file(uri: Optional[str]) -> bool:
    """
    Heuristic to decide if a SQLALCHEMY_DATABASE_URI is a local sqlite file.
    Accepts both 'sqlite:///relative/path.db' and 'sqlite:////absolute/path.db'.
    """
    if not uri:
        return False
    uri = uri.lower().strip()
    return uri.startswith("sqlite:///") or uri.startswith("sqlite:////") or uri == "sqlite:///:memory:"


def _suspicious_non_sqlite(uri: Optional[str]) -> bool:
    """
    Return True if the DB URI looks like a non-sqlite (potentially remote) DB.
    """
    if not uri:
        return True
    uri = uri.lower().strip()
    return not uri.startswith("sqlite")


def ask_confirmation(prompt: str) -> bool:
    """Ask the user for Y/N confirmation. Returns True if user confirms."""
    try:
        resp = input(f"{prompt} [y/N]: ").strip().lower()
        return resp in ("y", "yes")
    except (KeyboardInterrupt, EOFError):
        print("\nAborted by user.")
        return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Drop and recreate the backend database tables (safe defaults).")
    parser.add_argument("--yes", "-y", action="store_true", help="Proceed without interactive confirmation.")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force operation even if the DB URI looks non-sqlite. Implies --yes (dangerous).",
    )
    parser.add_argument(
        "--drop-only",
        action="store_true",
        help="Only drop tables (do not recreate). Use with caution.",
    )
    parser.add_argument(
        "--config",
        "-c",
        default=os.getenv("FLASK_CONFIG", "default"),
        help="Flask config name to use (default: env FLASK_CONFIG or 'default')",
    )
    args = parser.parse_args()

    if args.force:
        args.yes = True

    app = create_app(args.config)
    db_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    print(f"Using SQLALCHEMY_DATABASE_URI: {db_uri!r}")

    # Safety checks
    if _suspicious_non_sqlite(db_uri) and not args.yes:
        print("\nDetected a non-sqlite (likely remote) database URI:")
        print(f"  {db_uri}")
        print(
            "This script will NOT reset non-sqlite or remote databases by default to avoid accidental data loss.\n"
            "If you really intend to reset this database, re-run with --yes and --force."
        )
        return 3

    if _suspicious_non_sqlite(db_uri) and args.yes and not args.force:
        # If user supplied --yes but DB looks remote, require explicit --force
        print("\nThe database URI looks non-sqlite (remote). To proceed you must add --force.")
        return 4

    if not _is_sqlite_file(db_uri):
        # If it's sqlite but not obviously a path (e.g., memory), still ask unless --yes
        if not args.yes:
            if not ask_confirmation("Proceed to drop and recreate this database? This is destructive."):
                print("Aborted by user.")
                return 5

    else:
        # For sqlite files: if the file path doesn't look like the dev DB, warn the user.
        if db_uri.startswith("sqlite:///") and "data-dev.db" not in db_uri and not args.yes:
            print("\nDetected a sqlite file that does not look like the standard dev DB:")
            print(f"  {db_uri}")
            if not ask_confirmation("Are you sure you want to drop and recreate this sqlite DB?"):
                print("Aborted by user.")
                return 6

    # Run drop and create within app context
    try:
        with app.app_context():
            print("Dropping all tables (db.drop_all())...")
            db.drop_all()
            print("Drop complete.")

            if args.drop_only:
                print("Drop-only requested; exiting without creating tables.")
                return 0

            print("Creating tables from models (db.create_all())...")
            db.create_all()
            print("Tables created successfully.")

            # Best-effort: stamp alembic repository to head if flask-migrate is available.
            try:
                from flask_migrate import stamp  # type: ignore

                try:
                    stamp()
                    print("Alembic repository stamped to current head (if migrations exist).")
                except Exception:
                    print("Alembic stamp operation failed (non-fatal).")
                    traceback.print_exc()
            except Exception:
                # flask-migrate not installed or import failed; ignore.
                pass

    except Exception:
        print("ERROR: Exception occurred while resetting database.")
        traceback.print_exc()
        return 7

    print("Database reset finished successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
