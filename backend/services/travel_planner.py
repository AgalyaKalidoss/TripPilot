"""
TripPilot AI — Travel Planner Engine (Python)
Generates multimodal and single-mode options with duration, cost, comfort, and transfers.
"""

import math

def estimate_distance_km(from_city: str, to_city: str) -> int:
    norm_from = from_city.strip().lower()
    norm_to = to_city.strip().lower()

    city_matrix = {
        "chennai": {"coimbatore": 505, "bangalore": 345, "hyderabad": 630, "madurai": 460, "kochi": 690, "mumbai": 1330, "delhi": 2180},
        "coimbatore": {"chennai": 505, "bangalore": 365, "kochi": 190, "madurai": 210, "hyderabad": 880},
        "bangalore": {"chennai": 345, "coimbatore": 365, "hyderabad": 570, "goa": 560, "mumbai": 980, "mysore": 145, "pune": 840},
        "mumbai": {"pune": 150, "goa": 580, "ahmedabad": 525, "delhi": 1420, "bangalore": 980, "chennai": 1330},
        "delhi": {"jaipur": 280, "agra": 230, "chandigarh": 250, "lucknow": 550, "mumbai": 1420, "chennai": 2180},
        "hyderabad": {"bangalore": 570, "chennai": 630, "vijayawada": 275, "mumbai": 710, "pune": 560},
    }

    if norm_from in city_matrix and norm_to in city_matrix[norm_from]:
        return city_matrix[norm_from][norm_to]
    if norm_to in city_matrix and norm_from in city_matrix[norm_to]:
        return city_matrix[norm_to][norm_from]

    # Deterministic fallback distance between 200 and 800km
    h = 0
    for char in (norm_from + norm_to):
        h = (h * 31 + ord(char)) & 0xFFFFFFFF
    return 240 + (h % 560)

def format_duration(minutes: int) -> str:
    h = minutes // 60
    m = minutes % 60
    if h == 0:
        return f"{m}m"
    return f"{h}h {m:02d}m"

