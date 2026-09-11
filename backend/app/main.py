import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, tickets, messages, feedback, knowledge, dashboard, admin, ai, notifications
from app.services.ai_service import get_ai_mode

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Autonomous AI Customer Support System for Issue Tracking, Management and Feedback",
    description="Full-stack autonomous multi-agent customer issue management platform with deterministic fallback & OpenAI support.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router)
app.include_router(tickets.router)
app.include_router(messages.router)
app.include_router(feedback.router)
app.include_router(knowledge.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(ai.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {
        "project": "Autonomous AI Customer Support System for Issue Tracking, Management and Feedback",
        "status": "online",
        "version": "1.0.0",
        "ai_mode": get_ai_mode(),
        "swagger_docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_mode": get_ai_mode()
    }
