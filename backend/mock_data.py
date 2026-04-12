"""
Mock travel data - hotels, weather, destinations
Replace with real API calls when you get API keys
"""
import random
from datetime import datetime


HOTEL_DATABASE = {
    "manali": [
        {"name": "The Himalayan", "type": "Luxury", "price": 8500, "rating": 4.8, "amenities": ["WiFi", "Spa", "Restaurant", "Mountain View"], "booking_url": "https://booking.com"},
        {"name": "Snow Valley Resorts", "type": "Mid-Range", "price": 3200, "rating": 4.3, "amenities": ["WiFi", "Restaurant", "Parking"], "booking_url": "https://makemytrip.com"},
        {"name": "Zostel Manali", "type": "Budget", "price": 600, "rating": 4.1, "amenities": ["WiFi", "Common Room", "Kitchen"], "booking_url": "https://zostel.com"},
    ],
    "darjeeling": [
        {"name": "Windamere Hotel", "type": "Luxury", "price": 9000, "rating": 4.7, "amenities": ["WiFi", "Restaurant", "Garden", "Heritage"], "booking_url": "https://booking.com"},
        {"name": "Mayfair Darjeeling", "type": "Mid-Range", "price": 4500, "rating": 4.4, "amenities": ["WiFi", "Restaurant", "Valley View"], "booking_url": "https://makemytrip.com"},
        {"name": "Zostel Darjeeling", "type": "Budget", "price": 700, "rating": 4.0, "amenities": ["WiFi", "Common Room"], "booking_url": "https://zostel.com"},
    ],
    "goa": [
        {"name": "W Goa", "type": "Luxury", "price": 15000, "rating": 4.9, "amenities": ["Pool", "Beach", "Spa", "WiFi"], "booking_url": "https://booking.com"},
        {"name": "Lemon Tree Candolim", "type": "Mid-Range", "price": 5000, "rating": 4.3, "amenities": ["Pool", "WiFi", "Restaurant"], "booking_url": "https://makemytrip.com"},
        {"name": "Zostel Goa", "type": "Budget", "price": 800, "rating": 4.2, "amenities": ["WiFi", "Common Room", "Beach Access"], "booking_url": "https://zostel.com"},
    ],
    "default": [
        {"name": "Luxury Heritage Hotel", "type": "Luxury", "price": 8000, "rating": 4.6, "amenities": ["WiFi", "Pool", "Restaurant", "Spa"], "booking_url": "https://booking.com"},
        {"name": "Comfort Inn", "type": "Mid-Range", "price": 2800, "rating": 4.2, "amenities": ["WiFi", "Restaurant", "Parking"], "booking_url": "https://makemytrip.com"},
        {"name": "Zostel", "type": "Budget", "price": 650, "rating": 4.0, "amenities": ["WiFi", "Common Room"], "booking_url": "https://zostel.com"},
    ]
}


DESTINATION_DATABASE = [
    {
        "name": "Dooars, West Bengal",
        "type": ["nature", "wildlife", "photography"],
        "best_months": "Oct-Mar",
        "budget_3days": 8000,
        "distance_from_kolkata_km": 600,
        "highlight": "Tea gardens, Jaldapara wildlife, Gorumara forest",
        "image_emoji": "🌿"
    },
    {
        "name": "Purulia, West Bengal",
        "type": ["nature", "offbeat", "photography"],
        "best_months": "Oct-Feb",
        "budget_3days": 5000,
        "distance_from_kolkata_km": 300,
        "highlight": "Ajodhya Hills, Pakhi Pahar, tribal culture",
        "image_emoji": "⛰️"
    },
    {
        "name": "Darjeeling, West Bengal",
        "type": ["hills", "tea", "photography"],
        "best_months": "Apr-Jun, Sep-Nov",
        "budget_3days": 9000,
        "distance_from_kolkata_km": 650,
        "highlight": "Tiger Hill sunrise, tea gardens, toy train",
        "image_emoji": "🍵"
    },
    {
        "name": "Mandarmani, West Bengal",
        "type": ["beach", "photography", "weekend"],
        "best_months": "Oct-Feb",
        "budget_3days": 7000,
        "distance_from_kolkata_km": 180,
        "highlight": "Longest driveable beach in India",
        "image_emoji": "🏖️"
    },
    {
        "name": "Sikkim",
        "type": ["hills", "nature", "photography"],
        "best_months": "Apr-Jun, Oct-Nov",
        "budget_3days": 15000,
        "distance_from_kolkata_km": 700,
        "highlight": "Nathula Pass, Gurudongmar Lake, monasteries",
        "image_emoji": "🏔️"
    },
    {
        "name": "Bishnupur, West Bengal",
        "type": ["history", "photography", "offbeat"],
        "best_months": "Oct-Mar",
        "budget_3days": 4000,
        "distance_from_kolkata_km": 130,
        "highlight": "Terracotta temples, Baluchari sarees",
        "image_emoji": "🛕"
    },
]