def add_minutes(time_str: str, mins: int) -> str:
    parts = time_str.split(":")
    h = int(parts[0])
    m = int(parts[1])
    total = h * 60 + m + mins
    new_h = (total // 60) % 24
    new_m = total % 60
    return f"{new_h:02d}:{new_m:02d}"

def generate_plans(constraints: dict) -> list:
    from_city = constraints.get("from", "Origin")
    to_city = constraints.get("to", "Destination")
    passengers = max(1, int(constraints.get("passengers", 1)))
    preference = constraints.get("preference", "balanced")
    transport_pref = constraints.get("transport", "any").lower()
    disallowed = [t.lower() for t in constraints.get("disallowedTransports", [])]

    dist = estimate_distance_km(from_city, to_city)
    options = []

    # 1. Multimodal: Train + Cab
    if "train" not in disallowed and "cab" not in disallowed and transport_pref in ["any", "multimodal", "train"]:
        train_dist = round(dist * 0.88)
        cab_dist = round(dist * 0.12)
        train_mins = round((train_dist / 80) * 60)
        cab_mins = round((cab_dist / 40) * 60) + 15
        transfer_wait = 25
        total_mins = train_mins + cab_mins + transfer_wait

        train_fare = round(350 + train_dist * 1.35)
        cab_fare = round(300 + cab_dist * 16)
        total_cost = (train_fare * passengers) + cab_fare

        leg1_arr = add_minutes("06:10", train_mins)
        leg2_dep = add_minutes(leg1_arr, transfer_wait)
        leg2_arr = add_minutes(leg2_dep, cab_mins)

        options.append({
            "id": "opt_multimodal_1",
            "title": "Smart Multimodal: Express Train + Direct Cab",
            "type": "multimodal",
            "totalCost": total_cost,
            "costPerPassenger": round(total_cost / passengers),
            "totalDurationMinutes": total_mins,
            "formattedDuration": format_duration(total_mins),
            "departureTime": "06:10",
            "arrivalTime": leg2_arr,
            "transfers": 1,
            "comfort": "High",
            "carbonKg": round(dist * 0.045 * passengers),
            "highlights": [
                "Vande Bharat speed tier",
                "Pre-assigned reserved cab at junction",
                "Low carbon footprint",
                "Includes 25m stress-free transfer buffer",
            ],
            "legs": [
                {
                    "mode": "train",
                    "operator": "Southern Intercity Express",
                    "vehicleName": "Vande Bharat / Express Spl (CC)",
                    "fromStation": f"{from_city} Central Station",
                    "toStation": f"{to_city} Junction",
                    "departureTime": "06:10",
                    "arrivalTime": leg1_arr,
                    "durationMinutes": train_mins,
                    "cost": train_fare * passengers,
                    "comfort": "High",
                },
                {
                    "mode": "cab",
                    "operator": "TripPilot Verified City Fleet",
                    "vehicleName": "AC Prime Sedan",
                    "fromStation": f"{to_city} Junction (Gate 2 Cab Hub)",
                    "toStation": f"{to_city} City Center / Destination",
                    "departureTime": leg2_dep,
                    "arrivalTime": leg2_arr,
                    "durationMinutes": cab_mins,
                    "cost": cab_fare,
                    "comfort": "High",
                },
            ],
        })

    # 2. Direct Train
    if "train" not in disallowed and transport_pref in ["any", "train"]:
        train_mins = round((dist / 72) * 60) + 20
        cost_per_head = round(280 + dist * 1.15)
        total_cost = cost_per_head * passengers
        arr = add_minutes("08:20", train_mins)

        options.append({
            "id": "opt_train_direct",
            "title": "Direct Superfast Train (AC Sleeper / 3A)",
            "type": "train",
            "totalCost": total_cost,
            "costPerPassenger": cost_per_head,
            "totalDurationMinutes": train_mins,
            "formattedDuration": format_duration(train_mins),
            "departureTime": "08:20",
            "arrivalTime": arr,
            "transfers": 0,
            "comfort": "Medium",
            "carbonKg": round(dist * 0.038 * passengers),
            "highlights": [
                "Zero transfers & comfortable seating",
                "Affordable AC travel with onboard pantry",
                "Reliable schedule",
            ],
            "legs": [
                {
                    "mode": "train",
                    "operator": "National Railway System",
                    "vehicleName": "Superfast Express (3A AC Sleeper)",
                    "fromStation": f"{from_city} Terminus",
                    "toStation": f"{to_city} Main Station",
                    "departureTime": "08:20",
                    "arrivalTime": arr,
                    "durationMinutes": train_mins,
                    "cost": total_cost,
                    "comfort": "Medium",
                }
            ],
        })

    # 3. Direct Bus
    if "bus" not in disallowed and transport_pref in ["any", "bus"]:
        bus_mins = round((dist / 58) * 60) + 40
        cost_per_head = round(220 + dist * 0.95)
        total_cost = cost_per_head * passengers
        arr = add_minutes("07:30", bus_mins)

        options.append({
            "id": "opt_bus_direct",
            "title": "Direct Highway AC Bus (Volvo Sleeper)",
            "type": "bus",
            "totalCost": total_cost,
            "costPerPassenger": cost_per_head,
            "totalDurationMinutes": bus_mins,
            "formattedDuration": format_duration(bus_mins),
            "departureTime": "07:30",
            "arrivalTime": arr,
            "transfers": 0,
            "comfort": "Economy",
            "carbonKg": round(dist * 0.065 * passengers),
            "highlights": [
                "Lowest ticket fare",
                "Frequent boarding points",
                "Overnight / daytime reclining sleeper",
            ],
            "legs": [
                {
                    "mode": "bus",
                    "operator": "Interstate Highway Liner",
                    "vehicleName": "Multi-Axle Volvo AC Sleeper",
                    "fromStation": f"{from_city} Central Bus Port",
                    "toStation": f"{to_city} Omni Bus Terminal",
                    "departureTime": "07:30",
                    "arrivalTime": arr,
                    "durationMinutes": bus_mins,
                    "cost": total_cost,
                    "comfort": "Economy",
                }
            ],
        })

    # 4. Direct Cab
    if "cab" not in disallowed and transport_pref in ["any", "cab"]:
        cab_mins = round((dist / 70) * 60) + 25
        rate = 18.5 if passengers > 3 else 14.5
        total_cost = round(dist * rate + 500)
        arr = add_minutes("07:00", cab_mins)

        options.append({
            "id": "opt_cab_direct",
            "title": "Direct Private Outstation Cab (Door-to-Door)",
            "type": "cab",
            "totalCost": total_cost,
            "costPerPassenger": round(total_cost / passengers),
            "totalDurationMinutes": cab_mins,
            "formattedDuration": format_duration(cab_mins),
            "departureTime": "07:00",
            "arrivalTime": arr,
            "transfers": 0,
            "comfort": "Luxury",
            "carbonKg": round(dist * 0.14),
            "highlights": [
                "Complete door-to-door convenience",
                "Custom departure schedule & roadside stops on demand",
                "Private sanitized cabin with AC",
            ],
            "legs": [
                {
                    "mode": "cab",
                    "operator": "TripPilot Private Outstation Network",
                    "vehicleName": "Sedan AC Outstation",
                    "fromStation": f"Doorstep in {from_city}",
                    "toStation": f"Doorstep in {to_city}",
                    "departureTime": "07:00",
                    "arrivalTime": arr,
                    "durationMinutes": cab_mins,
                    "cost": total_cost,
                    "comfort": "Luxury",
                }
            ],
        })

    if not options:
        # Fallback
        mins = round((dist / 65) * 60)
        cost = round(dist * 1.5 * passengers)
        arr = add_minutes("09:00", mins)
        options.append({
            "id": "opt_custom_fallback",
            "title": "Direct Express Transit",
            "type": "train",
            "totalCost": cost,
            "costPerPassenger": round(cost / passengers),
            "totalDurationMinutes": mins,
            "formattedDuration": format_duration(mins),
            "departureTime": "09:00",
            "arrivalTime": arr,
            "transfers": 0,
            "comfort": "Medium",
            "carbonKg": round(dist * 0.05 * passengers),
            "highlights": ["Direct connection matching filtered transport"],
            "legs": [],
        })

    # Recommendation determination
    best_idx = 0
    if preference == "budget":
        best_idx = min(range(len(options)), key=lambda i: options[i]["totalCost"])
    elif preference == "fastest":
        best_idx = min(range(len(options)), key=lambda i: options[i]["totalDurationMinutes"])
    elif preference == "comfort":
        comfort_scores = {"Economy": 1, "Medium": 2, "High": 3, "Luxury": 4}
        best_idx = max(range(len(options)), key=lambda i: comfort_scores.get(options[i]["comfort"], 1))
    else:
        # Balanced
        min_c = min(o["totalCost"] for o in options) or 1
        min_d = min(o["totalDurationMinutes"] for o in options) or 1
        best_idx = min(
            range(len(options)),
            key=lambda i: (options[i]["totalCost"] / min_c) * 0.5 + (options[i]["totalDurationMinutes"] / min_d) * 0.5 + options[i]["transfers"] * 0.2
        )

    for i, opt in enumerate(options):
        opt["isRecommended"] = (i == best_idx)

    return options
