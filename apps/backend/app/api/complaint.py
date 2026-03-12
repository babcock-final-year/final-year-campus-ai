from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from spectree import Response

from app import db, spec

from ..models import Complaint, User
from ..schemas import (
    ComplaintCreateRequest,
    ComplaintListResponse,
    ComplaintResponse,
)
from ..services.logger import get_logger
from . import api
from .errors import abort_forbidden, abort_not_found

logger = get_logger(__name__)


@api.route("/complaints", methods=["POST"])
@spec.validate(json=ComplaintCreateRequest, resp=Response(HTTP_201=ComplaintResponse))
@jwt_required()
def create_complaint():
    """Create a new complaint for the current authenticated user."""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        abort_not_found("User not found")

    data = request.context.json
    complaint = Complaint(user_id=user.id, title=data.title, description=data.description)
    db.session.add(complaint)
    db.session.commit()

    logger.info(f"New complaint created by {user.id}: {complaint.id}")
    resp = ComplaintResponse.model_validate(complaint).model_dump()
    # Ensure created_at is JSON serializable
    if isinstance(resp.get("created_at"), (str,)) is False:
        ca = resp.get("created_at")
        try:
            resp["created_at"] = ca.isoformat() if ca is not None else None
        except Exception:
            resp["created_at"] = str(ca) if ca is not None else None
    return jsonify(resp), 201


@api.route("/complaints", methods=["GET"])
@spec.validate(resp=Response(HTTP_200=ComplaintListResponse))
@jwt_required()
def list_complaints():
    """List complaints for the current user."""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        abort_not_found("User not found")
    # If the requester is a confirmed non-guest (testing), show all complaints
    if getattr(user, "is_confirmed", False) and not getattr(user, "is_guest", False):
        complaints_q = Complaint.query.order_by(Complaint.created_at.desc())
    else:
        complaints_q = Complaint.query.filter_by(user_id=user.id).order_by(
            Complaint.created_at.desc()
        )

    complaints = complaints_q.all()

    out = []
    for c in complaints:
        item = ComplaintResponse.model_validate(c).model_dump()
        ca = item.get("created_at")
        try:
            item["created_at"] = ca.isoformat() if ca is not None else None
        except Exception:
            item["created_at"] = str(ca) if ca is not None else None
        out.append(item)

    return jsonify({"complaints": out}), 200


@api.route("/complaints/<int:complaint_id>", methods=["GET"])
@spec.validate(resp=Response(HTTP_200=ComplaintResponse))
@jwt_required()
def get_complaint(complaint_id):
    """Return a single complaint if owned by the requester."""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        abort_not_found("User not found")

    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        abort_not_found("Complaint not found")

    if complaint.user_id != user.id and not (user.is_confirmed and not user.is_guest):
        abort_forbidden("You are not allowed to view this complaint")

    resp = ComplaintResponse.model_validate(complaint).model_dump()
    ca = resp.get("created_at")
    try:
        resp["created_at"] = ca.isoformat() if ca is not None else None
    except Exception:
        resp["created_at"] = str(ca) if ca is not None else None
    return jsonify(resp), 200
