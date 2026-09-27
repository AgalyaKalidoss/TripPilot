from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os
import datetime
from bson import ObjectId
from backend.models.db import get_db, mem_users

auth_bp = Blueprint("auth", __name__)
JWT_SECRET = os.getenv("JWT_SECRET", "trippilot_super_secret_jwt_2026")

def token_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Authentication token is missing"}), 401

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.current_user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated

@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    db = get_db()
    hashed = generate_password_hash(password)
    created_at = datetime.datetime.utcnow().isoformat()

    if db is not None:
        if db.users.find_one({"email": email}):
            return jsonify({"error": "An account with this email already exists"}), 409

        result = db.users.insert_one({
            "name": name,
            "email": email,
            "passwordHash": hashed,
            "createdAt": created_at
        })
        user_id = str(result.inserted_id)
    else:
        if email in mem_users:
            return jsonify({"error": "An account with this email already exists"}), 409
        user_id = f"usr_{os.urandom(4).hex()}"
        mem_users[email] = {
            "id": user_id,
            "name": name,
            "email": email,
            "passwordHash": hashed,
            "createdAt": created_at
        }

    token = jwt.encode({
        "userId": user_id,
        "email": email,
        "name": name,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, JWT_SECRET, algorithm="HS256")

    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": {"id": user_id, "name": name, "email": email}
    }), 201

@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = get_db()
    user = None
    if db is not None:
        user_doc = db.users.find_one({"email": email})
        if user_doc:
            user = {
                "id": str(user_doc["_id"]),
                "name": user_doc["name"],
                "email": user_doc["email"],
                "passwordHash": user_doc["passwordHash"]
            }
    else:
        user = mem_users.get(email)

    if not user or not check_password_hash(user["passwordHash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = jwt.encode({
        "userId": user["id"],
        "email": user["email"],
        "name": user["name"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, JWT_SECRET, algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"]}
    }), 200

@auth_bp.route("/api/auth/me", methods=["GET"])
@token_required
def get_current_user():
    user_payload = getattr(request, "current_user", {})
    return jsonify({
        "id": user_payload.get("userId"),
        "name": user_payload.get("name"),
        "email": user_payload.get("email")
    }), 200
