from flask import Blueprint, jsonify
from backend.models.db import get_connection_status

health_bp = Blueprint("health", __name__)

@health_bp.route("/api/health", methods=["GET"])
def health_check():
    status = get_connection_status()
    return jsonify(status), 200
