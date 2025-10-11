from pydantic import BaseModel
from typing import Optional


class HealthResponse(BaseModel):
    """Schema for health check responses"""
    status: str
    message: str
    version: str


class ErrorResponse(BaseModel):
    """Schema for error responses"""
    detail: str
    error_type: Optional[str] = None