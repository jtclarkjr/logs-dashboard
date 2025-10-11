"""
Log creation endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import (
    raise_database_error,
    NotFoundError, ValidationError, DatabaseError
)
from app.validators.log_validators import validate_log_creation
from app.crud.log import log_crud
from app.schemas.log import LogCreate, LogResponse

router = APIRouter()


@router.post("/", response_model=LogResponse, status_code=201, summary="Create log entry")
def create_log(
    log_data: LogCreate,
    db: Session = Depends(get_db)
) -> LogResponse:
    """Create a new log entry"""
    try:
        # Validate the input data
        validate_log_creation(log_data)
        
        # Create the log entry
        db_log = log_crud.create(db=db, log_data=log_data)
        if not db_log:
            raise_database_error("log creation", {"reason": "Failed to create log entry in database"})
        
        return LogResponse.from_orm(db_log)
        
    except (ValidationError, NotFoundError, DatabaseError):
        # These errors will be handled by the middleware
        raise
    except Exception as e:
        # Convert unexpected errors to database errors
        raise_database_error("log creation", {"original_error": str(e)})