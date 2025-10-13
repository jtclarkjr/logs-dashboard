"""
Additional tests to improve coverage for CRUD operations and validators
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError

from app.crud.log import LogCRUD
from app.schemas.log import LogCreate, LogUpdate
from app.models.log import SeverityLevel, LogEntry
from app.validators.log_validators import (
    validate_log_creation,
    validate_log_update, 
    validate_log_query_params,
    validate_log_id
)
from app.core.errors import ValidationError


class TestCRUDErrorHandling:
    """Test database error handling in CRUD operations"""
    
    def test_create_integrity_error(self, db_session):
        """Test create method with IntegrityError"""
        log_data = LogCreate(
            message="Test message",
            severity=SeverityLevel.INFO,
            source="test"
        )
        
        # Mock the database session to raise IntegrityError
        db_session.add.side_effect = IntegrityError("statement", "params", "orig")
        
        with pytest.raises(IntegrityError):
            LogCRUD.create(db_session, log_data)
        
        db_session.rollback.assert_called_once()
    
    def test_create_operational_error(self, db_session):
        """Test create method with OperationalError"""
        log_data = LogCreate(
            message="Test message",
            severity=SeverityLevel.INFO,
            source="test"
        )
        
        # Mock the database session to raise OperationalError
        db_session.add.side_effect = OperationalError("statement", "params", "orig")
        
        with pytest.raises(OperationalError):
            LogCRUD.create(db_session, log_data)
        
        db_session.rollback.assert_called_once()
    
    def test_create_sqlalchemy_error(self, db_session):
        """Test create method with generic SQLAlchemyError"""
        log_data = LogCreate(
            message="Test message",
            severity=SeverityLevel.INFO,
            source="test"
        )
        
        # Mock the database session to raise SQLAlchemyError
        db_session.add.side_effect = SQLAlchemyError("Generic error")
        
        with pytest.raises(SQLAlchemyError):
            LogCRUD.create(db_session, log_data)
        
        db_session.rollback.assert_called_once()
    
    def test_update_not_found(self, db_session):
        """Test update when log doesn't exist"""
        log_update = LogUpdate(message="Updated message")
        
        # Mock query to return None
        db_session.query.return_value.filter.return_value.first.return_value = None
        
        result = LogCRUD.update(db_session, 999, log_update)
        
        assert result is None
    
    def test_update_integrity_error(self, db_session):
        """Test update method with IntegrityError"""
        log_update = LogUpdate(message="Updated message")
        
        # Mock query to return a log
        mock_log = Mock()
        db_session.query.return_value.filter.return_value.first.return_value = mock_log
        db_session.commit.side_effect = IntegrityError("statement", "params", "orig")
        
        with pytest.raises(IntegrityError):
            LogCRUD.update(db_session, 1, log_update)
        
        db_session.rollback.assert_called_once()
    
    def test_update_operational_error(self, db_session):
        """Test update method with OperationalError"""
        log_update = LogUpdate(message="Updated message")
        
        # Mock query to return a log
        mock_log = Mock()
        db_session.query.return_value.filter.return_value.first.return_value = mock_log
        db_session.commit.side_effect = OperationalError("statement", "params", "orig")
        
        with pytest.raises(OperationalError):
            LogCRUD.update(db_session, 1, log_update)
        
        db_session.rollback.assert_called_once()
    
    def test_update_sqlalchemy_error(self, db_session):
        """Test update method with generic SQLAlchemyError"""
        log_update = LogUpdate(message="Updated message")
        
        # Mock query to return a log
        mock_log = Mock()
        db_session.query.return_value.filter.return_value.first.return_value = mock_log
        db_session.commit.side_effect = SQLAlchemyError("Generic error")
        
        with pytest.raises(SQLAlchemyError):
            LogCRUD.update(db_session, 1, log_update)
        
        db_session.rollback.assert_called_once()
    
    def test_delete_not_found(self, db_session):
        """Test delete when log doesn't exist"""
        # Mock query to return None
        db_session.query.return_value.filter.return_value.first.return_value = None
        
        result = LogCRUD.delete(db_session, 999)
        
        assert result is False
    
    def test_delete_integrity_error(self, db_session):
        """Test delete method with IntegrityError"""
        # Mock query to return a log
        mock_log = Mock()
        db_session.query.return_value.filter.return_value.first.return_value = mock_log
        db_session.commit.side_effect = IntegrityError("statement", "params", "orig")
        
        with pytest.raises(IntegrityError):
            LogCRUD.delete(db_session, 1)
        
        db_session.rollback.assert_called_once()
    
    def test_delete_operational_error(self, db_session):
        """Test delete method with OperationalError"""
        # Mock query to return a log
        mock_log = Mock()
        db_session.query.return_value.filter.return_value.first.return_value = mock_log
        db_session.commit.side_effect = OperationalError("statement", "params", "orig")
        
        with pytest.raises(OperationalError):
            LogCRUD.delete(db_session, 1)
        
        db_session.rollback.assert_called_once()
    
    def test_delete_sqlalchemy_error(self, db_session):
        """Test delete method with generic SQLAlchemyError"""
        # Mock query to return a log
        mock_log = Mock()
        db_session.query.return_value.filter.return_value.first.return_value = mock_log
        db_session.commit.side_effect = SQLAlchemyError("Generic error")
        
        with pytest.raises(SQLAlchemyError):
            LogCRUD.delete(db_session, 1)
        
        db_session.rollback.assert_called_once()


