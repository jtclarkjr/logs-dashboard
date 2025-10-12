"""
Validation functions for log operations
"""
from datetime import datetime, timezone
from typing import Optional

from app.core.errors import ValidationError
from app.schemas.log import LogCreate, LogUpdate
from app.models.log import SeverityLevel


def validate_log_creation(log_data: LogCreate) -> None:
    """
    Validate data for log creation
    
    Args:
        log_data: The log creation data to validate
        
    Raises:
        ValidationError: If validation fails
    """
    validation_errors = []
    
    # Validate required message field
    if not hasattr(log_data, 'message') or log_data.message is None:
        validation_errors.append({
            "field": "message", 
            "value": "null", 
            "reason": "Message field is required"
        })
    elif not log_data.message.strip():
        validation_errors.append({
            "field": "message", 
            "value": log_data.message, 
            "reason": "Message cannot be empty"
        })
    elif len(log_data.message) > 10000:
        validation_errors.append({
            "field": "message", 
            "value": f"length: {len(log_data.message)}", 
            "reason": "Message too long (max 10000 characters)"
        })
    
    # Validate required source field
    if not hasattr(log_data, 'source') or log_data.source is None:
        validation_errors.append({
            "field": "source", 
            "value": "null", 
            "reason": "Source field is required"
        })
    elif not log_data.source.strip():
        validation_errors.append({
            "field": "source", 
            "value": log_data.source, 
            "reason": "Source cannot be empty"
        })
    elif len(log_data.source) > 255:
        validation_errors.append({
            "field": "source", 
            "value": f"length: {len(log_data.source)}", 
            "reason": "Source too long (max 255 characters)"
        })
    
    # Validate severity field
    if hasattr(log_data, 'severity') and log_data.severity is not None:
        valid_severities = [level.value for level in SeverityLevel]
        if log_data.severity not in valid_severities:
            validation_errors.append({
                "field": "severity", 
                "value": log_data.severity, 
                "reason": f"Must be one of: {', '.join(valid_severities)}"
            })
    
    # Validate timestamp field
    if hasattr(log_data, 'timestamp') and log_data.timestamp is not None:
        # Handle timezone-aware vs timezone-naive datetime comparison
        current_time = datetime.now(timezone.utc) if log_data.timestamp.tzinfo else datetime.now()
        if log_data.timestamp > current_time:
            validation_errors.append({
                "field": "timestamp", 
                "value": log_data.timestamp.isoformat(), 
                "reason": "Timestamp cannot be in the future"
            })
    
    # If there are validation errors, raise them
    if validation_errors:
        raise ValidationError(
            "Validation failed for log creation", 
            {"validation_errors": validation_errors, "total_errors": len(validation_errors)}
        )


def validate_log_update(log_id: int, log_update: LogUpdate) -> None:
    """
    Validate data for log update
    
    Args:
        log_id: The ID of the log to update
        log_update: The log update data to validate
        
    Raises:
        ValidationError: If validation fails
    """
    validation_errors = []
    
    # Validate log_id
    if log_id <= 0:
        validation_errors.append({
            "field": "log_id", 
            "value": str(log_id), 
            "reason": "Log ID must be a positive integer"
        })
    
    # Check if message is being updated and is valid
    if hasattr(log_update, 'message') and log_update.message is not None:
        if not log_update.message.strip():
            validation_errors.append({
                "field": "message", 
                "value": log_update.message, 
                "reason": "Message cannot be empty"
            })
        elif len(log_update.message) > 10000:
            validation_errors.append({
                "field": "message", 
                "value": f"length: {len(log_update.message)}", 
                "reason": "Message too long (max 10000 characters)"
            })
    
    # Check if source is being updated and is valid
    if hasattr(log_update, 'source') and log_update.source is not None:
        if not log_update.source.strip():
            validation_errors.append({
                "field": "source", 
                "value": log_update.source, 
                "reason": "Source cannot be empty"
            })
        elif len(log_update.source) > 255:
            validation_errors.append({
                "field": "source", 
                "value": f"length: {len(log_update.source)}", 
                "reason": "Source too long (max 255 characters)"
            })
    
    # Check if severity is being updated and is valid
    if hasattr(log_update, 'severity') and log_update.severity is not None:
        valid_severities = [level.value for level in SeverityLevel]
        if log_update.severity not in valid_severities:
            validation_errors.append({
                "field": "severity", 
                "value": log_update.severity, 
                "reason": f"Must be one of: {', '.join(valid_severities)}"
            })
    
    # Check if timestamp is being updated and is valid
    if hasattr(log_update, 'timestamp') and log_update.timestamp is not None:
        # Handle timezone-aware vs timezone-naive datetime comparison
        current_time = datetime.now(timezone.utc) if log_update.timestamp.tzinfo else datetime.now()
        if log_update.timestamp > current_time:
            validation_errors.append({
                "field": "timestamp", 
                "value": log_update.timestamp.isoformat(), 
                "reason": "Timestamp cannot be in the future"
            })
    
    # If there are validation errors, raise them
    if validation_errors:
        raise ValidationError(
            "Validation failed for log update", 
            {"validation_errors": validation_errors, "total_errors": len(validation_errors)}
        )


def validate_log_query_params(
    page: int, 
    page_size: int, 
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None
) -> None:
    """
    Validate query parameters for log listing
    
    Args:
        page: Page number
        page_size: Number of items per page
        start_date: Start date filter (optional)
        end_date: End date filter (optional)
        
    Raises:
        ValidationError: If validation fails
    """
    validation_errors = []
    
    # Validate pagination parameters
    if page < 1:
        validation_errors.append({
            "field": "page", 
            "value": str(page), 
            "reason": "Page number must be >= 1"
        })
    
    if page_size < 1:
        validation_errors.append({
            "field": "page_size", 
            "value": str(page_size), 
            "reason": "Page size must be >= 1"
        })
    
    # Validate date range if provided
    if start_date and end_date and start_date > end_date:
        validation_errors.append({
            "field": "date_range", 
            "value": f"{start_date} to {end_date}", 
            "reason": "Start date must be before end date"
        })
    
    # If there are validation errors, raise them
    if validation_errors:
        raise ValidationError(
            "Validation failed for log query parameters", 
            {"validation_errors": validation_errors, "total_errors": len(validation_errors)}
        )


def validate_log_id(log_id: int) -> None:
    """
    Validate a log ID
    
    Args:
        log_id: The log ID to validate
        
    Raises:
        ValidationError: If validation fails
    """
    if log_id <= 0:
        raise ValidationError(
            "Invalid log ID",
            {
                "validation_errors": [{
                    "field": "log_id", 
                    "value": str(log_id), 
                    "reason": "Log ID must be a positive integer"
                }],
                "total_errors": 1
            }
        )
