"""
TripPilot AI — Flask Application Entry Point
Production-ready backend for Render deployment.
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from backend.config import Config
from backend.models.db import init_db
from backend.routes.health import health_bp
from backend.routes.auth import auth_bp
from backend.routes.trips import trips_bp
from backend.routes.bookings import bookings_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS configuration
    frontend_url = os.getenv("FRONTEND_URL", "*")
    if frontend_url == "*" or not frontend_url:
        CORS(app, resources={r"/api/*": {"origins": "*"}})
    else:
        CORS(app, resources={r"/api/*": {"origins": [frontend_url, "http://localhost:5173", "http://localhost:3000"]}})

    # Connect to MongoDB Atlas (safe fallback if unset)
    init_db()

    # Register Blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(trips_bp)
    app.register_blueprint(bookings_bp)

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "An unexpected server error occurred. Please try again."}), 500

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
