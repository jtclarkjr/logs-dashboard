"""
Tests for logs create endpoint.
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime

from app.models.log import SeverityLevel
from tests.conftest import TestData


class TestLogCreate:
    """Test cases for creating log entries."""
    
    def test_create_log_success(self, test_client: TestClient):
        """Test successful log creation."""
        log_data = {
            "message": "Test log message",
            "severity": SeverityLevel.INFO.value,
            "source": "test-service"
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        
        assert response.status_code == 201
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert "message" in data
        assert "severity" in data
        assert "source" in data
        assert "timestamp" in data
        assert "created_at" in data
        assert "updated_at" in data
        
        # Verify values
        assert data["message"] == log_data["message"]
        assert data["severity"] == log_data["severity"]
        assert data["source"] == log_data["source"]
        assert isinstance(data["id"], int)
    
    def test_create_log_with_timestamp(self, test_client: TestClient):
        """Test creating log with custom timestamp."""
        custom_timestamp = "2023-12-01T10:00:00"
        log_data = {
            "message": "Test log with timestamp",
            "severity": SeverityLevel.WARNING.value,
            "source": "test-service",
            "timestamp": custom_timestamp
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        
        assert response.status_code == 201
        data = response.json()
        
        # Should use provided timestamp
        assert custom_timestamp in data["timestamp"]
    
    def test_create_log_without_timestamp(self, test_client: TestClient):
        """Test creating log without timestamp (should use current time)."""
        log_data = {
            "message": "Test log without timestamp",
            "severity": SeverityLevel.ERROR.value,
            "source": "test-service"
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        
        assert response.status_code == 201
        data = response.json()
        
        # Should have timestamp assigned
        assert "timestamp" in data
        assert data["timestamp"] is not None
    
    def test_create_log_all_severity_levels(self, test_client: TestClient):
        """Test creating logs with all severity levels."""
        for severity in SeverityLevel:
            log_data = {
                "message": f"Test {severity.value} log",
                "severity": severity.value,
                "source": f"{severity.value.lower()}-service"
            }
            
            response = test_client.post("/api/v1/logs/", json=log_data)
            
            assert response.status_code == 201
            data = response.json()
            assert data["severity"] == severity.value
    
    def test_create_log_max_length_fields(self, test_client: TestClient):
        """Test creating log with maximum length fields."""
        log_data = {
            "message": TestData.LONG_LOG_MESSAGE,  # 999 chars
            "severity": SeverityLevel.INFO.value,
            "source": TestData.LONG_SOURCE  # 99 chars
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == TestData.LONG_LOG_MESSAGE
        assert data["source"] == TestData.LONG_SOURCE


class TestLogCreateValidation:
    """Test validation for log creation."""
    
    def test_create_log_missing_required_fields(self, test_client: TestClient):
        """Test creating log with missing required fields."""
        # Missing message
        response = test_client.post("/api/v1/logs/", json={
            "severity": SeverityLevel.INFO.value,
            "source": "test-service"
        })
        assert response.status_code == 422
        
        # Missing severity
        response = test_client.post("/api/v1/logs/", json={
            "message": "Test message",
            "source": "test-service"
        })
        assert response.status_code == 422
        
        # Missing source
        response = test_client.post("/api/v1/logs/", json={
            "message": "Test message",
            "severity": SeverityLevel.INFO.value
        })
        assert response.status_code == 422
    
    def test_create_log_invalid_severity(self, test_client: TestClient):
        """Test creating log with invalid severity level."""
        log_data = {
            "message": "Test log message",
            "severity": TestData.INVALID_SEVERITY,
            "source": "test-service"
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        assert response.status_code == 422
    
    def test_create_log_empty_message(self, test_client: TestClient):
        """Test creating log with empty message."""
        log_data = {
            "message": "",
            "severity": SeverityLevel.INFO.value,
            "source": "test-service"
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        assert response.status_code == 422
    
    def test_create_log_empty_source(self, test_client: TestClient):
        """Test creating log with empty source."""
        log_data = {
            "message": "Test message",
            "severity": SeverityLevel.INFO.value,
            "source": ""
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        assert response.status_code == 422
    
    def test_create_log_message_too_long(self, test_client: TestClient):
        """Test creating log with message that's too long."""
        log_data = {
            "message": TestData.INVALID_LONG_MESSAGE,  # 1001 chars
            "severity": SeverityLevel.INFO.value,
            "source": "test-service"
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        assert response.status_code == 422
    
    def test_create_log_source_too_long(self, test_client: TestClient):
        """Test creating log with source that's too long."""
        log_data = {
            "message": "Test message",
            "severity": SeverityLevel.INFO.value,
            "source": TestData.INVALID_LONG_SOURCE  # 101 chars
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        assert response.status_code == 422
    
    def test_create_log_invalid_timestamp_format(self, test_client: TestClient):
        """Test creating log with invalid timestamp format."""
        log_data = {
            "message": "Test message",
            "severity": SeverityLevel.INFO.value,
            "source": "test-service",
            "timestamp": "invalid-timestamp"
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        assert response.status_code == 422
    
    def test_create_log_null_values(self, test_client: TestClient):
        """Test creating log with null values for required fields."""
        log_data = {
            "message": None,
            "severity": SeverityLevel.INFO.value,
            "source": "test-service"
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        assert response.status_code == 422
    
    def test_create_log_wrong_data_types(self, test_client: TestClient):
        """Test creating log with wrong data types."""
        # Integer instead of string for message
        log_data = {
            "message": 12345,
            "severity": SeverityLevel.INFO.value,
            "source": "test-service"
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        assert response.status_code == 422
    
    def test_create_log_malformed_json(self, test_client: TestClient):
        """Test creating log with malformed JSON."""
        # Intentionally malformed JSON (missing closing brace)
        malformed_json = (
            '{"message": "test", "severity": "INFO", "source": "test"'
        )
        
        response = test_client.post(
            "/api/v1/logs/",
            data=malformed_json,  # noqa: E501
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422


class TestLogCreateEdgeCases:
    """Test edge cases for log creation."""
    
    def test_create_multiple_logs_rapid_succession(self, test_client: TestClient):
        """Test creating multiple logs in rapid succession."""
        created_logs = []
        
        for i in range(5):
            log_data = {
                "message": f"Rapid log {i}",
                "severity": SeverityLevel.INFO.value,
                "source": f"rapid-service-{i}"
            }
            
            response = test_client.post("/api/v1/logs/", json=log_data)
            assert response.status_code == 201
            created_logs.append(response.json())
        
        # All logs should have unique IDs
        ids = [log["id"] for log in created_logs]
        assert len(set(ids)) == 5
    
    def test_create_log_with_unicode_characters(self, test_client: TestClient):
        """Test creating log with unicode characters."""
        log_data = {
            "message": "Test log with unicode: 🚀 ñ é ü 中文",
            "severity": SeverityLevel.INFO.value,
            "source": "unicode-service"
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == log_data["message"]
    
    def test_create_log_with_special_characters(self, test_client: TestClient):
        """Test creating log with special characters."""
        log_data = {
            "message": "Test log with special chars: !@#$%^&*()[]{}|;:,.<>?",
            "severity": SeverityLevel.INFO.value,
            "source": "special-service"
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == log_data["message"]
    
    def test_create_log_boundary_values(self, test_client: TestClient):
        """Test creating log with boundary values."""
        # Minimum valid message (1 character)
        log_data = {
            "message": "a",
            "severity": SeverityLevel.INFO.value,
            "source": "b"  # Minimum valid source (1 character)
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "a"
        assert data["source"] == "b"
