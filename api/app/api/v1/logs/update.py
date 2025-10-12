"""
Log update endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import (
    raise_not_found_error, raise_database_error,
    NotFoundError, ValidationError, DatabaseError
)
from app.validators.log_validators import validate_log_update
from app.crud.log import log_crud
from app.schemas.log import LogUpdate, LogResponse

router = APIRouter()


@router.put("/{log_id}", response_model=LogResponse, summary="Update log entry")
def update_log(
    log_id: int,
    log_update: LogUpdate,
    db: Session = Depends(get_db)
) -> LogResponse:
    """Update a specific log by ID"""
    try:
        # Validate input data
        validate_log_update(log_id, log_update)
        
        # Check if log exists
        existing_log = log_crud.get_by_id(db=db, log_id=log_id)
        if not existing_log:
            raise_not_found_error("Log", log_id)
        
        # Perform the update
        updated_log = log_crud.update(db=db, log_id=log_id, log_update=log_update)
        if not updated_log:
            raise_database_error("log update", {"log_id": log_id, "reason": "Log update returned no result - log may have been deleted"})
        
        return LogResponse.model_validate(updated_log)
        
    except (ValidationError, NotFoundError, DatabaseError):
        raise
    except Exception as e:
        raise_database_error("log update", {"log_id": log_id}, original_error=e)
