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

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check for frontend build artifacts
possible_dist_dirs = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend_dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "static")),
]
frontend_dist = next((d for d in possible_dist_dirs if os.path.isdir(d)), None)

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_mode": get_ai_mode()
    }

@app.get("/api")
def api_root():
    return {
        "project": "Autonomous AI Customer Support System for Issue Tracking, Management and Feedback",
        "status": "online",
        "version": "1.0.0",
        "ai_mode": get_ai_mode(),
        "swagger_docs": "/docs",
        "redoc": "/redoc"
    }

if frontend_dist:
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path in ("docs", "redoc", "openapi.json"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API endpoint not found")
        target = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
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

