"""
AI Travel Assistant - FastAPI Backend
Run: uvicorn main:app --reload --port 8001
"""

import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "config.env"))

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import sqlalchemy.orm as orm

from database import engine, SessionLocal, Base, User, Trip, BlogDraft, init_db
from auth import create_token, verify_token, hash_password, verify_password
from ai_engine import generate_trip_plan, generate_blog, generate_route_plan, generate_quick_chat
from mock_data import get_hotels, get_weather, get_suggested_destinations, get_cost_estimate

init_db()

app = FastAPI(title="AI Travel Assistant", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Server error: {str(exc)}"},
        headers={"Access-Control-Allow-Origin": "*"}
    )

security = HTTPBearer()


# ─── DEPENDENCIES ─────────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security),
    db: orm.Session = Depends(get_db)
):
    payload = verify_token(creds.credentials)
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ─── MODELS ───────────────────────────────────────────────────────────────────

class RegisterModel(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    travel_style: Optional[str] = "mid"


class LoginModel(BaseModel):
    email: str
    password: str


class TripQuery(BaseModel):
    query: str
    save: Optional[bool] = False


class BlogQuery(BaseModel):
    destination: str
    trip_details: Optional[str] = ""
    save: Optional[bool] = False


class RouteQuery(BaseModel):
    origin: str
    destination: str
    vehicle: Optional[str] = "car"


class ChatQuery(BaseModel):
    message: str
    context: Optional[str] = ""


class HotelQuery(BaseModel):
    destination: str
    budget_type: Optional[str] = "all"


# ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

@app.post("/register")
async def register(request: Request, db: orm.Session = Depends(get_db)):
    try:
        body = await request.json()
        name = str(body.get("name", ""))
        email = str(body.get("email", ""))
        password = str(body.get("password", ""))
        phone = body.get("phone", None)
        travel_style = str(body.get("travel_style", "mid"))

        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required")

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = User(name=name, email=email, password=hash_password(password),
                    phone=phone, travel_style=travel_style)
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_token({"user_id": user.id})
        return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@app.post("/login")
async def login(request: Request, db: orm.Session = Depends(get_db)):
    try:
        body = await request.json()
        email = str(body.get("email", ""))
        password = str(body.get("password", ""))

        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_token({"user_id": user.id})
        return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "travel_style": user.travel_style}}
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "travel_style": current_user.travel_style
    }


# ─── TRIP PLANNING ────────────────────────────────────────────────────────────

@app.post("/plan")
def plan_trip(
    data: TripQuery,
    db: orm.Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = generate_trip_plan(data.query)

    if "error" not in result and data.save:
        trip = Trip(
            user_id=current_user.id,
            title=result.get("destination", "My Trip"),
            query=data.query,
            destination=result.get("destination", ""),
            result=str(result),
            duration=f"{len(result.get('itinerary', []))} days",
            budget=result.get("cost_breakdown", {}).get("total", 0)
        )
        db.add(trip)
        db.commit()

    return result


@app.get("/my-trips")
def get_my_trips(
    db: orm.Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).order_by(Trip.created_at.desc()).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "destination": t.destination,
            "query": t.query,
            "duration": t.duration,
            "budget": t.budget,
            "status": t.status,
            "created_at": t.created_at.isoformat()
        }
        for t in trips
    ]


@app.delete("/trips/{trip_id}")
def delete_trip(
    trip_id: int,
    db: orm.Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted"}


# ─── BLOG GENERATOR ───────────────────────────────────────────────────────────

@app.post("/blog")
def create_blog(
    data: BlogQuery,
    db: orm.Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = generate_blog(data.destination, data.trip_details)

    if "error" not in result and data.save:
        blog = BlogDraft(
            user_id=current_user.id,
            title=result.get("title", "Travel Blog"),
            content=result.get("content", ""),
            destination=data.destination
        )
        db.add(blog)
        db.commit()

    return result


@app.get("/my-blogs")
def get_my_blogs(
    db: orm.Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    blogs = db.query(BlogDraft).filter(BlogDraft.user_id == current_user.id).order_by(BlogDraft.created_at.desc()).all()
    return [
        {
            "id": b.id,
            "title": b.title,
            "destination": b.destination,
            "created_at": b.created_at.isoformat()
        }
        for b in blogs
    ]


# ─── ROUTE PLANNER ────────────────────────────────────────────────────────────

@app.post("/route")
def plan_route(
    data: RouteQuery,
    current_user: User = Depends(get_current_user)
):
    return generate_route_plan(data.origin, data.destination, data.vehicle)


# ─── HOTELS ───────────────────────────────────────────────────────────────────

@app.post("/hotels")
def search_hotels(
    data: HotelQuery,
    current_user: User = Depends(get_current_user)
):
    hotels = get_hotels(data.destination, data.budget_type)
    return {"destination": data.destination, "hotels": hotels}


# ─── CHAT ASSISTANT ───────────────────────────────────────────────────────────

@app.post("/chat")
def chat(
    data: ChatQuery,
    current_user: User = Depends(get_current_user)
):
    response = generate_quick_chat(data.message, data.context)
    return {"response": response}


# ─── DASHBOARD DATA ───────────────────────────────────────────────────────────

@app.get("/dashboard")
def get_dashboard(
    db: orm.Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
    blogs = db.query(BlogDraft).filter(BlogDraft.user_id == current_user.id).all()

    total_budget = sum(t.budget or 0 for t in trips)
    destinations = list(set(t.destination for t in trips if t.destination))

    suggestions = get_suggested_destinations()
    weather = get_weather()
    month = datetime.now().strftime("%b")

    return {
        "stats": {
            "total_trips": len(trips),
            "total_blogs": len(blogs),
            "destinations_visited": len(destinations),
            "total_spent": total_budget
        },
        "recent_trips": [
            {"id": t.id, "title": t.title, "destination": t.destination, "budget": t.budget, "created_at": t.created_at.isoformat()}
            for t in trips[:5]
        ],
        "suggested_destinations": suggestions,
        "weather_now": {"month": month, **weather},
        "quick_cost": {
            "budget": get_cost_estimate(3, "budget"),
            "mid": get_cost_estimate(3, "mid"),
            "luxury": get_cost_estimate(3, "luxury")
        }
    }


@app.get("/health")
def health():
    return {"status": "ok", "app": "AI Travel Assistant"}
