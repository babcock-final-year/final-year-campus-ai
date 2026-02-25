#!/usr/bin/env bash
set -euo pipefail

cd "${0%/*}/../apps/backend" || exit 1

# Fix lint issues where possible
uv run ruff check --fix "$@"

# Actually format the files
uv run ruff format "$@"

# Re-run check to confirm everything is clean (fails commit if still broken)
uv run ruff check "$@"
