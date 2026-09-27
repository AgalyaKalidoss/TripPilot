"""
TripPilot AI — MongoDB Atlas Database Connection (Python)
Connects securely via MONGODB_URI environment variable.
Does not expose credentials. Safe fallback handling if unreachable.
"""

import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

db = None
mongo_client = None
is_connected = False
connection_error = None

# In-memory stores for testing if MongoDB is not yet set
mem_users = {}
mem_trips = {}
mem_bookings = {}

def init_db():
    global db, mongo_client, is_connected, connection_error
    uri = os.getenv("MONGODB_URI", "")
    if not uri:
        is_connected = False
        connection_error = "MONGODB_URI not configured in environment"
        print("[TripPilot DB] MONGODB_URI not configured. Operating in safe in-memory fallback mode.")
        return

    try:
        mongo_client = MongoClient(uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
        # Verify connection
        mongo_client.admin.command('ping')
        db = mongo_client["trippilot"]
        is_connected = True
        connection_error = None
        print("[TripPilot DB] Successfully connected to MongoDB Atlas database: trippilot")
    except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
        is_connected = False
        connection_error = str(e)
        print(f"[TripPilot DB] Warning: Could not connect to MongoDB Atlas ({e}). Operating in in-memory mode.")

def get_db():
    return db

def get_connection_status():
    return {
        "status": "ok",
        "service": "TripPilot AI API",
        "database": "connected" if is_connected else "disconnected",
        "mode": "mongodb_atlas" if is_connected else "in_memory_fallback"
    }
