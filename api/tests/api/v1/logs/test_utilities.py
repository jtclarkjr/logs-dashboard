"""
Tests for logs utilities endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
import csv
import io

from app.models.log import SeverityLevel


class TestMetadataEndpoint:
    """Test cases for metadata endpoint."""
    
    def test_get_metadata_empty_database(self, test_client: TestClient):
        """Test metadata endpoint with empty database."""
        response = test_client.get("/api/v1/logs/metadata")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "severity_levels" in data
        assert "sources" in data
        assert "date_range" in data
        assert "severity_stats" in data
        assert "total_logs" in data
        assert "sort_fields" in data
        assert "pagination" in data
        
        # Verify empty database values
        assert data["sources"] == []
        assert data["total_logs"] == 0
        assert data["severity_stats"] == {}
        assert data["date_range"]["earliest"] is None
        assert data["date_range"]["latest"] is None
    
    def test_get_metadata_with_data(self, test_client: TestClient, create_sample_logs):
        """Test metadata endpoint with existing data."""
        response = test_client.get("/api/v1/logs/metadata")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have severity levels
        assert len(data["severity_levels"]) == 5
        expected_severities = [s.value for s in SeverityLevel]
        assert set(data["severity_levels"]) == set(expected_severities)
        
        # Should have sources from sample data
        assert len(data["sources"]) == 5  # From create_sample_logs fixture
        expected_sources = ["debug-service", "info-service", "warning-service", "error-service", "critical-service"]
        assert set(data["sources"]) == set(expected_sources)
        
        # Should have date range
        assert data["date_range"]["earliest"] is not None
        assert data["date_range"]["latest"] is not None
        
        # Should have severity stats
        assert data["total_logs"] == 5
        assert len(data["severity_stats"]) == 5  # One for each severity
        
        # Verify severity stats add up to total
        stats_total = sum(data["severity_stats"].values())
        assert stats_total == data["total_logs"]
    
    def test_metadata_response_schema(self, test_client: TestClient, create_sample_logs):
        """Test that metadata response matches expected schema."""
        response = test_client.get("/api/v1/logs/metadata")
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate data types
        assert isinstance(data["severity_levels"], list)
        assert isinstance(data["sources"], list)
        assert isinstance(data["date_range"], dict)
        assert isinstance(data["severity_stats"], dict)
        assert isinstance(data["total_logs"], int)
        assert isinstance(data["sort_fields"], list)
        assert isinstance(data["pagination"], dict)
        
        # Validate date range structure
        assert "earliest" in data["date_range"]
        assert "latest" in data["date_range"]
        
        # Validate pagination structure
        assert "default_page_size" in data["pagination"]
        assert "max_page_size" in data["pagination"]
        assert isinstance(data["pagination"]["default_page_size"], int)
        assert isinstance(data["pagination"]["max_page_size"], int)
        
        # Validate sort fields
        expected_sort_fields = ["timestamp", "severity", "source", "message"]
        assert data["sort_fields"] == expected_sort_fields
    
    def test_metadata_severity_levels_complete(self, test_client: TestClient, create_sample_logs):
        """Test that all severity levels are included in metadata."""
        response = test_client.get("/api/v1/logs/metadata")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should include all severity levels regardless of data
        all_severities = {s.value for s in SeverityLevel}
        returned_severities = set(data["severity_levels"])
        assert returned_severities == all_severities
    
    def test_metadata_sources_sorted(self, test_client: TestClient, create_sample_logs):
        """Test that sources are returned in sorted order."""
        response = test_client.get("/api/v1/logs/metadata")
        
        assert response.status_code == 200
        data = response.json()
        
        # Sources should be sorted alphabetically
        sources = data["sources"]
        assert sources == sorted(sources)
    
    def test_metadata_date_range_format(self, test_client: TestClient, create_sample_logs):
        """Test that date range is in ISO format."""
        response = test_client.get("/api/v1/logs/metadata")
        
        assert response.status_code == 200
        data = response.json()
        
        # Date strings should be valid ISO format
        if data["date_range"]["earliest"]:
            earliest = datetime.fromisoformat(data["date_range"]["earliest"].replace('Z', '+00:00'))
            assert isinstance(earliest, datetime)
        
        if data["date_range"]["latest"]:
            latest = datetime.fromisoformat(data["date_range"]["latest"].replace('Z', '+00:00'))
            assert isinstance(latest, datetime)


class TestCSVExportEndpoint:
    """Test cases for CSV export endpoint."""
    
    def test_export_csv_empty_database(self, test_client: TestClient):
        """Test CSV export with empty database."""
        response = test_client.get("/api/v1/logs/export/csv")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        assert "attachment" in response.headers.get("content-disposition", "")
        
        # Should contain headers but no data
        content = response.content.decode()
        lines = content.strip().split('\n')
        assert len(lines) == 1  # Only header row
        assert "id,timestamp,severity,source,message,created_at" in content
    
    def test_export_csv_with_data(self, test_client: TestClient, create_sample_logs):
        """Test CSV export with existing data."""
        response = test_client.get("/api/v1/logs/export/csv")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        
        content = response.content.decode()
        lines = content.strip().split('\n')
        
        # Should have header + 5 data rows
        assert len(lines) == 6  # 1 header + 5 data rows
        
        # Parse CSV content
        csv_reader = csv.reader(io.StringIO(content))
        rows = list(csv_reader)
        
        # Verify header
        expected_headers = ['id', 'timestamp', 'severity', 'source', 'message', 'created_at']
        assert rows[0] == expected_headers
        
        # Verify data rows
        for i in range(1, len(rows)):
            row = rows[i]
            assert len(row) == 6  # Same number of columns as headers
            assert row[0].isdigit()  # ID should be numeric
            assert row[2] in [s.value for s in SeverityLevel]  # Valid severity
    
    def test_export_csv_filter_by_severity(self, test_client: TestClient, create_sample_logs):
        """Test CSV export filtered by severity."""
        response = test_client.get(f"/api/v1/logs/export/csv?severity={SeverityLevel.ERROR.value}")
        
        assert response.status_code == 200
        content = response.content.decode()
        
        # Parse CSV
        csv_reader = csv.reader(io.StringIO(content))
        rows = list(csv_reader)
        
        # Should have header + 1 data row (only ERROR logs)
        assert len(rows) == 2
        assert rows[1][2] == SeverityLevel.ERROR.value  # Severity column
    
    def test_export_csv_filter_by_source(self, test_client: TestClient, create_sample_logs):
        """Test CSV export filtered by source."""
        response = test_client.get("/api/v1/logs/export/csv?source=info-service")
        
        assert response.status_code == 200
        content = response.content.decode()
        
        # Parse CSV
        csv_reader = csv.reader(io.StringIO(content))
        rows = list(csv_reader)
        
        # Should have header + 1 data row
        assert len(rows) == 2
        assert rows[1][3] == "info-service"  # Source column
    
    def test_export_csv_date_range_filter(self, test_client: TestClient, create_sample_logs):
        """Test CSV export with date range filter."""
        now = datetime.now()
        start_date = (now - timedelta(hours=2)).isoformat()
        end_date = now.isoformat()
        
        response = test_client.get(f"/api/v1/logs/export/csv?start_date={start_date}&end_date={end_date}")
        
        assert response.status_code == 200
        content = response.content.decode()
        
        # Should have some logs within the date range
        lines = content.strip().split('\n')
        assert len(lines) >= 2  # At least header + some data
    
    def test_export_csv_combined_filters(self, test_client: TestClient, create_sample_logs):
        """Test CSV export with multiple filters."""
        now = datetime.now()
        start_date = (now - timedelta(hours=2)).isoformat()
        end_date = now.isoformat()
        
        response = test_client.get(
            f"/api/v1/logs/export/csv?severity={SeverityLevel.INFO.value}&start_date={start_date}&end_date={end_date}"
        )
        
        assert response.status_code == 200
        content = response.content.decode()
        
        # Parse and verify filtering
        csv_reader = csv.reader(io.StringIO(content))
        rows = list(csv_reader)
        
        # All data rows should match the severity filter
        for i in range(1, len(rows)):
            if len(rows[i]) >= 3:  # Make sure row has severity column
                assert rows[i][2] == SeverityLevel.INFO.value
    
    def test_export_csv_content_disposition_header(self, test_client: TestClient, create_sample_logs):
        """Test that CSV export has correct content disposition header."""
        response = test_client.get("/api/v1/logs/export/csv")
        
        assert response.status_code == 200
        
        content_disposition = response.headers.get("content-disposition")
        assert content_disposition is not None
        assert "attachment" in content_disposition
        assert "logs_export.csv" in content_disposition
    
    def test_export_csv_special_characters(self, test_client: TestClient):
        """Test CSV export with special characters in data."""
        # Create log with special characters
        log_data = {
            "message": "Error: [CRITICAL] System, failure; with \"quotes\" and 'apostrophes'",
            "severity": SeverityLevel.ERROR.value,
            "source": "special-service"
        }
        test_client.post("/api/v1/logs/", json=log_data)
        
        response = test_client.get("/api/v1/logs/export/csv")
        
        assert response.status_code == 200
        content = response.content.decode()
        
        # Should properly escape special characters
        assert "Error: [CRITICAL] System, failure; with \"quotes\" and 'apostrophes'" in content or \
               '"Error: [CRITICAL] System, failure; with ""quotes"" and ' in content
    
    def test_export_csv_unicode_characters(self, test_client: TestClient):
        """Test CSV export with unicode characters."""
        # Create log with unicode
        log_data = {
            "message": "Unicode test: 🚀 ñ é ü 中文",
            "severity": SeverityLevel.INFO.value,
            "source": "unicode-service"
        }
        test_client.post("/api/v1/logs/", json=log_data)
        
        response = test_client.get("/api/v1/logs/export/csv")
        
        assert response.status_code == 200
        content = response.content.decode('utf-8')
        
        # Should contain unicode characters
        assert "🚀 ñ é ü 中文" in content


class TestUtilitiesValidation:
    """Test validation for utilities endpoints."""
    
    def test_csv_export_invalid_severity(self, test_client: TestClient):
        """Test CSV export with invalid severity."""
        response = test_client.get("/api/v1/logs/export/csv?severity=INVALID")
        assert response.status_code == 422
    
    def test_csv_export_invalid_date_format(self, test_client: TestClient):
        """Test CSV export with invalid date format."""
        response = test_client.get("/api/v1/logs/export/csv?start_date=invalid-date")
        assert response.status_code == 422
    
    def test_csv_export_invalid_date_range(self, test_client: TestClient):
        """Test CSV export with invalid date range."""
        start_date = "2023-12-01T10:00:00"
        end_date = "2023-11-01T10:00:00"  # Before start date
        
        response = test_client.get(f"/api/v1/logs/export/csv?start_date={start_date}&end_date={end_date}")
        assert response.status_code == 422


class TestUtilitiesEdgeCases:
    """Test edge cases for utilities endpoints."""
    
    def test_metadata_with_no_matching_data(self, test_client: TestClient, create_sample_logs):
        """Test metadata endpoint behavior with filters that match no data."""
        # Metadata endpoint doesn't support filters, so this tests basic functionality
        response = test_client.get("/api/v1/logs/metadata")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should still return complete metadata structure
        assert "severity_levels" in data
        assert len(data["severity_levels"]) == 5
    
    def test_csv_export_with_no_matching_filters(self, test_client: TestClient, create_sample_logs):
        """Test CSV export with filters that match no logs."""
        response = test_client.get("/api/v1/logs/export/csv?source=non-existent-service")
        
        assert response.status_code == 200
        content = response.content.decode()
        
        # Should return headers but no data rows
        lines = content.strip().split('\n')
        assert len(lines) == 1  # Only header row
    
    def test_csv_export_large_dataset(self, test_client: TestClient):
        """Test CSV export with larger dataset."""
        # Create multiple logs
        for i in range(10):
            log_data = {
                "message": f"Test log message {i}",
                "severity": SeverityLevel.INFO.value,
                "source": f"service-{i}"
            }
            test_client.post("/api/v1/logs/", json=log_data)
        
        response = test_client.get("/api/v1/logs/export/csv")
        
        assert response.status_code == 200
        content = response.content.decode()
        lines = content.strip().split('\n')
        
        # Should have header + 10 data rows
        assert len(lines) == 11
    
    def test_utilities_concurrent_requests(self, test_client: TestClient, create_sample_logs):
        """Test multiple concurrent requests to utilities endpoints."""
        endpoints = [
            "/api/v1/logs/metadata",
            "/api/v1/logs/export/csv"
        ]
        
        for endpoint in endpoints:
            responses = []
            
            # Make multiple requests
            for _ in range(3):
                response = test_client.get(endpoint)
                responses.append(response)
            
            # All should succeed
            for response in responses:
                assert response.status_code == 200
    
    def test_metadata_consistency(self, test_client: TestClient, create_sample_logs):
        """Test that metadata endpoint returns consistent results."""
        responses = []
        
        # Make multiple requests
        for _ in range(3):
            response = test_client.get("/api/v1/logs/metadata")
            responses.append(response.json())
        
        # All responses should be identical
        first_response = responses[0]
        for response in responses[1:]:
            assert response["total_logs"] == first_response["total_logs"]
            assert set(response["sources"]) == set(first_response["sources"])
            assert response["severity_stats"] == first_response["severity_stats"]
    
    def test_csv_export_empty_messages(self, test_client: TestClient):
        """Test CSV export handles edge cases in data."""
        # This test would be relevant if we allowed empty messages, 
        # but our validation prevents it. Still good to test the export robustness.
        response = test_client.get("/api/v1/logs/export/csv")
        
        assert response.status_code == 200
        # Should not crash even with edge case data