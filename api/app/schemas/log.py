from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from typing import Optional, List, Dict

from app.models.log import SeverityLevel


# Base schemas
class LogBase(BaseModel):
    """Base schema with common log fields"""
    message: str = Field(..., min_length=1, max_length=1000, description="Log message")
    severity: SeverityLevel = Field(..., description="Log severity level")
    source: str = Field(..., min_length=1, max_length=100, description="Log source")
    timestamp: Optional[datetime] = Field(None, description="Log timestamp (defaults to current time)")


class LogCreate(LogBase):
    """Schema for creating a new log entry"""
    pass


class LogUpdate(BaseModel):
    """Schema for updating an existing log entry"""
    message: Optional[str] = Field(None, min_length=1, max_length=1000)
    severity: Optional[SeverityLevel] = None
    source: Optional[str] = Field(None, min_length=1, max_length=100)
    timestamp: Optional[datetime] = None


class LogResponse(LogBase):
    """Schema for log entry responses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime


# Response schemas
class LogListResponse(BaseModel):
    """Schema for paginated log list responses"""
    logs: List[LogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Filter schemas
class LogFilters(BaseModel):
    """Schema for log filtering parameters"""
    severity: Optional[SeverityLevel] = None
    source: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    search: Optional[str] = Field(None, min_length=1, description="Search in message")


# Aggregation schemas
class LogCountByDate(BaseModel):
    """Schema for log count by date"""
    date: str
    count: int


class LogCountBySeverity(BaseModel):
    """Schema for log count by severity"""
    severity: SeverityLevel
    count: int


class LogCountBySource(BaseModel):
    """Schema for log count by source"""
    source: str
    count: int


class LogAggregationResponse(BaseModel):
    """Schema for log aggregation responses"""
    total_logs: int
    date_range_start: Optional[datetime]
    date_range_end: Optional[datetime]
    by_severity: List[LogCountBySeverity]
    by_source: List[LogCountBySource]
    by_date: List[LogCountByDate]


# Chart data schemas
class ChartDataPoint(BaseModel):
    """Schema for individual chart data points"""
    timestamp: str
    total: int
    DEBUG: int = 0
    INFO: int = 0
    WARNING: int = 0
    ERROR: int = 0
    CRITICAL: int = 0


class ChartDataResponse(BaseModel):
    """Schema for chart data responses"""
    data: List[ChartDataPoint]
    group_by: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    filters: Dict[str, Optional[str]]


# Metadata schemas
class DateRangeMetadata(BaseModel):
    """Schema for date range metadata"""
    earliest: Optional[str]
    latest: Optional[str]


class PaginationMetadata(BaseModel):
    """Schema for pagination metadata"""
    default_page_size: int
    max_page_size: int


class MetadataResponse(BaseModel):
    """Schema for metadata responses"""
    severity_levels: List[str]
    sources: List[str]
    date_range: DateRangeMetadata
    severity_stats: Dict[str, int]
    total_logs: int
    sort_fields: List[str]
    pagination: PaginationMetadata