WEATHER_DATA = {
    "Jan": {"temp": "10-22°C", "condition": "Cold & Clear", "travel": "Excellent"},
    "Feb": {"temp": "12-25°C", "condition": "Pleasant", "travel": "Excellent"},
    "Mar": {"temp": "18-32°C", "condition": "Warm", "travel": "Good"},
    "Apr": {"temp": "22-38°C", "condition": "Hot", "travel": "Average"},
    "May": {"temp": "25-40°C", "condition": "Very Hot", "travel": "Poor"},
    "Jun": {"temp": "26-35°C", "condition": "Monsoon Starting", "travel": "Poor"},
    "Jul": {"temp": "24-32°C", "condition": "Heavy Rain", "travel": "Poor"},
    "Aug": {"temp": "24-32°C", "condition": "Heavy Rain", "travel": "Poor"},
    "Sep": {"temp": "24-33°C", "condition": "Monsoon Ending", "travel": "Average"},
    "Oct": {"temp": "18-28°C", "condition": "Pleasant", "travel": "Excellent"},
    "Nov": {"temp": "12-24°C", "condition": "Cool & Clear", "travel": "Excellent"},
    "Dec": {"temp": "8-20°C", "condition": "Cold & Crisp", "travel": "Excellent"},
}


def get_hotels(destination: str, budget_type: str = "all") -> list:
    """Get hotel options for a destination"""
    dest_key = destination.lower().split(",")[0].strip()
    hotels = HOTEL_DATABASE.get(dest_key, HOTEL_DATABASE["default"])

    if budget_type == "budget":
        return [h for h in hotels if h["type"] == "Budget"]
    elif budget_type == "luxury":
        return [h for h in hotels if h["type"] == "Luxury"]
    elif budget_type == "mid":
        return [h for h in hotels if h["type"] == "Mid-Range"]
    return hotels


def get_weather(month: str = None) -> dict:
    """Get weather info"""
    if not month:
        month = datetime.now().strftime("%b")
    return WEATHER_DATA.get(month, WEATHER_DATA["Oct"])


def get_suggested_destinations(interest: str = "") -> list:
    """Get destination suggestions based on interest"""
    interest = interest.lower()
    if not interest:
        return DESTINATION_DATABASE[:4]

    filtered = [d for d in DESTINATION_DATABASE if any(i in interest for i in d["type"])]
    return filtered if filtered else DESTINATION_DATABASE[:4]


def get_cost_estimate(days: int, budget_style: str = "mid") -> dict:
    """Get rough cost estimate"""
    rates = {
        "budget": {"stay": 700, "food": 400, "activities": 200, "misc": 100},
        "mid": {"stay": 2500, "food": 800, "activities": 500, "misc": 300},
        "luxury": {"stay": 8000, "food": 2000, "activities": 1500, "misc": 800}
    }
    rate = rates.get(budget_style, rates["mid"])
    return {
        "stay": rate["stay"] * days,
        "food": rate["food"] * days,
        "activities": rate["activities"] * days,
        "misc": rate["misc"] * days,
        "total_per_day": sum(rate.values()),
        "total": sum(rate.values()) * days
    }
