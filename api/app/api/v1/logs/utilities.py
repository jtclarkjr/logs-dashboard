"""
Log utility endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from datetime import datetime
from typing import Optional, Dict, Any

from app.core.database import get_db
from app.core.config import settings
from app.crud.log import log_crud
from app.models.log import SeverityLevel, LogEntry as DBLogEntry
from .utils import generate_csv_content

router = APIRouter()


@router.get("/metadata", summary="Get metadata for frontend")
def get_metadata(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get metadata for frontend dropdowns and filters"""
    try:
        # Get unique sources
        sources = db.query(distinct(DBLogEntry.source)).order_by(DBLogEntry.source).all()
        source_list = [source[0] for source in sources]
        
        # Get date range
        date_range = db.query(
            func.min(DBLogEntry.timestamp).label('earliest'),
            func.max(DBLogEntry.timestamp).label('latest')
        ).first()
        
        # Get log counts by severity
        severity_stats = db.query(
            DBLogEntry.severity,
            func.count(DBLogEntry.id).label('count')
        ).group_by(DBLogEntry.severity).all()
        
        return {
            "severity_levels": [level.value for level in SeverityLevel],
            "sources": source_list,
            "date_range": {
                "earliest": date_range.earliest.isoformat() if date_range.earliest else None,
                "latest": date_range.latest.isoformat() if date_range.latest else None
            },
            "severity_stats": {
                severity.value: count for severity, count in severity_stats
            },
            "total_logs": sum(count for _, count in severity_stats),
            "sort_fields": ["timestamp", "severity", "source", "message"],
            "pagination": {
                "default_page_size": settings.DEFAULT_PAGE_SIZE,
                "max_page_size": settings.MAX_PAGE_SIZE
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching metadata: {str(e)}")


@router.get("/export/csv", summary="Export logs as CSV")
def export_logs_csv(
    severity: Optional[SeverityLevel] = Query(None, description="Filter by severity"),
    source: Optional[str] = Query(None, description="Filter by source"),
    start_date: Optional[datetime] = Query(None, description="Start date filter"),
    end_date: Optional[datetime] = Query(None, description="End date filter"),
    db: Session = Depends(get_db)
) -> Response:
    """Export filtered logs as CSV file"""
    try:
        logs = log_crud.get_for_export(
            db=db,
            severity=severity,
            source=source,
            start_date=start_date,
            end_date=end_date
        )
        
        csv_content = generate_csv_content(logs)
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=logs_export.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error exporting logs: {str(e)}")