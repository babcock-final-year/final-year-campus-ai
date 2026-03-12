from flask import Blueprint

api = Blueprint("api", __name__)

from . import (  # noqa: E402
    auth as auth,
    chat as chat,
    complaint as complaint,
    errors as errors,
    history as history,
    users as users,
)
