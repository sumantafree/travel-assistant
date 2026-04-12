"""
Database setup
- Production (Render): Uses PostgreSQL via DATABASE_URL env variable
- Local: Uses SQLite (no setup needed)
"""
import os
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # PostgreSQL on Render/Supabase
    # Fix for SQLAlchemy: replace postgres:// with postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)
else:
    # SQLite locally
    DB_PATH = os.path.join(os.path.dirname(__file__), "travel_assistant.db")
    engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(150), unique=True, index=True)
    password = Column(String(200))
    phone = Column(String(20), nullable=True)
    travel_style = Column(String(50), default="budget")
    created_at = Column(DateTime, default=datetime.utcnow)


class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    title = Column(String(200))
    query = Column(Text)
    destination = Column(String(200))
    result = Column(Text)
    duration = Column(String(50))
    budget = Column(Float, nullable=True)
    status = Column(String(20), default="planned")
    created_at = Column(DateTime, default=datetime.utcnow)


class BlogDraft(Base):
    __tablename__ = "blog_drafts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    title = Column(String(300))
    content = Column(Text)
    destination = Column(String(200))
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)
