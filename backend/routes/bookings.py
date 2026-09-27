from flask import Blueprint, request, jsonify
import datetime
import random
from bson import ObjectId
from backend.models.db import get_db, mem_bookings, mem_trips

bookings_bp = Blueprint("bookings", __name__)

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

@bookings_bp.route("/api/bookings", methods=["POST"])
def create_booking():
    data = request.get_json() or {}
    trip_id = data.get("tripId")
    selected_option_index = int(data.get("selectedOptionIndex", 0))

    if not trip_id:
        return jsonify({"error": "Trip ID is required"}), 400

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

    options = trip.get("options", [])
    option = options[selected_option_index] if selected_option_index < len(options) else (options[0] if options else {})

    user_info = get_optional_user()
    user_id = user_info.get("userId") if user_info else trip.get("userId", "guest")

    booking_code = f"TP-{random.randint(100000, 999999)}"
    booking_data = {
        "bookingCode": booking_code,
        "tripId": str(trip.get("_id", trip_id)),
        "userId": user_id,
        "from": trip.get("from"),
        "to": trip.get("to"),
        "date": trip.get("date"),
        "passengers": trip.get("passengers", 1),
        "selectedOption": option,
        "totalCost": option.get("totalCost", 0),
        "status": "confirmed",
        "passengerName": data.get("passengerName") or (user_info.get("name") if user_info else "Traveler"),
        "passengerEmail": data.get("passengerEmail") or (user_info.get("email") if user_info else "traveler@example.com"),
        "passengerPhone": data.get("passengerPhone", ""),
        "demoNotice": "Demo booking — no real ticket has been purchased. This is a simulated confirmation.",
        "createdAt": datetime.datetime.utcnow().isoformat()
    }

    if db is not None:
        res = db.bookings.insert_one(booking_data)
        booking_data["_id"] = str(res.inserted_id)
        # Update trip status
        db.trips.update_one({"_id": ObjectId(trip_id)}, {"$set": {"status": "booked", "selectedOptionIndex": selected_option_index}})
    else:
        bk_id = f"bk_{datetime.datetime.utcnow().timestamp()}"
        booking_data["_id"] = bk_id
        mem_bookings[bk_id] = booking_data
        if trip_id in mem_trips:
            mem_trips[trip_id]["status"] = "booked"
            mem_trips[trip_id]["selectedOptionIndex"] = selected_option_index

    return jsonify(booking_data), 201

@bookings_bp.route("/api/bookings", methods=["GET"])
def get_user_bookings():
    user_info = get_optional_user()
    if not user_info:
        return jsonify({"error": "Authentication required to view bookings"}), 401

    user_id = user_info.get("userId")
    db = get_db()
    bookings = []

    if db is not None:
        cursor = db.bookings.find({"userId": user_id}).sort("createdAt", -1)
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            bookings.append(doc)
    else:
        for b in mem_bookings.values():
            if b.get("userId") == user_id:
                bookings.append(b)
        bookings.sort(key=lambda x: x.get("createdAt", ""), reverse=True)

    return jsonify(bookings), 200
