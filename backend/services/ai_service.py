"""
TripPilot AI — AI Refinement Service (Python)
Uses Google Gemini API with fallback rule-based natural language intent parser.
"""

import os
import re
import json

def refine_plan_ai(feedback: str, current_constraints: dict) -> dict:
    gemini_key = os.getenv("GEMINI_API_KEY")

    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash") # or gemini-2.0-flash / fallback

            prompt = f"""You are the AI travel planner for TripPilot AI.
A user has an existing travel plan:
From: {current_constraints.get('from')}
To: {current_constraints.get('to')}
Date: {current_constraints.get('date')}
Passengers: {current_constraints.get('passengers')}
Current Preference: {current_constraints.get('preference')}
Current Transport: {current_constraints.get('transport')}
Current Budget: {current_constraints.get('budget')}

User Feedback: "{feedback}"

Extract intent and return ONLY raw JSON:
{{
  "preference": "budget" | "fastest" | "comfort" | "balanced" | null,
  "disallowedTransports": ["bus"|"train"|"cab"],
  "transport": "bus"|"train"|"cab"|"multimodal"|"any"|null,
  "budgetAdjustment": integer or null,
  "explanation": "Friendly 1-2 sentence explanation of changes made"
}}"""

            response = model.generate_content(prompt)
            clean_text = re.sub(r"```(json)?", "", response.text).strip()
            parsed = json.loads(clean_text)

            updated = {}
            if parsed.get("preference"):
                updated["preference"] = parsed["preference"]
            if parsed.get("disallowedTransports"):
                updated["disallowedTransports"] = parsed["disallowedTransports"]
            if parsed.get("transport"):
                updated["transport"] = parsed["transport"]
            if parsed.get("budgetAdjustment"):
                updated["budget"] = parsed["budgetAdjustment"]

            return {
                "updatedConstraints": updated,
                "explanation": parsed.get("explanation", "Revised plan according to your feedback."),
                "source": "gemini_ai",
            }
        except Exception as e:
            print(f"[AI Service Warning] Gemini failed: {e}. Using rule-based fallback.")

    # Rule-based fallback
    return rule_based_fallback(feedback, current_constraints)

def rule_based_fallback(feedback: str, current_constraints: dict) -> dict:
    text = feedback.lower()
    updated = {}
    explanations = []
    disallowed = list(current_constraints.get("disallowedTransports", []))

    if any(k in text for k in ["cheap", "budget", "low cost", "less money", "economic"]):
        updated["preference"] = "budget"
        explanations.append("prioritizing lower cost options")
    elif any(k in text for k in ["fast", "quick", "speed", "less time", "hurry"]):
        updated["preference"] = "fastest"
        explanations.append("prioritizing faster travel times")
    elif any(k in text for k in ["comfort", "luxury", "relax", "sleeper"]):
        updated["preference"] = "comfort"
        explanations.append("prioritizing maximum comfort")

    if any(k in text for k in ["no bus", "avoid bus", "without bus", "don't want bus"]):
        if "bus" not in disallowed:
            disallowed.append("bus")
        explanations.append("removing bus travel")

    if any(k in text for k in ["no train", "avoid train", "without train"]):
        if "train" not in disallowed:
            disallowed.append("train")
        explanations.append("removing train routes")

    if any(k in text for k in ["cab only", "only cab", "only taxi", "taxi only"]):
        updated["transport"] = "cab"
        explanations.append("filtering strictly to private cabs")

    budget_match = re.search(r"(?:budget|rs\.?|inr|₹)\s*(\d{3,6})", text) or re.search(r"(\d{3,6})\s*(?:rs|rupees)", text)
    if budget_match:
        try:
            val = int(budget_match.group(1))
            updated["budget"] = val
            explanations.append(f"adjusting budget to ₹{val}")
        except:
            pass

    updated["disallowedTransports"] = disallowed

    expl = f"Revised plan: {', '.join(explanations)}." if explanations else "Revised your plan based on your feedback."

    return {
        "updatedConstraints": updated,
        "explanation": expl,
        "source": "rule_based_fallback",
    }
