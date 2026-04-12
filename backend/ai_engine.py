"""
AI Engine - Supports both Gemini and Anthropic (Claude)
Set GEMINI_API_KEY in config.env to use Gemini (free)
Set ANTHROPIC_API_KEY in config.env to use Claude
"""
import os
import json

# ── Detect which AI to use ────────────────────────────────────────────────────
GEMINI_API_KEY    = os.getenv("GEMINI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

USE_GEMINI = bool(GEMINI_API_KEY)

if USE_GEMINI:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-1.5-flash")
else:
    import anthropic
    claude_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)


# ── Prompts ───────────────────────────────────────────────────────────────────

TRAVEL_SYSTEM_PROMPT = """You are an expert AI Travel Assistant for a travel blogger in India.

Always respond in this exact JSON format (no extra text, just JSON):
{
  "destination": "Primary destination name",
  "summary": "2-3 line trip summary",
  "best_time": "Best months to visit",
  "travel_mode": "Recommended transport",
  "itinerary": [
    {"day": 1, "title": "Day title", "activities": ["activity1", "activity2", "activity3"], "stay": "Hotel/homestay type", "food": "Must-try local food"}
  ],
  "cost_breakdown": {
    "travel": 0,
    "stay": 0,
    "food": 0,
    "activities": 0,
    "total": 0,
    "currency": "INR"
  },
  "photography_spots": ["spot1", "spot2", "spot3"],
  "hidden_gems": ["gem1", "gem2"],
  "packing_list": ["item1", "item2", "item3", "item4", "item5"],
  "pro_tips": ["tip1", "tip2", "tip3"]
}

Keep costs realistic for India. Focus on practical, actionable information for a travel blogger."""


BLOG_SYSTEM_PROMPT = """You are an expert travel blog writer for Indian travel destinations.

Write SEO-optimized travel blog posts. Return ONLY this JSON format (no extra text):
{
  "title": "Catchy SEO title",
  "meta_description": "150 char SEO description",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "content": "Full blog post in markdown format (800-1200 words)",
  "instagram_caption": "Engaging IG caption with emojis",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8", "#tag9", "#tag10"],
  "youtube_title": "YouTube video title",
  "youtube_description": "YouTube video description (200 words)",
  "reel_ideas": ["idea1", "idea2", "idea3"]
}"""


ROUTE_SYSTEM_PROMPT = """You are a road trip expert for India. Return ONLY this JSON format (no extra text):
{
  "route_name": "Route name",
  "total_distance_km": 0,
  "estimated_time_hours": 0,
  "route_highlights": ["point1", "point2", "point3"],
  "segments": [
    {"from": "city1", "to": "city2", "distance_km": 0, "time_hours": 0, "road_type": "NH/SH/City", "condition": "Good/Average/Poor"}
  ],
  "fuel_cost_inr": 0,
  "toll_cost_inr": 0,
  "total_road_cost_inr": 0,
  "stopovers": [
    {"location": "name", "km_mark": 0, "what_to_do": "description", "food": "local food option"}
  ],
  "scenic_highlights": ["highlight1", "highlight2"],
  "driving_tips": ["tip1", "tip2", "tip3"],
  "fuel_stations": ["notable fuel station info"]
}"""


# ── Helper ────────────────────────────────────────────────────────────────────

def _extract_json(text: str) -> dict:
    text = text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    return json.loads(text)


def _call_ai(system: str, user_prompt: str, max_tokens: int = 4096) -> str:
    """Call whichever AI is configured — Gemini or Claude"""
    if USE_GEMINI:
        full_prompt = f"{system}\n\n{user_prompt}"
        response = gemini_model.generate_content(full_prompt)
        return response.text
    else:
        response = claude_client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": user_prompt}],
            system=system
        )
        return response.content[0].text


# ── Public functions ──────────────────────────────────────────────────────────

def generate_trip_plan(query: str) -> dict:
    try:
        text = _call_ai(TRAVEL_SYSTEM_PROMPT, f"Plan this trip: {query}")
        return _extract_json(text)
    except Exception as e:
        return {"error": str(e)}


def generate_blog(destination: str, trip_details: str = "") -> dict:
    try:
        prompt = f"Write a travel blog for: {destination}"
        if trip_details:
            prompt += f"\nTrip details: {trip_details}"
        text = _call_ai(BLOG_SYSTEM_PROMPT, prompt)
        return _extract_json(text)
    except Exception as e:
        return {"error": str(e)}


def generate_route_plan(origin: str, destination: str, vehicle: str = "car") -> dict:
    try:
        prompt = f"Plan a road trip route from {origin} to {destination} by {vehicle}. Fuel price: ₹100/liter, mileage: 15 km/liter."
        text = _call_ai(ROUTE_SYSTEM_PROMPT, prompt, max_tokens=2048)
        return _extract_json(text)
    except Exception as e:
        return {"error": str(e)}


def generate_quick_chat(message: str, context: str = "") -> str:
    try:
        system = "You are a helpful Indian travel expert. Give concise, practical answers. Focus on India travel context."
        if context:
            system += f"\nContext: {context}"
        return _call_ai(system, message, max_tokens=1024)
    except Exception as e:
        return f"Error: {str(e)}"
