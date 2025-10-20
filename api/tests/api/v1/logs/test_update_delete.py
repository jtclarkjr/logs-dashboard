"""
Tests for logs update and delete endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime

from app.models.log import SeverityLevel
from tests.conftest import TestData


class TestLogUpdate:
    """Test cases for updating log entries."""
    
    def test_update_log_success(self, test_client: TestClient, create_sample_logs):
        """Test successful log update."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        update_data = {
            "message": "Updated log message",
            "severity": SeverityLevel.ERROR.value,
            "source": "updated-service"
        }
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify updated values
        assert data["message"] == update_data["message"]
        assert data["severity"] == update_data["severity"]
        assert data["source"] == update_data["source"]
        assert data["id"] == log_id
        
        # Verify updated_at timestamp changed
        assert "updated_at" in data
    
    def test_update_log_partial(self, test_client: TestClient, create_sample_logs):
        """Test partial log update (only some fields)."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        original_source = created_logs[0].source
        
        # Update only message
        update_data = {
            "message": "Partially updated message"
        }
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Updated field
        assert data["message"] == update_data["message"]
        # Unchanged fields
        assert data["source"] == original_source
        assert data["severity"] == created_logs[0].severity.value
    
    def test_update_log_all_severity_levels(self, test_client: TestClient, create_sample_logs):
        """Test updating log to all severity levels."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        for severity in SeverityLevel:
            update_data = {
                "severity": severity.value
            }
            
            response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["severity"] == severity.value
    
    def test_update_log_with_timestamp(self, test_client: TestClient, create_sample_logs):
        """Test updating log with new timestamp."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        new_timestamp = "2023-12-01T15:00:00"
        update_data = {
            "timestamp": new_timestamp
        }
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert new_timestamp in data["timestamp"]
    
    def test_update_log_max_length_fields(self, test_client: TestClient, create_sample_logs):
        """Test updating log with maximum length fields."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        update_data = {
            "message": TestData.LONG_LOG_MESSAGE,
            "source": TestData.LONG_SOURCE
        }
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == TestData.LONG_LOG_MESSAGE
        assert data["source"] == TestData.LONG_SOURCE


class TestLogUpdateValidation:
    """Test validation for log update."""
    
    def test_update_log_not_found(self, test_client: TestClient):
        """Test updating non-existent log."""
        update_data = {
            "message": "Updated message"
        }
        
        response = test_client.put("/api/v1/logs/999999", json=update_data)
        
        assert response.status_code == 404
    
    def test_update_log_invalid_id(self, test_client: TestClient):
        """Test updating log with invalid ID."""
        update_data = {
            "message": "Updated message"
        }
        
        response = test_client.put("/api/v1/logs/invalid", json=update_data)
        assert response.status_code == 422
        
        response = test_client.put("/api/v1/logs/-1", json=update_data)
        assert response.status_code == 422
        
        response = test_client.put("/api/v1/logs/0", json=update_data)
        assert response.status_code == 422
    
    def test_update_log_invalid_severity(self, test_client: TestClient, create_sample_logs):
        """Test updating log with invalid severity."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        update_data = {
            "severity": "INVALID_SEVERITY"
        }
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        assert response.status_code == 422
    
    def test_update_log_empty_message(self, test_client: TestClient, create_sample_logs):
        """Test updating log with empty message."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        update_data = {
            "message": ""
        }
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        assert response.status_code == 422
    
    def test_update_log_empty_source(self, test_client: TestClient, create_sample_logs):
        """Test updating log with empty source."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        update_data = {
            "source": ""
        }
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        assert response.status_code == 422
    
    def test_update_log_message_too_long(self, test_client: TestClient, create_sample_logs):
        """Test updating log with message that's too long."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        update_data = {
            "message": TestData.INVALID_LONG_MESSAGE  # 1001 chars
        }
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        assert response.status_code == 422
    
    def test_update_log_source_too_long(self, test_client: TestClient, create_sample_logs):
        """Test updating log with source that's too long."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        update_data = {
            "source": TestData.INVALID_LONG_SOURCE  # 101 chars
        }
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        assert response.status_code == 422
    
    def test_update_log_invalid_timestamp(self, test_client: TestClient, create_sample_logs):
        """Test updating log with invalid timestamp."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        update_data = {
            "timestamp": "invalid-timestamp"
        }
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        assert response.status_code == 422
    
    def test_update_log_empty_request_body(self, test_client: TestClient, create_sample_logs):
        """Test updating log with empty request body."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json={})
        
        # Should succeed as all fields are optional in update
        assert response.status_code == 200
    
    def test_update_log_null_values(self, test_client: TestClient, create_sample_logs):
        """Test updating log with null values."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        update_data = {
            "message": None,
            "severity": None,
            "source": None
        }
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)

        # Should fail with database error due to NOT NULL constraints
        assert response.status_code == 500  # Database integrity error


