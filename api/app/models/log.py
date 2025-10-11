from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.core.database import Base


class SeverityLevel(str, enum.Enum):
    """Enumeration for log severity levels"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class LogEntry(Base):
    """
    Database model for log entries.
    
    This model represents the logs table with all required fields
    as specified in the assignment requirements.
    """
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False, 
        index=True
    )
    message = Column(String, nullable=False)
    severity = Column(Enum(SeverityLevel), nullable=False, index=True)
    source = Column(String, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
    )

    def __repr__(self) -> str:
        return (
            f"<LogEntry("
            f"id={self.id}, "
            f"timestamp={self.timestamp}, "
            f"severity={self.severity}, "
            f"source={self.source}"
            f")>"
        )