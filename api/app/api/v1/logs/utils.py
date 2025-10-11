"""
Shared utilities for logs endpoints
"""
from datetime import datetime
from typing import Optional, Dict, List, Any
from sqlalchemy import func
import csv
import io

from app.core.errors import ValidationError
from app.models.log import LogEntry as DBLogEntry


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


def format_chart_data(time_series_data: List[tuple]) -> Dict[str, Dict[str, Any]]:
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