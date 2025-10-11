"""
Log delete endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict

from app.core.database import get_db
from app.core.errors import (
    raise_not_found_error, raise_database_error,
    NotFoundError, ValidationError, DatabaseError
)
from app.validators.log_validators import validate_log_id
from app.crud.log import log_crud

router = APIRouter()


@router.delete("/{log_id}", summary="Delete log entry")
def delete_log(log_id: int, db: Session = Depends(get_db)) -> Dict[str, str]:
    """Delete a specific log by ID"""
    try:
        # Validate log_id
        validate_log_id(log_id)
        
        # Check if log exists before attempting deletion
        existing_log = log_crud.get_by_id(db=db, log_id=log_id)
        if not existing_log:
            raise_not_found_error("Log", log_id)
        
        # Perform deletion
        success = log_crud.delete(db=db, log_id=log_id)
        if not success:
            raise_database_error("log deletion", {"log_id": log_id, "reason": "Delete operation failed"})
        
        return {"message": f"Log {log_id} deleted successfully"}
        
    except (ValidationError, NotFoundError, DatabaseError):
        raise
    except Exception as e:
        raise_database_error("log deletion", {"log_id": log_id, "original_error": str(e)})