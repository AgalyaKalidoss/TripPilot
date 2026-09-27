from flask import Blueprint, request, jsonify
import datetime
from bson import ObjectId
from backend.models.db import get_db, mem_trips
from backend.services.travel_planner import generate_plans
from backend.services.ai_service import refine_plan_ai

trips_bp = Blueprint("trips", __name__)

def get_optional_user():
    import jwt, os
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            return jwt.decode(token, os.getenv("JWT_SECRET", "trippilot_super_secret_jwt_2026"), algorithms=["HS256"])
        except:
            return None
    return None

@trips_bp.route("/api/trips", methods=["POST"])
def create_trip():
    data = request.get_json() or {}
    from_city = data.get("from", "").strip()
    to_city = data.get("to", "").strip()
    date = data.get("date", "").strip()

    if not from_city or not to_city or not date:
        return jsonify({"error": "Starting location, destination, and travel date are required"}), 400

    passengers = max(1, int(data.get("passengers", 1)))
    budget = int(data.get("budget", 0)) if data.get("budget") else 0
    preference = data.get("preference", "balanced")
    transport = data.get("transport", "any")
    comfort = data.get("comfort", "medium")
    special_requirements = data.get("specialRequirements", "")

    constraints = {
        "from": from_city,
        "to": to_city,
        "date": date,
        "passengers": passengers,
        "budget": budget,
        "preference": preference,
        "transport": transport,
        "comfort": comfort,
        "specialRequirements": special_requirements
    }

    options = generate_plans(constraints)
    user_info = get_optional_user()
    user_id = user_info.get("userId") if user_info else f"guest_{datetime.datetime.utcnow().timestamp()}"

    trip_data = {
        "userId": user_id,
        "from": from_city,
        "to": to_city,
        "date": date,
        "passengers": passengers,
        "budget": budget,
        "preference": preference,
        "transport": transport,
        "comfort": comfort,
        "specialRequirements": special_requirements,
        "options": options,
        "selectedOptionIndex": 0,
        "feedbackHistory": [],
        "status": "active",
        "createdAt": datetime.datetime.utcnow().isoformat(),
        "updatedAt": datetime.datetime.utcnow().isoformat()
    }

    db = get_db()
    if db is not None:
        result = db.trips.insert_one(trip_data)
        trip_data["_id"] = str(result.inserted_id)
    else:
        trip_id = f"trp_{datetime.datetime.utcnow().timestamp()}"
        trip_data["_id"] = trip_id
        mem_trips[trip_id] = trip_data

    return jsonify(trip_data), 201

@trips_bp.route("/api/trips", methods=["GET"])
def get_user_trips():
    user_info = get_optional_user()
    if not user_info:
        return jsonify({"error": "Authentication required to view trips"}), 401

    user_id = user_info.get("userId")
    db = get_db()
    trips = []

    if db is not None:
        cursor = db.trips.find({"userId": user_id}).sort("createdAt", -1)
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            trips.append(doc)
    else:
        for t in mem_trips.values():
            if t.get("userId") == user_id:
                trips.append(t)
        trips.sort(key=lambda x: x.get("createdAt", ""), reverse=True)

    return jsonify(trips), 200

@trips_bp.route("/api/trips/<trip_id>", methods=["GET"])
def get_trip(trip_id):
    db = get_db()
    trip = None
    if db is not None:
        try:
            doc = db.trips.find_one({"_id": ObjectId(trip_id)})
            if doc:
                doc["_id"] = str(doc["_id"])
                trip = doc
        except:
            pass
    else:
        trip = mem_trips.get(trip_id)

    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    return jsonify(trip), 200

@trips_bp.route("/api/trips/<trip_id>", methods=["DELETE"])
def delete_trip(trip_id):
    user_info = get_optional_user()
    if not user_info:
        return jsonify({"error": "Authentication required to delete trip"}), 401

    user_id = user_info.get("userId")
    db = get_db()

    if db is not None:
        try:
            res = db.trips.delete_one({"_id": ObjectId(trip_id), "userId": user_id})
            if res.deleted_count > 0:
                return jsonify({"message": "Trip deleted successfully"}), 200
        except:
            pass
    else:
        if trip_id in mem_trips and mem_trips[trip_id].get("userId") == user_id:
            del mem_trips[trip_id]
            return jsonify({"message": "Trip deleted successfully"}), 200

    return jsonify({"error": "Trip not found or unauthorized"}), 404

@trips_bp.route("/api/ai/refine", methods=["POST"])
def refine_trip():
    data = request.get_json() or {}
    trip_id = data.get("tripId")
    feedback = data.get("feedback", "").strip()

    if not trip_id or not feedback:
        return jsonify({"error": "Trip ID and feedback message are required"}), 400

    db = get_db()
    trip = None
    if db is not None:
        try:
            trip = db.trips.find_one({"_id": ObjectId(trip_id)})
        except:
            pass
    else:
        trip = mem_trips.get(trip_id)

    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    current_constraints = {
        "from": trip["from"],
        "to": trip["to"],
        "date": trip["date"],
        "passengers": trip.get("passengers", 1),
        "budget": trip.get("budget", 0),
        "preference": trip.get("preference", "balanced"),
        "transport": trip.get("transport", "any"),
        "comfort": trip.get("comfort", "medium"),
    }

    ai_result = refine_plan_ai(feedback, current_constraints)
    merged = {**current_constraints, **ai_result["updatedConstraints"]}

    revised_options = generate_plans(merged)

    history_entry = {
        "message": feedback,
        "aiExplanation": ai_result["explanation"],
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    history = list(trip.get("feedbackHistory", []))
    history.append(history_entry)

    updated_fields = {
        "preference": merged.get("preference", trip.get("preference")),
        "transport": merged.get("transport", trip.get("transport")),
        "budget": merged.get("budget", trip.get("budget")),
        "options": revised_options,
        "selectedOptionIndex": 0,
        "feedbackHistory": history,
        "updatedAt": datetime.datetime.utcnow().isoformat()
    }

    if db is not None:
        db.trips.update_one({"_id": ObjectId(trip_id)}, {"$set": updated_fields})
        updated_trip = db.trips.find_one({"_id": ObjectId(trip_id)})
        updated_trip["_id"] = str(updated_trip["_id"])
    else:
        mem_trips[trip_id].update(updated_fields)
        updated_trip = mem_trips[trip_id]

    return jsonify({
        "message": "Plan revised successfully",
        "explanation": ai_result["explanation"],
        "source": ai_result["source"],
        "trip": updated_trip
    }), 200
