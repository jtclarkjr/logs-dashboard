"""
Log analytics endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional, Dict, Any

from app.core.database import get_db
from app.core.errors import (
    raise_database_error,
    NotFoundError, ValidationError, DatabaseError
)
from app.crud.log import log_crud
from app.schemas.log import (
    LogCountByDate, LogCountBySeverity, LogCountBySource, 
    LogAggregationResponse
)
from app.models.log import SeverityLevel, LogEntry as DBLogEntry
from .utilities import validate_date_range, get_time_group_expression, format_chart_data

router = APIRouter()


@router.get("/logs/aggregation", response_model=LogAggregationResponse, summary="Get aggregated log data")
def get_log_aggregation(
    start_date: Optional[datetime] = Query(None, description="Start date for aggregation"),
    end_date: Optional[datetime] = Query(None, description="End date for aggregation"),
    severity: Optional[SeverityLevel] = Query(None, description="Filter by severity"),
    source: Optional[str] = Query(None, description="Filter by source"),
    db: Session = Depends(get_db)
) -> LogAggregationResponse:
    """Get aggregated log data for dashboard analytics"""
    try:
        # Validate date range if provided
        validate_date_range(start_date, end_date)
        
        agg_data = log_crud.get_aggregation_data(
            db=db,
            start_date=start_date,
            end_date=end_date,
            severity=severity,
            source=source
        )
        
        return LogAggregationResponse(
            total_logs=agg_data["total_logs"],
            date_range_start=start_date,
            date_range_end=end_date,
            by_severity=[
                LogCountBySeverity(severity=sev, count=count)
                for sev, count in agg_data["by_severity"]
            ],
            by_source=[
                LogCountBySource(source=src, count=count)
                for src, count in agg_data["by_source"]
            ],
            by_date=[
                LogCountByDate(date=str(date), count=count)
                for date, count in agg_data["by_date"]
            ]
        )
    except (ValidationError, NotFoundError, DatabaseError):
        raise
    except Exception as e:
        raise_database_error("aggregation generation", original_error=e)


@router.get("/logs/chart-data", summary="Get chart data for time series")
def get_chart_data(
    start_date: Optional[datetime] = Query(None, description="Start date for chart data"),
    end_date: Optional[datetime] = Query(None, description="End date for chart data"),
    severity: Optional[SeverityLevel] = Query(None, description="Filter by severity"),
    source: Optional[str] = Query(None, description="Filter by source"),
    group_by: str = Query("day", pattern="^(hour|day|week|month)$", description="Time grouping"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get time series data for charts"""
    try:
        # Build base query with filters
        base_query = db.query(DBLogEntry)
        
        if start_date:
            base_query = base_query.filter(DBLogEntry.timestamp >= start_date)
        if end_date:
            base_query = base_query.filter(DBLogEntry.timestamp <= end_date)
        if severity:
            base_query = base_query.filter(DBLogEntry.severity == severity)
        if source:
            base_query = base_query.filter(DBLogEntry.source.ilike(f"%{source}%"))
        
        # Get time grouping expression
        time_group = get_time_group_expression(group_by)
        
        # Execute query
        time_series_data = (
            base_query
            .with_entities(
                time_group.label('time_period'),
                DBLogEntry.severity,
                func.count(DBLogEntry.id).label('count')
            )
            .group_by(time_group, DBLogEntry.severity)
            .order_by('time_period')
            .all()
        )
        
        # Format response
        chart_data = format_chart_data(time_series_data)
        
        return {
            'data': list(chart_data.values()),
            'group_by': group_by,
            'start_date': start_date,
            'end_date': end_date,
            'filters': {
                'severity': severity.value if severity else None,
                'source': source
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating chart data: {str(e)}")