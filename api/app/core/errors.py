"""
Centralized error handling for the API
"""
from typing import Any, Dict, Optional, Union, NoReturn, cast
from fastapi import HTTPException
from fastapi.responses import JSONResponse
import traceback
import logging

logger = logging.getLogger(__name__)

# Define standardized error codes
class ErrorCodes:
    # General errors (1000-1999)
    INTERNAL_SERVER_ERROR = 1000
    VALIDATION_ERROR = 1001
    AUTHENTICATION_ERROR = 1002
    AUTHORIZATION_ERROR = 1003
    
    # Log-specific errors (2000-2999)
    LOG_NOT_FOUND = 2001
    LOG_CREATE_ERROR = 2002
    LOG_UPDATE_ERROR = 2003
    LOG_DELETE_ERROR = 2004
    LOG_QUERY_ERROR = 2005
    
    # Database errors (3000-3999)
    DATABASE_CONNECTION_ERROR = 3001
    DATABASE_CONSTRAINT_ERROR = 3002
    DATABASE_TIMEOUT_ERROR = 3003


class ErrorMessages:
    # General error messages
    INTERNAL_SERVER_ERROR = "An internal server error occurred"
    VALIDATION_ERROR = "Invalid request data provided"
    AUTHENTICATION_ERROR = "Authentication required"
    AUTHORIZATION_ERROR = "Insufficient permissions"
    
    # Log-specific error messages
    LOG_NOT_FOUND = "Log entry not found"
    LOG_CREATE_ERROR = "Failed to create log entry"
    LOG_UPDATE_ERROR = "Failed to update log entry"
    LOG_DELETE_ERROR = "Failed to delete log entry"
    LOG_QUERY_ERROR = "Failed to query log entries"
    
    # Database error messages
    DATABASE_CONNECTION_ERROR = "Database connection failed"
    DATABASE_CONSTRAINT_ERROR = "Database constraint violation"
    DATABASE_TIMEOUT_ERROR = "Database operation timed out"


class ApiError(Exception):
    """Base API error class"""
    
    def __init__(
        self,
        message: str,
        code: int,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(ApiError):
    """Validation error"""
    
    def __init__(self, message: str = ErrorMessages.VALIDATION_ERROR, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, ErrorCodes.VALIDATION_ERROR, 422, details)


class NotFoundError(ApiError):
    """Resource not found error"""
    
    def __init__(self, message: str = ErrorMessages.LOG_NOT_FOUND, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, ErrorCodes.LOG_NOT_FOUND, 404, details)


class DatabaseError(ApiError):
    """Database operation error"""
    
    def __init__(self, message: str = ErrorMessages.DATABASE_CONNECTION_ERROR, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, ErrorCodes.DATABASE_CONNECTION_ERROR, 500, details)


def create_error_response(
    message: str,
    code: int,
    status_code: int = 500,
    details: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None
) -> JSONResponse:
    """Create a standardized error response"""
    
    error_data = {
        "error": {
            "message": message,
            "code": code,
            "details": details or {},
        },
        "success": False
    }
    
    if request_id:
        error_data["request_id"] = request_id
    
    return JSONResponse(
        status_code=status_code,
        content=error_data
    )


def handle_api_error(error: Exception, request_id: Optional[str] = None) -> JSONResponse:
    """Handle different types of API errors and return appropriate responses"""
    
    if isinstance(error, ApiError):
        logger.warning(f"API Error: {error.message} (Code: {error.code})")
        return create_error_response(
            message=error.message,
            code=error.code,
            status_code=error.status_code,
            details=error.details,
            request_id=request_id
        )
    
    elif isinstance(error, HTTPException):
        http_error = cast(HTTPException, error)  # Type casting for pyright
        logger.warning(f"HTTP Exception: {http_error.detail} (Status: {http_error.status_code})")
        return create_error_response(
            message=http_error.detail,
            code=ErrorCodes.INTERNAL_SERVER_ERROR,
            status_code=http_error.status_code,
            request_id=request_id
        )
    
    else:
        # Log the full traceback for unexpected errors
        logger.error(f"Unexpected error: {str(error)}\n{traceback.format_exc()}")
        return create_error_response(
            message=ErrorMessages.INTERNAL_SERVER_ERROR,
            code=ErrorCodes.INTERNAL_SERVER_ERROR,
            status_code=500,
            details={"original_error": str(error)} if logger.level == logging.DEBUG else {},
            request_id=request_id
        )


def raise_not_found_error(resource: str = "Resource", resource_id: Optional[Union[str, int]] = None) -> NoReturn:
    """Raise a standardized not found error"""
    message = f"{resource} not found"
    details = {}
    
    if resource_id is not None:
        message += f" with ID: {resource_id}"
        details["resource_id"] = str(resource_id)
    
    raise NotFoundError(message, details)


def raise_validation_error(field: str, value: Any, reason: str) -> NoReturn:
    """Raise a standardized validation error"""
    message = f"Invalid value for field '{field}': {reason}"
    details = {
        "field": field,
        "value": str(value),
        "reason": reason
    }
    raise ValidationError(message, details)


def raise_database_error(operation: str, details: Optional[Dict[str, Any]] = None) -> NoReturn:
    """Raise a standardized database error"""
    message = f"Database error during {operation}"
    raise DatabaseError(message, details)