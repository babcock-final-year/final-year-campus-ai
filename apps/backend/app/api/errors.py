"""Centralised API error definitions and handlers.

This module defines common API exceptions and registers error handlers on the
`api` blueprint so handlers are consistent across endpoints.
"""

import traceback
from typing import Any

from flask import jsonify

# Handle flask-jwt-extended exceptions gracefully
try:
    from flask_jwt_extended.exceptions import JWTExtendedException
except Exception:
    JWTExtendedException = None

from ..services.logger import get_logger
from . import api

logger = get_logger(__name__)


class APIError(Exception):
    """Base API exception with an HTTP status code and optional payload."""

    status_code: int = 500

    def __init__(
        self,
        message: str = "An error occurred",
        status_code: int | None = None,
        payload: dict[str, Any] | None = None,
    ):
        super().__init__(message)
        if status_code is not None:
            self.status_code = status_code
        self.message = message
        self.payload = payload

    def to_dict(self) -> dict[str, Any]:
        rv = {"ok": False, "message": self.message}
        if self.payload is not None:
            rv["errors"] = self.payload
        return rv


class BadRequestError(APIError):
    status_code = 400


class UnauthorizedError(APIError):
    status_code = 401


class ForbiddenError(APIError):
    status_code = 403


class NotFoundError(APIError):
    status_code = 404


class ConflictError(APIError):
    status_code = 409


class InternalServerError(APIError):
    status_code = 500


@api.errorhandler(APIError)
def handle_api_error(error: APIError):
    """Return JSON for APIError subclasses."""
    logger.warning(f"APIError: {error.status_code} {error.message}")
    return jsonify(error.to_dict()), error.status_code


# Specific handler for JWT errors so authentication failures return 401
if JWTExtendedException is not None:

    @api.errorhandler(JWTExtendedException)
    def handle_jwt_error(error: Exception):
        logger.warning(f"JWT error: {error}")
        resp = {"ok": False, "message": str(error) or "Unauthorized"}
        return jsonify(resp), 401


@api.errorhandler(Exception)
def handle_unexpected_error(error: Exception):
    """Catch-all handler for uncaught exceptions.

    Logs a full traceback, and returns a generic 500 response. For debugging
    environments you may want to include more details but avoid leaking
    internal state in production.
    """
    tb = traceback.format_exc()
    logger.error(f"Unhandled exception: {error}\n{tb}")
    # Don't leak full traceback in response by default; keep minimal message
    resp = {"ok": False, "message": "Internal server error"}
    return jsonify(resp), 500


def abort_bad_request(message: str = "Bad request", payload: dict[str, Any] | None = None):
    raise BadRequestError(message=message, payload=payload)


def abort_unauthorized(message: str = "Unauthorized"):
    raise UnauthorizedError(message=message)


def abort_forbidden(message: str = "Forbidden"):
    raise ForbiddenError(message=message)


def abort_not_found(message: str = "Not found"):
    raise NotFoundError(message=message)


def abort_conflict(message: str = "Conflict"):
    raise ConflictError(message=message)
