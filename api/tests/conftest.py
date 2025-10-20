"""
Test configuration and fixtures for the logs dashboard API tests.
"""
import os
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta

from main import app
from app.core.database import get_db, Base
from app.models.log import SeverityLevel
from app.schemas.log import LogCreate


# Test database URL - PostgreSQL
_database_url = os.getenv("DATABASE_URL")
if not _database_url:
    raise ValueError("DATABASE_URL environment variable must be set for testing")

TEST_DATABASE_URL: str = _database_url


@pytest.fixture(scope="session")
def test_engine():
    """Create test database engine."""
    # PostgreSQL connection
    engine = create_engine(TEST_DATABASE_URL)
    return engine


@pytest.fixture(scope="session")
def test_session_factory(test_engine):
    """Create test session factory."""
    return sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def test_db_session(test_engine, test_session_factory) -> Generator[Session, None, None]:
    """
    Create a fresh database session for each test.
    Rollback all changes after each test.
    """
    # Create tables
    Base.metadata.create_all(bind=test_engine)
    
    # Create session
    session = test_session_factory()
    
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def test_client(test_db_session: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with dependency override for database session.
    """
    def override_get_db():
        try:
            yield test_db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_log_data() -> dict:
    """Sample log data for testing."""
    return {
        "message": "Test log message",
        "severity": SeverityLevel.INFO,
        "source": "test-service",
        "timestamp": datetime.now()
    }


@pytest.fixture
def sample_log_create_data() -> LogCreate:
    """Sample LogCreate object for testing."""
    return LogCreate(
        message="Test log message for creation",
        severity=SeverityLevel.INFO,
        source="test-service-create",
        timestamp=datetime.now()
    )


@pytest.fixture
def multiple_sample_logs() -> list[dict]:
    """Multiple sample logs with different severity levels and sources."""
    base_time = datetime.now()
    return [
        {
            "message": "Debug message for testing",
            "severity": SeverityLevel.DEBUG,
            "source": "debug-service",
            "timestamp": base_time - timedelta(hours=1)
        },
        {
            "message": "Info message for testing",
            "severity": SeverityLevel.INFO,
            "source": "info-service",
            "timestamp": base_time - timedelta(minutes=30)
        },
        {
            "message": "Warning message for testing",
            "severity": SeverityLevel.WARNING,
            "source": "warning-service",
            "timestamp": base_time - timedelta(minutes=15)
        },
        {
            "message": "Error message for testing",
            "severity": SeverityLevel.ERROR,
            "source": "error-service",
            "timestamp": base_time - timedelta(minutes=5)
        },
        {
            "message": "Critical message for testing",
            "severity": SeverityLevel.CRITICAL,
            "source": "critical-service",
            "timestamp": base_time
        }
    ]


@pytest.fixture
def create_sample_logs(test_db_session: Session, multiple_sample_logs: list[dict]):
    """Create sample logs in the database for testing."""
    from app.crud.log import log_crud
    
    created_logs = []
    for log_data in multiple_sample_logs:
        log_create = LogCreate(**log_data)
        created_log = log_crud.create(db=test_db_session, log_data=log_create)
        created_logs.append(created_log)
    
    test_db_session.commit()
    return created_logs


@pytest.fixture
def auth_headers() -> dict:
    """Sample authentication headers if needed."""
    return {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }


# Test data constants
class TestData:
    """Constants for test data."""
    
    VALID_LOG_MESSAGE = "Test log message"
    LONG_LOG_MESSAGE = "A" * 999  # Just under the 1000 char limit
    INVALID_LONG_MESSAGE = "A" * 1001  # Over the limit
    
    VALID_SOURCE = "test-service"
    LONG_SOURCE = "A" * 99  # Just under the 100 char limit  
    INVALID_LONG_SOURCE = "A" * 101  # Over the limit
    
    SEVERITIES = [
        SeverityLevel.DEBUG,
        SeverityLevel.INFO,
        SeverityLevel.WARNING,
        SeverityLevel.ERROR,
        SeverityLevel.CRITICAL
    ]
    
    INVALID_SEVERITY = "INVALID"
    
    PAGINATION_DEFAULTS = {
        "page": 1,
        "page_size": 50
    }


# Cleanup function for tests
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    """Clean up test database after all tests."""
    yield