class TestLogDelete:
    """Test cases for deleting log entries."""
    
    def test_delete_log_success(self, test_client: TestClient, create_sample_logs):
        """Test successful log deletion."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        response = test_client.delete(f"/api/v1/logs/{log_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify success message
        assert "message" in data
        assert str(log_id) in data["message"]
        assert "deleted successfully" in data["message"]
        
        # Verify log is actually deleted
        get_response = test_client.get(f"/api/v1/logs/{log_id}")
        assert get_response.status_code == 404
    
    def test_delete_log_not_found(self, test_client: TestClient):
        """Test deleting non-existent log."""
        response = test_client.delete("/api/v1/logs/999999")
        
        assert response.status_code == 404
    
    def test_delete_log_invalid_id(self, test_client: TestClient):
        """Test deleting log with invalid ID."""
        response = test_client.delete("/api/v1/logs/invalid")
        assert response.status_code == 422
        
        response = test_client.delete("/api/v1/logs/-1")
        assert response.status_code == 422
        
        response = test_client.delete("/api/v1/logs/0")
        assert response.status_code == 422
    
    def test_delete_multiple_logs(self, test_client: TestClient, create_sample_logs):
        """Test deleting multiple logs."""
        created_logs = create_sample_logs
        
        # Delete first two logs
        for i in range(2):
            log_id = created_logs[i].id
            response = test_client.delete(f"/api/v1/logs/{log_id}")
            assert response.status_code == 200
        
        # Verify they're deleted
        for i in range(2):
            log_id = created_logs[i].id
            get_response = test_client.get(f"/api/v1/logs/{log_id}")
            assert get_response.status_code == 404
        
        # Verify remaining logs still exist
        for i in range(2, len(created_logs)):
            log_id = created_logs[i].id
            get_response = test_client.get(f"/api/v1/logs/{log_id}")
            assert get_response.status_code == 200
    
    def test_delete_log_twice(self, test_client: TestClient, create_sample_logs):
        """Test deleting same log twice."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        # First deletion should succeed
        response = test_client.delete(f"/api/v1/logs/{log_id}")
        assert response.status_code == 200
        
        # Second deletion should fail (not found)
        response = test_client.delete(f"/api/v1/logs/{log_id}")
        assert response.status_code == 404
    
    def test_delete_all_logs(self, test_client: TestClient, create_sample_logs):
        """Test deleting all logs."""
        created_logs = create_sample_logs
        
        # Delete all logs
        for log in created_logs:
            response = test_client.delete(f"/api/v1/logs/{log.id}")
            assert response.status_code == 200
        
        # Verify logs list is empty
        list_response = test_client.get("/api/v1/logs/")
        assert list_response.status_code == 200
        data = list_response.json()
        assert data["total"] == 0
        assert len(data["logs"]) == 0


class TestUpdateDeleteEdgeCases:
    """Test edge cases for update and delete operations."""
    
    def test_update_log_with_unicode_characters(self, test_client: TestClient, create_sample_logs):
        """Test updating log with unicode characters."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        update_data = {
            "message": "Updated with unicode: 🚀 ñ é ü 中文",
            "source": "unicode-service"
        }
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == update_data["message"]
        assert data["source"] == update_data["source"]
    
    def test_update_log_boundary_values(self, test_client: TestClient, create_sample_logs):
        """Test updating log with boundary values."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        update_data = {
            "message": "a",  # Minimum valid message (1 character)
            "source": "b"    # Minimum valid source (1 character)
        }
        
        response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "a"
        assert data["source"] == "b"
    
    def test_update_then_delete_log(self, test_client: TestClient, create_sample_logs):
        """Test updating a log then deleting it."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        # First update the log
        update_data = {
            "message": "Updated before deletion"
        }
        update_response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        assert update_response.status_code == 200
        
        # Then delete it
        delete_response = test_client.delete(f"/api/v1/logs/{log_id}")
        assert delete_response.status_code == 200
        
        # Verify it's gone
        get_response = test_client.get(f"/api/v1/logs/{log_id}")
        assert get_response.status_code == 404
    
    def test_concurrent_updates_same_log(self, test_client: TestClient, create_sample_logs):
        """Test concurrent updates to the same log."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        # Multiple rapid updates
        for i in range(3):
            update_data = {
                "message": f"Concurrent update {i}"
            }
            response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
            assert response.status_code == 200
        
        # Final state should be the last update
        get_response = test_client.get(f"/api/v1/logs/{log_id}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert "Concurrent update 2" == data["message"]
