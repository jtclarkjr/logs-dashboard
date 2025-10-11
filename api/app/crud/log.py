from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
import math

from app.models.log import LogEntry, SeverityLevel
from app.schemas.log import LogCreate, LogUpdate


class LogCRUD:
    """CRUD operations for log entries"""
    
    @staticmethod
    def create(db: Session, log_data: LogCreate) -> LogEntry:
        """Create a new log entry"""
        db_log = LogEntry(
            message=log_data.message,
            severity=log_data.severity,
            source=log_data.source,
            timestamp=log_data.timestamp or datetime.utcnow()
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log
    
    @staticmethod
    def get_by_id(db: Session, log_id: int) -> Optional[LogEntry]:
        """Get a log entry by ID"""
        return db.query(LogEntry).filter(LogEntry.id == log_id).first()
    
    @staticmethod
    def get_multi(
        db: Session,
        *,
        page: int = 1,
        page_size: int = 50,
        severity: Optional[SeverityLevel] = None,
        source: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        search: Optional[str] = None,
        sort_by: str = "timestamp",
        sort_order: str = "desc"
    ) -> tuple[List[LogEntry], int]:
        """Get multiple log entries with filtering and pagination"""
        
        query = db.query(LogEntry)
        
        # Apply filters
        if severity:
            query = query.filter(LogEntry.severity == severity)
        if source:
            query = query.filter(LogEntry.source.ilike(f"%{source}%"))
        if start_date:
            query = query.filter(LogEntry.timestamp >= start_date)
        if end_date:
            query = query.filter(LogEntry.timestamp <= end_date)
        if search:
            query = query.filter(LogEntry.message.ilike(f"%{search}%"))
        
        # Get total count before pagination
        total = query.count()
        
        # Apply sorting
        if hasattr(LogEntry, sort_by):
            sort_field = getattr(LogEntry, sort_by)
            if sort_order == "desc":
                query = query.order_by(desc(sort_field))
            else:
                query = query.order_by(sort_field)
        
        # Apply pagination
        offset = (page - 1) * page_size
        logs = query.offset(offset).limit(page_size).all()
        
        return logs, total
    
    @staticmethod
    def update(db: Session, log_id: int, log_update: LogUpdate) -> Optional[LogEntry]:
        """Update a log entry"""
        log = db.query(LogEntry).filter(LogEntry.id == log_id).first()
        if not log:
            return None
        
        # Update only provided fields
        update_data = log_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(log, field, value)
        
        db.commit()
        db.refresh(log)
        return log
    
    @staticmethod
    def delete(db: Session, log_id: int) -> bool:
        """Delete a log entry"""
        log = db.query(LogEntry).filter(LogEntry.id == log_id).first()
        if not log:
            return False
        
        db.delete(log)
        db.commit()
        return True
    
    @staticmethod
    def get_aggregation_data(
        db: Session,
        *,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        severity: Optional[SeverityLevel] = None,
        source: Optional[str] = None,
    ) -> dict:
        """Get aggregated data for analytics"""
        
        base_query = db.query(LogEntry)
        
        # Apply filters
        if start_date:
            base_query = base_query.filter(LogEntry.timestamp >= start_date)
        if end_date:
            base_query = base_query.filter(LogEntry.timestamp <= end_date)
        if severity:
            base_query = base_query.filter(LogEntry.severity == severity)
        if source:
            base_query = base_query.filter(LogEntry.source.ilike(f"%{source}%"))
        
        # Total logs count
        total_logs = base_query.count()
        
        # Count by severity
        severity_counts = (
            base_query
            .with_entities(LogEntry.severity, func.count(LogEntry.id))
            .group_by(LogEntry.severity)
            .all()
        )
        
        # Count by source (top 10)
        source_counts = (
            base_query
            .with_entities(LogEntry.source, func.count(LogEntry.id))
            .group_by(LogEntry.source)
            .order_by(desc(func.count(LogEntry.id)))
            .limit(10)
            .all()
        )
        
        # Count by date (daily aggregation)
        date_counts = (
            base_query
            .with_entities(
                func.date(LogEntry.timestamp).label('date'),
                func.count(LogEntry.id).label('count')
            )
            .group_by(func.date(LogEntry.timestamp))
            .order_by('date')
            .all()
        )
        
        return {
            "total_logs": total_logs,
            "by_severity": severity_counts,
            "by_source": source_counts,
            "by_date": date_counts
        }
    
    @staticmethod
    def get_for_export(
        db: Session,
        *,
        severity: Optional[SeverityLevel] = None,
        source: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[LogEntry]:
        """Get logs for CSV export"""
        
        query = db.query(LogEntry)
        
        # Apply filters
        if severity:
            query = query.filter(LogEntry.severity == severity)
        if source:
            query = query.filter(LogEntry.source.ilike(f"%{source}%"))
        if start_date:
            query = query.filter(LogEntry.timestamp >= start_date)
        if end_date:
            query = query.filter(LogEntry.timestamp <= end_date)
        
        return query.order_by(desc(LogEntry.timestamp)).all()


# Create a global instance
log_crud = LogCRUD()