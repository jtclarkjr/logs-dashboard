"""
Tests for logs read endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

from app.models.log import SeverityLevel
from tests.conftest import TestData


class TestLogsList:
    """Test cases for listing logs."""
    
    def test_get_logs_empty_database(self, test_client: TestClient):
        """Test getting logs from empty database."""
        response = test_client.get("/api/v1/logs")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "logs" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert "total_pages" in data
        
        # Verify empty results
        assert data["logs"] == []
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["page_size"] == 50  # Default page size
        assert data["total_pages"] == 1
    
    def test_get_logs_with_data(self, test_client: TestClient, create_sample_logs):
        """Test getting logs with existing data."""
        response = test_client.get("/api/v1/logs")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have 5 logs from fixture
        assert len(data["logs"]) == 5
        assert data["total"] == 5
        assert data["page"] == 1
        assert data["total_pages"] == 1
        
        # Verify log structure
        log = data["logs"][0]
        expected_fields = {"id", "message", "severity", "source", "timestamp", "created_at", "updated_at"}
        assert set(log.keys()) == expected_fields
    
    def test_get_logs_pagination(self, test_client: TestClient, create_sample_logs):
        """Test logs pagination."""
        # Test first page with page_size=2
        response = test_client.get("/api/v1/logs/?page=1&page_size=2")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["logs"]) == 2
        assert data["total"] == 5
        assert data["page"] == 1
        assert data["page_size"] == 2
        assert data["total_pages"] == 3  # 5 logs / 2 per page = 3 pages
        
        # Test second page
        response = test_client.get("/api/v1/logs/?page=2&page_size=2")
        data = response.json()
        
        assert len(data["logs"]) == 2
        assert data["page"] == 2
        
        # Test last page
        response = test_client.get("/api/v1/logs/?page=3&page_size=2")
        data = response.json()
        
        assert len(data["logs"]) == 1  # Only 1 log on last page
        assert data["page"] == 3
    
    def test_get_logs_filter_by_severity(self, test_client: TestClient, create_sample_logs):
        """Test filtering logs by severity level."""
        response = test_client.get(f"/api/v1/logs/?severity={SeverityLevel.ERROR.value}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have only ERROR logs
        assert len(data["logs"]) == 1
        assert data["logs"][0]["severity"] == SeverityLevel.ERROR.value
    
    def test_get_logs_filter_by_source(self, test_client: TestClient, create_sample_logs):
        """Test filtering logs by source."""
        response = test_client.get("/api/v1/logs/?source=info-service")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have only logs from info-service
        assert len(data["logs"]) == 1
        assert data["logs"][0]["source"] == "info-service"
    
    def test_get_logs_search_in_message(self, test_client: TestClient, create_sample_logs):
        """Test searching logs by message content."""
        response = test_client.get("/api/v1/logs/?search=Warning")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should find logs containing "Warning"
        assert len(data["logs"]) >= 1
        for log in data["logs"]:
            assert "Warning" in log["message"] or "warning" in log["message"].lower()
    
    def test_get_logs_date_range_filter(self, test_client: TestClient, create_sample_logs):
        """Test filtering logs by date range."""
        # Get logs from the last hour
        now = datetime.now()
        start_date = (now - timedelta(hours=2)).isoformat()
        end_date = now.isoformat()
        
        response = test_client.get(f"/api/v1/logs/?start_date={start_date}&end_date={end_date}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should return logs within the date range
        assert len(data["logs"]) >= 1
    
    def test_get_logs_sorting(self, test_client: TestClient, create_sample_logs):
        """Test sorting logs."""
        # Sort by timestamp ascending
        response = test_client.get("/api/v1/logs/?sort_by=timestamp&sort_order=asc")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify ascending order (oldest first)
        timestamps = [log["timestamp"] for log in data["logs"]]
        assert timestamps == sorted(timestamps)
        
        # Sort by severity descending
        response = test_client.get("/api/v1/logs/?sort_by=severity&sort_order=desc")
        
        assert response.status_code == 200
    
    def test_get_logs_combined_filters(self, test_client: TestClient, create_sample_logs):
        """Test combining multiple filters."""
        response = test_client.get(
            f"/api/v1/logs/?severity={SeverityLevel.INFO.value}&page_size=10&sort_order=desc"
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned logs should match the severity filter
        for log in data["logs"]:
            assert log["severity"] == SeverityLevel.INFO.value


class TestLogsListValidation:
    """Test validation for logs list endpoint."""
    
    def test_get_logs_invalid_page(self, test_client: TestClient):
        """Test invalid page parameter."""
        response = test_client.get("/api/v1/logs/?page=0")
        assert response.status_code == 422
        
        response = test_client.get("/api/v1/logs/?page=-1")
        assert response.status_code == 422
    
    def test_get_logs_invalid_page_size(self, test_client: TestClient):
        """Test invalid page_size parameter."""
        response = test_client.get("/api/v1/logs/?page_size=0")
        assert response.status_code == 422
        
        response = test_client.get("/api/v1/logs/?page_size=1001")  # Over MAX_PAGE_SIZE
        assert response.status_code == 422
    
    def test_get_logs_invalid_severity(self, test_client: TestClient):
        """Test invalid severity parameter."""
        response = test_client.get("/api/v1/logs/?severity=INVALID")
        assert response.status_code == 422
    
    def test_get_logs_invalid_sort_order(self, test_client: TestClient):
        """Test invalid sort_order parameter."""
        response = test_client.get("/api/v1/logs/?sort_order=invalid")
        assert response.status_code == 422
    
    def test_get_logs_invalid_date_format(self, test_client: TestClient):
        """Test invalid date format."""
        response = test_client.get("/api/v1/logs/?start_date=invalid-date")
        assert response.status_code == 422
    
    def test_get_logs_invalid_date_range(self, test_client: TestClient):
        """Test invalid date range (start after end)."""
        start_date = "2023-12-01T10:00:00"
        end_date = "2023-11-01T10:00:00"  # Before start date
        
        response = test_client.get(f"/api/v1/logs/?start_date={start_date}&end_date={end_date}")
        assert response.status_code == 422


class TestGetLogById:
    """Test cases for getting single log by ID."""
    
    def test_get_log_by_id_success(self, test_client: TestClient, create_sample_logs):
        """Test successfully getting a log by ID."""
        created_logs = create_sample_logs
        log_id = created_logs[0].id
        
        response = test_client.get(f"/api/v1/logs/{log_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure and values
        assert data["id"] == log_id
        expected_fields = {"id", "message", "severity", "source", "timestamp", "created_at", "updated_at"}
        assert set(data.keys()) == expected_fields
    
    def test_get_log_by_id_not_found(self, test_client: TestClient):
        """Test getting non-existent log by ID."""
        response = test_client.get("/api/v1/logs/999999")
        
        assert response.status_code == 404
    
    def test_get_log_by_invalid_id(self, test_client: TestClient):
        """Test getting log with invalid ID format."""
        response = test_client.get("/api/v1/logs/invalid")
        assert response.status_code == 422
        
        response = test_client.get("/api/v1/logs/-1")
        assert response.status_code == 422
        
        response = test_client.get("/api/v1/logs/0")
        assert response.status_code == 422
    
    def test_get_all_created_logs_by_id(self, test_client: TestClient, create_sample_logs):
        """Test getting each created log by its ID."""
        created_logs = create_sample_logs
        
        for created_log in created_logs:
            response = test_client.get(f"/api/v1/logs/{created_log.id}")
            
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == created_log.id
            assert data["message"] == created_log.message
            assert data["severity"] == created_log.severity.value
            assert data["source"] == created_log.source


class TestLogsReadEdgeCases:
    """Test edge cases for logs read endpoints."""
    
    def test_get_logs_large_page_size(self, test_client: TestClient, create_sample_logs):
        """Test requesting large page size."""
        response = test_client.get("/api/v1/logs/?page_size=1000")  # MAX_PAGE_SIZE
        
        assert response.status_code == 200
        data = response.json()
        assert data["page_size"] == 1000
    
    def test_get_logs_page_beyond_total(self, test_client: TestClient, create_sample_logs):
        """Test requesting page beyond available data."""
        response = test_client.get("/api/v1/logs/?page=100")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should return empty results but valid response
        assert data["logs"] == []
        assert data["page"] == 100
        assert data["total"] == 5  # Total logs still correct
    
    def test_get_logs_with_special_character_search(self, test_client: TestClient):
        """Test search with special characters."""
        # Create log with special characters first
        log_data = {
            "message": "Error: [CRITICAL] System failure @service#123",
            "severity": SeverityLevel.ERROR.value,
            "source": "test-service"
        }
        test_client.post("/api/v1/logs", json=log_data)
        
        # Search for the special characters
        response = test_client.get("/api/v1/logs/?search=[CRITICAL]")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["logs"]) >= 1
    
    def test_get_logs_concurrent_requests(self, test_client: TestClient, create_sample_logs):
        """Test multiple concurrent requests to logs endpoint."""
        responses = []
        
        # Make multiple requests
        for _ in range(5):
            response = test_client.get("/api/v1/logs")
            responses.append(response)
        
        # All should succeed and return consistent results
        for response in responses:
            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 5  # Should be consistent
    
    def test_get_logs_various_sort_fields(self, test_client: TestClient, create_sample_logs):
        """Test sorting by different fields."""
        sort_fields = ["timestamp", "severity", "source", "message"]
        
        for field in sort_fields:
            for order in ["asc", "desc"]:
                response = test_client.get(f"/api/v1/logs/?sort_by={field}&sort_order={order}")
                
                assert response.status_code == 200
                data = response.json()
                assert len(data["logs"]) > 0
