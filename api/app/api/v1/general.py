from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict

from app.core.database import get_db
from app.core.config import settings
from app.schemas.common import HealthResponse

router = APIRouter()


@router.get("/", summary="API root")
def root() -> Dict[str, str]:
    """Welcome message and API information"""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health"
    }


@router.get("/health", response_model=HealthResponse, summary="Health check")
def health_check(db: Session = Depends(get_db)) -> HealthResponse:
    """Health check endpoint with database connectivity test"""
    try:
        # Test database connection
        db.execute("SELECT 1")
        db_status = "connected"
        status = "healthy"
    except Exception:
        db_status = "disconnected"
        status = "unhealthy"
    
    return HealthResponse(
        status=status,
        message=f"API is running - Database: {db_status}",
        version=settings.VERSION
    )