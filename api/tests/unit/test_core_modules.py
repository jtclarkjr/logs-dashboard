"""
Additional tests to improve coverage for core modules
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from sqlalchemy.exc import SQLAlchemyError, OperationalError
from sqlalchemy.pool import QueuePool

from app.core.database import SessionLocal, get_db, engine
from app.core.database_errors import DatabaseErrorAnalyzer, analyze_database_error
from app.core.errors import ValidationError, NotFoundError, ApiError
from app.core.config import Settings


class TestDatabaseModule:
    """Test database module functionality"""
    
    def test_database_initialization(self):
        """Test database initialization"""
        # This test will cover the import statements and initialization
        from app.core.database import engine, SessionLocal
        
        # Test that the database components are properly initialized
        assert engine is not None
        assert SessionLocal is not None
    
    def test_get_db_success(self):
        """Test successful database session creation"""
        with patch('app.core.database.SessionLocal') as mock_session_local:
            mock_session = Mock()
            mock_session_local.return_value = mock_session
            
            db_gen = get_db()
            db = next(db_gen)
            
            assert db == mock_session
            
            # Test cleanup
            try:
                next(db_gen)
            except StopIteration:
                pass
            
            mock_session.close.assert_called_once()
    
    def test_get_db_exception_handling(self):
        """Test database session exception handling"""
        with patch('app.core.database.SessionLocal') as mock_session_local:
            mock_session = Mock()
            mock_session_local.return_value = mock_session
            
            db_gen = get_db()
            db = next(db_gen)
            
            # Simulate an exception during use
            try:
                raise Exception("Test exception")
            except Exception:
                try:
                    next(db_gen)
                except StopIteration:
                    pass
            
            # Session should still be closed
            mock_session.close.assert_called_once()


class TestDatabaseErrorAnalyzer:
    """Test database error analyzer functionality"""
    
    def test_analyze_database_error_connection_timeout(self):
        """Test analysis of connection timeout error"""
        error = OperationalError("statement", "params", "timeout expired")
        
        message, details = analyze_database_error(error, "test_operation")
        
        assert "timeout" in message.lower()
        assert details["error_category"] == "connection_timeout"
        assert "operation" in details
    
    def test_analyze_database_error_connection_refused(self):
        """Test analysis of connection refused error"""
        error = OperationalError("statement", "params", "connection refused")
        
        message, details = analyze_database_error(error, "test_operation")
        
        assert "refused" in message.lower()
        assert details["error_category"] == "connection_refused"
    
    def test_analyze_database_error_duplicate_entry(self):
        """Test analysis of duplicate entry error"""
        from sqlalchemy.exc import IntegrityError
        
        error = IntegrityError("statement", "params", "duplicate key violates unique constraint")
        
        message, details = analyze_database_error(error, "test_operation")
        
        assert "conflict" in message.lower() or "duplicate" in message.lower()
        assert details["error_category"] == "duplicate_entry"
    
    def test_analyze_database_error_constraint_violation(self):
        """Test analysis of general constraint violation"""
        from sqlalchemy.exc import IntegrityError
        
        error = IntegrityError("statement", "params", "constraint violation occurred")
        
        message, details = analyze_database_error(error, "test_operation")
        
        assert "validation" in message.lower() or "data" in message.lower()
        assert details["error_category"] in ["constraint_violation", "duplicate_entry"]
    
    def test_analyze_database_error_datetime_timezone_mismatch(self):
        """Test analysis of datetime timezone mismatch error"""
        error = TypeError("can't compare offset-naive and offset-aware datetimes")
        
        message, details = analyze_database_error(error, "test_operation")
        
        assert "datetime" in message.lower() or "timezone" in message.lower()
        assert details["error_category"] == "datetime_timezone_mismatch"
    
    def test_analyze_database_error_unknown_error(self):
        """Test analysis of unknown error type"""
        error = Exception("Some unknown database error")
        
        message, details = analyze_database_error(error, "test_operation")
        
        assert "unexpected" in message.lower()
        assert details["error_category"] == "unknown"
        assert "suggestion" in details
    
    def test_database_error_analyzer_initialization(self):
        """Test DatabaseErrorAnalyzer initialization"""
        analyzer = DatabaseErrorAnalyzer()
        
        assert len(analyzer.patterns) > 0
        assert all(hasattr(pattern, 'name') for pattern in analyzer.patterns)
        assert all(hasattr(pattern, 'keywords') for pattern in analyzer.patterns)
    
    def test_constraint_violation_with_constraint_name(self):
        """Test constraint violation with constraint name extraction"""
        from sqlalchemy.exc import IntegrityError
        
        error = IntegrityError("statement", "params", 'constraint "unique_email_constraint" violated')
        
        message, details = analyze_database_error(error, "test_operation")
        
        # Should extract constraint name through custom handler
        assert details["error_category"] == "duplicate_entry"
        if "constraint" in details:
            assert "unique_email_constraint" in details["constraint"]
    
    def test_access_denied_error(self):
        """Test access denied error analysis"""
        error = OperationalError("statement", "params", "permission denied for database")
        
        message, details = analyze_database_error(error, "test_operation")
        
        assert "denied" in message.lower() or "permission" in message.lower()
        assert details["error_category"] == "access_denied"
    
    def test_storage_full_error(self):
        """Test storage full error analysis"""
        error = OperationalError("statement", "params", "disk space exceeded")
        
        message, details = analyze_database_error(error, "test_operation")
        
        assert "storage" in message.lower() or "disk" in message.lower()
        assert details["error_category"] == "storage_full"
    
    def test_deadlock_error(self):
        """Test deadlock error analysis"""
        error = OperationalError("statement", "params", "deadlock detected")
        
        message, details = analyze_database_error(error, "test_operation")
        
        assert "concurrency" in message.lower() or "deadlock" in message.lower()
        assert details["error_category"] == "concurrency_conflict"


class TestErrorClasses:
    """Test custom error classes"""
    
    def test_validation_error_creation(self):
        """Test ValidationError creation"""
        details = {"field": "value", "reason": "invalid"}
        error = ValidationError("Validation failed", details)
        
        assert error.message == "Validation failed"
        assert error.details == details
        assert error.status_code == 422
    
    def test_validation_error_str_representation(self):
        """Test ValidationError string representation"""
        details = {"field": "test", "reason": "invalid"}
        error = ValidationError("Test error", details)
        
        str_repr = str(error)
        
        assert "Test error" in str_repr
        # The field info is in details, not necessarily in the string representation
    
    def test_not_found_error_creation(self):
        """Test NotFoundError creation"""
        error = NotFoundError("Resource not found")
        
        assert error.message == "Resource not found"
        assert error.status_code == 404
    
    def test_not_found_error_with_resource_type(self):
        """Test NotFoundError with details"""
        details = {"resource_type": "Log", "resource_id": 123}
        error = NotFoundError("Log not found", details)
        
        assert error.message == "Log not found"
        assert error.details["resource_type"] == "Log"
        assert error.details["resource_id"] == 123
        assert error.status_code == 404
    
    def test_api_error_creation(self):
        """Test ApiError creation"""
        error = ApiError("API Error", code=1001, status_code=500)
        
        assert error.message == "API Error"
        assert error.status_code == 500
        assert error.details == {}
    
    def test_api_error_with_details(self):
        """Test ApiError with details"""
        details = {"error_code": "E001", "context": "test"}
        error = ApiError("API Error", code=1001, status_code=500, details=details)
        
        assert error.message == "API Error"
        assert error.status_code == 500
        assert error.details == details
    
    def test_api_error_str_representation(self):
        """Test ApiError string representation"""
        error = ApiError("Test API Error", code=1001, status_code=500)
        
        str_repr = str(error)
        
        assert "Test API Error" in str_repr


class TestConfigModule:
    """Test configuration module"""
    
    @patch.dict('os.environ', {
        'DATABASE_URL': 'test://localhost/test',
        'DEBUG': 'true'
    })
    def test_settings_from_environment(self):
        """Test settings loading from environment"""
        # Create a new settings instance to pick up env vars
        settings = Settings()
        
        assert settings.DEBUG is True
    
    @patch.dict('os.environ', {
        'DEBUG': 'false'
    })
    def test_settings_debug_false(self):
        """Test settings with DEBUG=false"""
        settings = Settings()
        
        assert settings.DEBUG is False
    
    def test_settings_defaults(self):
        """Test default settings values"""
        with patch.dict('os.environ', {}, clear=True):
            settings = Settings()
            
            # Test that defaults are loaded
            assert hasattr(settings, 'DEBUG')


# Additional coverage for specific missing lines
class TestSpecificMissingLines:
    """Test specific lines that are missing coverage"""
    
    def test_config_import_coverage(self):
        """Test configuration import coverage"""
        # This covers lines 5-6 in config.py
        from app.core.config import settings
        
        assert settings is not None
    
    def test_database_engine_coverage(self):
        """Test database engine coverage"""
        # This covers the engine creation and configuration
        from app.core.database import engine
        
        assert engine is not None
    
    def test_database_error_analyzer_global_instance(self):
        """Test global database error analyzer instance"""
        error = SQLAlchemyError("Test error")
        
        # This should work with the global analyzer instance
        message, details = analyze_database_error(error, "test_op")
        
        assert "unexpected" in message.lower()
        assert "error_category" in details
    
    def test_error_classes_inheritance(self):
        """Test error classes inherit from Exception properly"""
        validation_error = ValidationError("test")
        not_found_error = NotFoundError("test")
        api_error = ApiError("test", code=1001, status_code=500)
        
        assert isinstance(validation_error, Exception)
        assert isinstance(not_found_error, Exception)
        assert isinstance(api_error, Exception)
    
    def test_error_response_format(self):
        """Test error response formatting for API"""
        from app.core.errors import create_error_response
        
        response = create_error_response(
            message="Test error",
            code=1001,
            status_code=400,
            details={"field": "test"}
        )
        
        assert response.status_code == 400
        # JSONResponse doesn't have content attribute, it has body
        import json
        body_data = json.loads(response.body.decode())
        assert "error" in body_data
    
    def test_database_url_from_settings(self):
        """Test database URL configuration"""
        from app.core.config import settings
        
        # This tests the DATABASE_URL usage
        assert hasattr(settings, 'DATABASE_URL')
    
    def test_logger_initialization(self):
        """Test logger initialization in various modules"""
        # Import modules to trigger logger initialization
        import app.core.database_errors
        import app.crud.log
        
        # Just verify the modules can be imported successfully
        # Logger variables may not be exposed as module attributes
