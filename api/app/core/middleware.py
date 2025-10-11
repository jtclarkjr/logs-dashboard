"""
FastAPI middleware for error handling
"""
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import uuid
import time
import logging

from .errors import handle_api_error, ApiError

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware to handle all exceptions and return standardized error responses"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next):
        # Generate unique request ID for tracing
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Add request ID to response headers
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            # Add request ID to successful responses
            response.headers["X-Request-ID"] = request_id
            
            # Log successful requests
            process_time = time.time() - start_time
            logger.info(
                f"Request completed - Method: {request.method} "
                f"URL: {request.url.path} "
                f"Status: {response.status_code} "
                f"Duration: {process_time:.3f}s "
                f"Request-ID: {request_id}"
            )
            
            return response
            
        except Exception as error:
            # Log the error with request context
            process_time = time.time() - start_time
            logger.error(
                f"Request failed - Method: {request.method} "
                f"URL: {request.url.path} "
                f"Duration: {process_time:.3f}s "
                f"Request-ID: {request_id} "
                f"Error: {str(error)}"
            )
            
            # Handle the error and return standardized response
            error_response = handle_api_error(error, request_id)
            
            # Add request ID to error response headers
            error_response.headers["X-Request-ID"] = request_id
            
            return error_response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all incoming requests"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next):
        # Log incoming request
        logger.info(
            f"Incoming request - Method: {request.method} "
            f"URL: {request.url.path} "
            f"Query: {request.url.query} "
            f"Client: {request.client.host if request.client else 'unknown'}"
        )
        
        response = await call_next(request)
        return response