class TestValidatorEdgeCases:
    """Test validator edge cases and error conditions"""
    
    def test_validate_log_creation_missing_message_attribute(self):
        """Test validation with missing message attribute"""
        # Create a mock object without message attribute
        log_data = Mock(spec=[])  # Empty spec means no attributes
        log_data.severity = SeverityLevel.INFO
        log_data.source = "test"
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_creation(log_data)
        
        error = exc_info.value
        # Check the details dict instead of string representation
        assert "Message field is required" in str(error.details) if hasattr(error, 'details') else "Message field is required" in str(error)
    
    def test_validate_log_creation_message_none(self):
        """Test validation with None message"""
        # Pydantic will catch None values at creation time, so use a mock
        log_data = Mock()
        log_data.message = None
        log_data.severity = SeverityLevel.INFO
        log_data.source = "test"
        log_data.timestamp = None  # Add timestamp to avoid Mock comparison error
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_creation(log_data)
        
        error = exc_info.value
        assert "Message field is required" in str(error.details)
    
    def test_validate_log_creation_empty_message(self):
        """Test validation with empty message"""
        log_data = LogCreate(
            message="   ",  # Only whitespace
            severity=SeverityLevel.INFO,
            source="test"
        )
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_creation(log_data)
        
        error = exc_info.value
        assert "Message cannot be empty" in str(error.details)
    
    def test_validate_log_creation_message_too_long(self):
        """Test validation with too long message"""
        # Use Mock since Pydantic will prevent creating with too long string
        log_data = Mock()
        log_data.message = "x" * 10001  # 10001 characters
        log_data.severity = SeverityLevel.INFO
        log_data.source = "test"
        log_data.timestamp = None  # Add timestamp to avoid Mock comparison error
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_creation(log_data)
        
        error = exc_info.value
        assert "Message too long" in str(error.details)
    
    def test_validate_log_creation_missing_source_attribute(self):
        """Test validation with missing source attribute"""
        # Create a mock object without source attribute
        log_data = Mock()
        log_data.message = "test message"
        log_data.severity = SeverityLevel.INFO
        log_data.timestamp = None  # Add timestamp to avoid Mock comparison error
        
        # Remove the source attribute
        delattr(log_data, 'source') if hasattr(log_data, 'source') else None
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_creation(log_data)
        
        error = exc_info.value
        assert "Source field is required" in str(error.details)
    
    def test_validate_log_creation_source_none(self):
        """Test validation with None source"""
        # Use Mock since Pydantic prevents None values
        log_data = Mock()
        log_data.message = "test message"
        log_data.severity = SeverityLevel.INFO
        log_data.source = None
        log_data.timestamp = None
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_creation(log_data)
        
        error = exc_info.value
        assert "Source field is required" in str(error.details)
    
    def test_validate_log_creation_empty_source(self):
        """Test validation with empty source"""
        log_data = LogCreate(
            message="test message",
            severity=SeverityLevel.INFO,
            source="   "  # Only whitespace
        )
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_creation(log_data)
        
        error = exc_info.value
        assert "Source cannot be empty" in str(error.details)
    
    def test_validate_log_creation_source_too_long(self):
        """Test validation with too long source"""
        # Use Mock since Pydantic validates length at creation time
        log_data = Mock()
        log_data.message = "test message"
        log_data.severity = SeverityLevel.INFO
        log_data.source = "x" * 256  # 256 characters
        log_data.timestamp = None
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_creation(log_data)
        
        error = exc_info.value
        assert "Source too long" in str(error.details)
    
    def test_validate_log_creation_invalid_severity(self):
        """Test validation with invalid severity"""
        log_data = Mock()
        log_data.message = "test message"
        log_data.source = "test"
        log_data.severity = "INVALID_SEVERITY"
        log_data.timestamp = None
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_creation(log_data)
        
        error = exc_info.value
        assert "Must be one of:" in str(error.details)
    
    def test_validate_log_creation_future_timestamp_aware(self):
        """Test validation with future timestamp (timezone-aware)"""
        future_time = datetime.now(timezone.utc).replace(year=2030)
        
        log_data = Mock()
        log_data.message = "test message"
        log_data.source = "test"
        log_data.severity = SeverityLevel.INFO
        log_data.timestamp = future_time
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_creation(log_data)
        
        error = exc_info.value
        assert "Timestamp cannot be in the future" in str(error.details)
    
    def test_validate_log_creation_future_timestamp_naive(self):
        """Test validation with future timestamp (timezone-naive)"""
        future_time = datetime.now().replace(year=2030)
        
        log_data = Mock()
        log_data.message = "test message"
        log_data.source = "test"
        log_data.severity = SeverityLevel.INFO
        log_data.timestamp = future_time
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_creation(log_data)
        
        error = exc_info.value
        assert "Timestamp cannot be in the future" in str(error.details)
    
    def test_validate_log_update_negative_log_id(self):
        """Test log update validation with negative log ID"""
        log_update = LogUpdate(message="Updated message")
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_update(-1, log_update)
        
        error = exc_info.value
        assert "Log ID must be a positive integer" in str(error.details)
    
    def test_validate_log_update_empty_message(self):
        """Test log update validation with empty message"""
        log_update = LogUpdate(message="   ")  # Only whitespace
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_update(1, log_update)
        
        error = exc_info.value
        assert "Message cannot be empty" in str(error.details)
    
    def test_validate_log_update_message_too_long(self):
        """Test log update validation with too long message"""
        # Use Mock since Pydantic prevents creating objects with too long values
        log_update = Mock()
        log_update.message = "x" * 10001
        log_update.source = None
        log_update.severity = None
        log_update.timestamp = None
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_update(1, log_update)
        
        error = exc_info.value
        assert "Message too long" in str(error.details)
    
    def test_validate_log_update_empty_source(self):
        """Test log update validation with empty source"""
        log_update = LogUpdate(source="   ")  # Only whitespace
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_update(1, log_update)
        
        error = exc_info.value
        assert "Source cannot be empty" in str(error.details)
    
    def test_validate_log_update_source_too_long(self):
        """Test log update validation with too long source"""
        # Use Mock since Pydantic prevents creating objects with too long values
        log_update = Mock()
        log_update.message = None
        log_update.source = "x" * 256
        log_update.severity = None
        log_update.timestamp = None
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_update(1, log_update)
        
        error = exc_info.value
        assert "Source too long" in str(error.details)
    
    def test_validate_log_update_invalid_severity(self):
        """Test log update validation with invalid severity"""
        log_update = Mock()
        log_update.severity = "INVALID_SEVERITY"
        log_update.message = None
        log_update.source = None
        log_update.timestamp = None
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_update(1, log_update)
        
        error = exc_info.value
        assert "Must be one of:" in str(error.details)
    
    def test_validate_log_update_future_timestamp_aware(self):
        """Test log update validation with future timestamp (timezone-aware)"""
        future_time = datetime.now(timezone.utc).replace(year=2030)
        log_update = LogUpdate(timestamp=future_time)
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_update(1, log_update)
        
        error = exc_info.value
        assert "Timestamp cannot be in the future" in str(error.details)
    
    def test_validate_log_update_future_timestamp_naive(self):
        """Test log update validation with future timestamp (timezone-naive)"""
        future_time = datetime.now().replace(year=2030)
        log_update = LogUpdate(timestamp=future_time)
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_update(1, log_update)
        
        error = exc_info.value
        assert "Timestamp cannot be in the future" in str(error.details)
    
    def test_validate_log_query_params_invalid_page(self):
        """Test query params validation with invalid page"""
        with pytest.raises(ValidationError) as exc_info:
            validate_log_query_params(page=0, page_size=10)
        
        error = exc_info.value
        assert "Page number must be >= 1" in str(error.details)
    
    def test_validate_log_query_params_invalid_page_size(self):
        """Test query params validation with invalid page size"""
        with pytest.raises(ValidationError) as exc_info:
            validate_log_query_params(page=1, page_size=0)
        
        error = exc_info.value
        assert "Page size must be >= 1" in str(error.details)
    
    def test_validate_log_query_params_invalid_date_range(self):
        """Test query params validation with invalid date range"""
        start_date = datetime(2024, 1, 10)
        end_date = datetime(2024, 1, 5)  # Earlier than start_date
        
        with pytest.raises(ValidationError) as exc_info:
            validate_log_query_params(
                page=1, 
                page_size=10, 
                start_date=start_date, 
                end_date=end_date
            )
        
        error = exc_info.value
        assert "Start date must be before end date" in str(error.details)
    
    def test_validate_log_id_negative(self):
        """Test log ID validation with negative value"""
        with pytest.raises(ValidationError) as exc_info:
            validate_log_id(-1)
        
        error = exc_info.value
        assert "Log ID must be a positive integer" in str(error.details)
    
    def test_validate_log_id_zero(self):
        """Test log ID validation with zero value"""
        with pytest.raises(ValidationError) as exc_info:
            validate_log_id(0)
        
        error = exc_info.value
        assert "Log ID must be a positive integer" in str(error.details)


@pytest.fixture
def db_session():
    """Mock database session for testing"""
    session = Mock()
    session.add = Mock()
    session.commit = Mock()
    session.rollback = Mock()
    session.refresh = Mock()
    session.delete = Mock()
    session.query = Mock()
    return session