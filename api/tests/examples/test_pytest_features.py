"""
Examples of advanced pytest features for the logs dashboard API.

This file demonstrates when you DO need to import pytest and use its features.
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime

from app.models.log import SeverityLevel


class TestPytestFeatures:
    """Examples of advanced pytest features."""
    
    @pytest.mark.parametrize("severity,expected_count", [
        (SeverityLevel.DEBUG, 1),
        (SeverityLevel.INFO, 1),
        (SeverityLevel.WARNING, 1),
        (SeverityLevel.ERROR, 1),
        (SeverityLevel.CRITICAL, 1),
    ])
    def test_severity_filtering_parametrized(
        self, 
        test_client: TestClient, 
        create_sample_logs, 
        severity: SeverityLevel, 
        expected_count: int
    ):
        """Test severity filtering with parametrized values."""
        response = test_client.get(f"/api/v1/logs/?severity={severity.value}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == expected_count
    
    @pytest.mark.parametrize("invalid_data,expected_field", [
        ({"message": "", "severity": "INFO", "source": "test"}, "message"),
        ({"message": "test", "severity": "INVALID", "source": "test"}, "severity"),
        ({"message": "test", "severity": "INFO", "source": ""}, "source"),
        ({"message": "A" * 1001, "severity": "INFO", "source": "test"}, "message"),
        ({"message": "test", "severity": "INFO", "source": "A" * 101}, "source"),
    ])
    def test_create_validation_errors_parametrized(
        self, 
        test_client: TestClient, 
        invalid_data: dict, 
        expected_field: str
    ):
        """Test various validation errors with parametrized data."""
        response = test_client.post("/api/v1/logs/", json=invalid_data)
        
        assert response.status_code == 422
        error_detail = response.json()
        # Check that the error mentions the expected field
        error_str = str(error_detail)
        assert expected_field.lower() in error_str.lower()
    
    @pytest.mark.slow
    def test_large_dataset_performance(self, test_client: TestClient):
        """Test performance with large dataset - marked as slow."""
        # Create many logs
        for i in range(100):
            log_data = {
                "message": f"Performance test log {i}",
                "severity": SeverityLevel.INFO.value,
                "source": f"service-{i % 10}"
            }
            test_client.post("/api/v1/logs/", json=log_data)
        
        # Test that listing still works efficiently
        response = test_client.get("/api/v1/logs/?page_size=50")
        assert response.status_code == 200
        data = response.json()
        assert len(data["logs"]) == 50
    
    def test_exception_handling_with_pytest_raises(self, test_client: TestClient):
        """Example of using pytest.raises for exception testing."""
        # This would be used if testing internal functions that raise exceptions
        # For API endpoints, we check status codes instead
        
        # Example of what you might do for internal functions:
        from app.validators.log_validators import validate_log_id
        
        with pytest.raises(Exception):  # Would be more specific in real tests
            validate_log_id(-1)  # Invalid ID should raise exception
    
    @pytest.mark.integration
    def test_full_api_workflow(self, test_client: TestClient):
        """Integration test marked with custom marker."""
        # Create -> Read -> Update -> Delete workflow
        create_data = {
            "message": "Integration test log",
            "severity": SeverityLevel.INFO.value,
            "source": "integration-test"
        }
        
        # Create
        create_response = test_client.post("/api/v1/logs/", json=create_data)
        assert create_response.status_code == 201
        log_id = create_response.json()["id"]
        
        # Read
        read_response = test_client.get(f"/api/v1/logs/{log_id}")
        assert read_response.status_code == 200
        
        # Update
        update_response = test_client.put(f"/api/v1/logs/{log_id}", json={"message": "Updated"})
        assert update_response.status_code == 200
        
        # Delete
        delete_response = test_client.delete(f"/api/v1/logs/{log_id}")
        assert delete_response.status_code == 200
    
    @pytest.fixture
    def sample_error_log(self, test_client: TestClient):
        """Custom fixture that creates an ERROR log and returns its ID."""
        log_data = {
            "message": "Sample error for testing",
            "severity": SeverityLevel.ERROR.value,
            "source": "error-service"
        }
        
        response = test_client.post("/api/v1/logs/", json=log_data)
        assert response.status_code == 201
        return response.json()["id"]
    
    def test_with_custom_fixture(self, test_client: TestClient, sample_error_log: int):
        """Test using the custom fixture."""
        response = test_client.get(f"/api/v1/logs/{sample_error_log}")
        
        assert response.status_code == 200
        log_data = response.json()
        assert log_data["severity"] == SeverityLevel.ERROR.value
        assert log_data["message"] == "Sample error for testing"
    
    @pytest.mark.skipif(
        condition=datetime.now().weekday() == 6,  # Sunday
        reason="Skip analytics tests on Sundays for maintenance"
    )
    def test_conditional_skip_example(self, test_client: TestClient):
        """Example of conditional test skipping."""
        response = test_client.get("/api/v1/logs/aggregation")
        assert response.status_code == 200
    
    @pytest.mark.xfail(reason="Feature not implemented yet")
    def test_future_feature(self, test_client: TestClient):
        """Example of expected failure for future features."""
        # This test is expected to fail until the feature is implemented
        response = test_client.get("/api/v1/logs/future-endpoint")
        assert response.status_code == 200


class TestPytestMarkers:
    """Examples of using different pytest markers."""
    
    @pytest.mark.unit
    def test_unit_example(self):
        """Unit test example."""
        # Test isolated function
        from app.models.log import SeverityLevel
        assert SeverityLevel.ERROR.value == "ERROR"
    
    @pytest.mark.crud
    def test_crud_marker_example(self, test_client: TestClient):
        """CRUD operations test."""
        response = test_client.post("/api/v1/logs/", json={
            "message": "CRUD test",
            "severity": SeverityLevel.INFO.value,
            "source": "crud-service"
        })
        assert response.status_code == 201
    
    @pytest.mark.analytics
    def test_analytics_marker_example(self, test_client: TestClient, create_sample_logs):
        """Analytics test."""
        response = test_client.get("/api/v1/logs/aggregation")
        assert response.status_code == 200
        assert response.json()["total_logs"] == 5
    
    @pytest.mark.utilities
    def test_utilities_marker_example(self, test_client: TestClient):
        """Utilities test."""
        response = test_client.get("/api/v1/logs/metadata")
        assert response.status_code == 200


# Test configuration examples
class TestConfiguration:
    """Examples of test configuration and setup."""
    
    def test_with_monkeypatch(self, test_client: TestClient, monkeypatch):
        """Example of using monkeypatch to modify environment."""
        # You could use this to test different configurations
        monkeypatch.setenv("DEBUG", "false")
        
        response = test_client.get("/api/v1/health")
        assert response.status_code == 200
    
    def test_with_tmp_path(self, tmp_path):
        """Example of using tmp_path for file operations."""
        # Useful if you need to test file operations
        test_file = tmp_path / "test.txt"
        test_file.write_text("test content")
        
        assert test_file.read_text() == "test content"


# Demonstration of when pytest import IS needed
@pytest.mark.parametrize("page_size", [10, 25, 50, 100])
def test_pagination_sizes(test_client: TestClient, create_sample_logs, page_size: int):
    """Test different pagination sizes - demonstrates parametrize usage."""
    response = test_client.get(f"/api/v1/logs/?page_size={page_size}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["page_size"] == page_size
    assert len(data["logs"]) <= page_size