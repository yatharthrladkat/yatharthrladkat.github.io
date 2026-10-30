from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import check_db_connection, engine, Base, SessionLocal
from backend.app.seed import seed_database
from backend.app.api.routes import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize schema and seed demonstration records on startup
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as exc:
        print(f"Startup seed notice: {exc}")
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Deterministic resource allocation and relief preemption backend for Madhya Pradesh drought mitigation.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS configuration: Allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8081",
        "http://127.0.0.1:8081"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include core domain API router
app.include_router(api_router)


@app.get("/", tags=["System"])
def root_info():
    """Returns basic system identification and documentation links."""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "operational",
        "docs_url": "/docs",
        "health_check": "/api/v1/health"
    }


@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    """
    Verifies that the API server is active and tests database connectivity
    without exposing credentials.
    """
    db_status = check_db_connection()
    is_healthy = db_status["status"] == "connected"
    
    return {
        "status": "healthy" if is_healthy else "degraded",
        "service": settings.app_name,
        "version": settings.app_version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": db_status
    }
