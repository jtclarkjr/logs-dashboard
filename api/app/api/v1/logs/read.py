"""
Log read endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import math

from app.core.database import get_db
from app.core.config import settings
from app.core.errors import (
    raise_not_found_error, raise_database_error,
    NotFoundError, ValidationError, DatabaseError
)
from app.validators.log_validators import validate_log_query_params, validate_log_id, validate_log_creation
from app.crud.log import log_crud
from app.schemas.log import LogResponse, LogListResponse, LogCreate
from app.models.log import SeverityLevel

router = APIRouter()


@router.get("/logs", response_model=LogListResponse, summary="Get logs with filtering")
def get_logs(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE, description="Items per page"),
    severity: Optional[SeverityLevel] = Query(None, description="Filter by severity"),
    source: Optional[str] = Query(None, description="Filter by source"),
    start_date: Optional[datetime] = Query(None, description="Start date filter"),
    end_date: Optional[datetime] = Query(None, description="End date filter"),
    search: Optional[str] = Query(None, description="Search in message"),
    sort_by: str = Query("timestamp", description="Sort field"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
    db: Session = Depends(get_db)
) -> LogListResponse:
    """Get logs with filtering, searching, sorting, and pagination"""
    try:
        # Validate query parameters
        validate_log_query_params(page, page_size, start_date, end_date)
        
        logs, total = log_crud.get_multi(
            db=db,
            page=page,
            page_size=page_size,
            severity=severity,
            source=source,
            start_date=start_date,
            end_date=end_date,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        
        return LogListResponse(
            logs=[LogResponse.model_validate(log) for log in logs],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    except (ValidationError, NotFoundError, DatabaseError):
        raise
    except Exception as e:
        raise_database_error("log querying", original_error=e)


@router.get("/logs/{log_id}", response_model=LogResponse, summary="Get log by ID")
def get_log(log_id: int, db: Session = Depends(get_db)) -> LogResponse:
    """Get a specific log by ID"""
    validate_log_id(log_id)
    
    log = log_crud.get_by_id(db=db, log_id=log_id)
    if not log:
        raise_not_found_error("Log", log_id)
    
    return LogResponse.model_validate(log)
