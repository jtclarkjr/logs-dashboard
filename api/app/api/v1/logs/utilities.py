"""
Log utility endpoints and shared utility functions
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from datetime import datetime
from typing import Optional, Dict, Any, List, Union, Sequence
import csv
import io

from app.core.database import get_db
from app.core.config import settings
from app.core.errors import ValidationError, ApiError
from app.crud.log import log_crud
from app.models.log import SeverityLevel, LogEntry as DBLogEntry

router = APIRouter()


# Utility functions (previously in utils.py)
def validate_date_range(start_date: Optional[datetime], end_date: Optional[datetime]) -> None:
    """Validate that start_date is before end_date if both are provided."""
    if start_date and end_date and start_date > end_date:
        raise ValidationError(
            "Invalid date range",
            {
                "validation_errors": [{
                    "field": "date_range", 
                    "value": f"{start_date} to {end_date}", 
                    "reason": "Start date must be before end date"
                }],
                "total_errors": 1
            }
        )


def get_time_group_expression(group_by: str):
    """Get SQLAlchemy expression for time grouping."""
    time_group_mapping = {
        "hour": func.date_trunc('hour', DBLogEntry.timestamp),
        "day": func.date_trunc('day', DBLogEntry.timestamp),
        "week": func.date_trunc('week', DBLogEntry.timestamp),
        "month": func.date_trunc('month', DBLogEntry.timestamp)
    }
    return time_group_mapping.get(group_by, time_group_mapping["day"])


def format_chart_data(time_series_data: Sequence[Any]) -> Dict[str, Dict[str, Any]]:
    """Format database results into chart data structure."""
    chart_data = {}
    
    for time_period, severity, count in time_series_data:
        time_str = time_period.isoformat()
        if time_str not in chart_data:
            chart_data[time_str] = {
                'timestamp': time_str,
                'total': 0,
                'DEBUG': 0,
                'INFO': 0,
                'WARNING': 0,
                'ERROR': 0,
                'CRITICAL': 0
            }
        if severity:
            chart_data[time_str][severity.value] = count
        chart_data[time_str]['total'] += count
    
    return chart_data


def generate_csv_content(logs: List[Any]) -> str:
    """Generate CSV content from log entries."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['id', 'timestamp', 'severity', 'source', 'message', 'created_at'])
    
    # Write data
    for log in logs:
        writer.writerow([
            log.id,
            log.timestamp.isoformat(),
            log.severity.value,
            log.source,
            log.message,
            log.created_at.isoformat()
        ])
    
    csv_content = output.getvalue()
    output.close()
    return csv_content

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
                "earliest": date_range.earliest.isoformat() if date_range and date_range.earliest else None,
                "latest": date_range.latest.isoformat() if date_range and date_range.latest else None
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
        # Validate date range
        validate_date_range(start_date, end_date)
        
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
    except ApiError:
        # Re-raise ApiError (including ValidationError) to be handled by middleware
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error exporting logs: {str(e)}")
