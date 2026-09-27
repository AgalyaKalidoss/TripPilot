"""
TripPilot AI — Transportation Data Provider Abstraction
Clearly separated transportation provider service.
Labeled: "Demo transportation data"
"""

CITY_COORDINATES = {
    "chennai": {"lat": 13.0827, "lng": 80.2707},
    "coimbatore": {"lat": 11.0168, "lng": 76.9558},
    "bangalore": {"lat": 12.9716, "lng": 77.5946},
    "hyderabad": {"lat": 17.3850, "lng": 78.4867},
    "mumbai": {"lat": 19.0760, "lng": 72.8777},
    "delhi": {"lat": 28.6139, "lng": 77.2090},
    "pune": {"lat": 18.5204, "lng": 73.8567},
    "goa": {"lat": 15.2993, "lng": 74.1240},
    "kochi": {"lat": 9.9312, "lng": 76.2673},
    "madurai": {"lat": 9.9252, "lng": 78.1198},
    "jaipur": {"lat": 26.9124, "lng": 75.7873},
}

DATA_DISCLAIMER = "Demo transportation data — Synthetic schedule and pricing for planning and comparison."

def get_demo_transit_inventory():
    return {
        "provider": "TripPilot Demo Transit Hub",
        "notice": DATA_DISCLAIMER,
        "supported_modes": ["bus", "train", "cab", "multimodal"],
    }
