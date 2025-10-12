"""
Tests for logs analytics endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

from app.models.log import SeverityLevel


class TestLogAggregation:
    """Test cases for log aggregation endpoint."""
    
    def test_get_aggregation_empty_database(self, test_client: TestClient):
        """Test aggregation with empty database."""
        response = test_client.get("/api/v1/logs/aggregation")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "total_logs" in data
        assert "date_range_start" in data
        assert "date_range_end" in data
        assert "by_severity" in data
        assert "by_source" in data
        assert "by_date" in data
        
        # Verify empty results
        assert data["total_logs"] == 0
        assert data["by_severity"] == []
        assert data["by_source"] == []
        assert data["by_date"] == []
    
    def test_get_aggregation_with_data(self, test_client: TestClient, create_sample_logs):
        """Test aggregation with existing data."""
        response = test_client.get("/api/v1/logs/aggregation")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have 5 logs total from fixture
        assert data["total_logs"] == 5
        
        # Should have aggregation by severity
        assert len(data["by_severity"]) > 0
        severity_totals = sum(item["count"] for item in data["by_severity"])
        assert severity_totals == 5
        
        # Should have aggregation by source  
        assert len(data["by_source"]) > 0
        source_totals = sum(item["count"] for item in data["by_source"])
        assert source_totals == 5
        
        # Should have aggregation by date
        assert len(data["by_date"]) > 0
        date_totals = sum(item["count"] for item in data["by_date"])
        assert date_totals == 5
    
    def test_get_aggregation_filter_by_severity(self, test_client: TestClient, create_sample_logs):
        """Test aggregation filtered by severity."""
        response = test_client.get(f"/api/v1/logs/aggregation?severity={SeverityLevel.ERROR.value}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have only ERROR logs
        assert data["total_logs"] == 1
        assert len(data["by_severity"]) == 1
        assert data["by_severity"][0]["severity"] == SeverityLevel.ERROR.value
        assert data["by_severity"][0]["count"] == 1
    
    def test_get_aggregation_filter_by_source(self, test_client: TestClient, create_sample_logs):
        """Test aggregation filtered by source."""
        response = test_client.get("/api/v1/logs/aggregation?source=info-service")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have only logs from info-service
        assert data["total_logs"] == 1
        assert len(data["by_source"]) == 1
        assert data["by_source"][0]["source"] == "info-service"
        assert data["by_source"][0]["count"] == 1
    
    def test_get_aggregation_date_range_filter(self, test_client: TestClient, create_sample_logs):
        """Test aggregation with date range filter."""
        # Get aggregation for the last hour
        now = datetime.now()
        start_date = (now - timedelta(hours=2)).isoformat()
        end_date = now.isoformat()
        
        response = test_client.get(f"/api/v1/logs/aggregation?start_date={start_date}&end_date={end_date}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should return some logs within the date range
        assert data["total_logs"] >= 1
        assert data["date_range_start"] == start_date
        assert data["date_range_end"] == end_date
    
    def test_get_aggregation_combined_filters(self, test_client: TestClient, create_sample_logs):
        """Test aggregation with multiple filters."""
        now = datetime.now()
        start_date = (now - timedelta(hours=2)).isoformat()
        end_date = now.isoformat()
        
        response = test_client.get(
            f"/api/v1/logs/aggregation?severity={SeverityLevel.INFO.value}&start_date={start_date}&end_date={end_date}"
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Results should match all filters
        if data["total_logs"] > 0:
            assert all(item["severity"] == SeverityLevel.INFO.value for item in data["by_severity"])
    
    def test_get_aggregation_response_schema(self, test_client: TestClient, create_sample_logs):
        """Test that aggregation response matches expected schema."""
        response = test_client.get("/api/v1/logs/aggregation")
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate main fields
        assert isinstance(data["total_logs"], int)
        assert isinstance(data["by_severity"], list)
        assert isinstance(data["by_source"], list)
        assert isinstance(data["by_date"], list)
        
        # Validate severity items
        for item in data["by_severity"]:
            assert "severity" in item
            assert "count" in item
            assert isinstance(item["count"], int)
            assert item["severity"] in [s.value for s in SeverityLevel]
        
        # Validate source items
        for item in data["by_source"]:
            assert "source" in item
            assert "count" in item
            assert isinstance(item["source"], str)
            assert isinstance(item["count"], int)
        
        # Validate date items
        for item in data["by_date"]:
            assert "date" in item
            assert "count" in item
            assert isinstance(item["date"], str)
            assert isinstance(item["count"], int)


class TestLogAggregationValidation:
    """Test validation for log aggregation endpoint."""
    
    def test_aggregation_invalid_severity(self, test_client: TestClient):
        """Test aggregation with invalid severity."""
        response = test_client.get("/api/v1/logs/aggregation?severity=INVALID")
        assert response.status_code == 422
    
    def test_aggregation_invalid_date_format(self, test_client: TestClient):
        """Test aggregation with invalid date format."""
        response = test_client.get("/api/v1/logs/aggregation?start_date=invalid-date")
        assert response.status_code == 422
    
    def test_aggregation_invalid_date_range(self, test_client: TestClient):
        """Test aggregation with invalid date range."""
        start_date = "2023-12-01T10:00:00"
        end_date = "2023-11-01T10:00:00"  # Before start date
        
        response = test_client.get(f"/api/v1/logs/aggregation?start_date={start_date}&end_date={end_date}")
        assert response.status_code == 422


class TestChartData:
    """Test cases for chart data endpoint."""
    
    def test_get_chart_data_empty_database(self, test_client: TestClient):
        """Test chart data with empty database."""
        response = test_client.get("/api/v1/logs/chart-data")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "data" in data
        assert "group_by" in data
        assert "start_date" in data
        assert "end_date" in data
        assert "filters" in data
        
        # Verify default values
        assert data["group_by"] == "day"
        assert isinstance(data["data"], list)
        assert isinstance(data["filters"], dict)
    
    def test_get_chart_data_with_data(self, test_client: TestClient, create_sample_logs):
        """Test chart data with existing data."""
        response = test_client.get("/api/v1/logs/chart-data")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have data points
        assert len(data["data"]) > 0
        
        # Each data point should have required fields
        for point in data["data"]:
            assert "timestamp" in point
            assert "total" in point
            # Should have severity level counts
            for severity in SeverityLevel:
                assert severity.value in point
    
    def test_get_chart_data_group_by_hour(self, test_client: TestClient, create_sample_logs):
        """Test chart data grouped by hour."""
        response = test_client.get("/api/v1/logs/chart-data?group_by=hour")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["group_by"] == "hour"
        assert len(data["data"]) > 0
    
    def test_get_chart_data_group_by_week(self, test_client: TestClient, create_sample_logs):
        """Test chart data grouped by week."""
        response = test_client.get("/api/v1/logs/chart-data?group_by=week")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["group_by"] == "week"
        assert len(data["data"]) > 0
    
    def test_get_chart_data_group_by_month(self, test_client: TestClient, create_sample_logs):
        """Test chart data grouped by month."""
        response = test_client.get("/api/v1/logs/chart-data?group_by=month")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["group_by"] == "month"
        assert len(data["data"]) > 0
    
    def test_get_chart_data_filter_by_severity(self, test_client: TestClient, create_sample_logs):
        """Test chart data filtered by severity."""
        response = test_client.get(f"/api/v1/logs/chart-data?severity={SeverityLevel.ERROR.value}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["filters"]["severity"] == SeverityLevel.ERROR.value
        
        # All data points should have ERROR counts
        for point in data["data"]:
            if point["total"] > 0:
                assert point["ERROR"] > 0
    
    def test_get_chart_data_filter_by_source(self, test_client: TestClient, create_sample_logs):
        """Test chart data filtered by source."""
        response = test_client.get("/api/v1/logs/chart-data?source=info-service")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["filters"]["source"] == "info-service"
    
    def test_get_chart_data_date_range_filter(self, test_client: TestClient, create_sample_logs):
        """Test chart data with date range filter."""
        now = datetime.now()
        start_date = (now - timedelta(hours=2)).isoformat()
        end_date = now.isoformat()
        
        response = test_client.get(f"/api/v1/logs/chart-data?start_date={start_date}&end_date={end_date}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["start_date"] == start_date
        assert data["end_date"] == end_date
    
    def test_get_chart_data_combined_filters(self, test_client: TestClient, create_sample_logs):
        """Test chart data with multiple filters."""
        now = datetime.now()
        start_date = (now - timedelta(hours=2)).isoformat()
        end_date = now.isoformat()
        
        response = test_client.get(
            f"/api/v1/logs/chart-data?severity={SeverityLevel.INFO.value}&source=info&group_by=hour&start_date={start_date}&end_date={end_date}"
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["group_by"] == "hour"
        assert data["filters"]["severity"] == SeverityLevel.INFO.value
        assert data["filters"]["source"] == "info"
        assert data["start_date"] == start_date
        assert data["end_date"] == end_date
    
    def test_chart_data_response_structure(self, test_client: TestClient, create_sample_logs):
        """Test chart data response structure."""
        response = test_client.get("/api/v1/logs/chart-data")
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate main structure
        assert isinstance(data["data"], list)
        assert isinstance(data["group_by"], str)
        assert isinstance(data["filters"], dict)
        
        # Validate data points structure
        for point in data["data"]:
            assert isinstance(point, dict)
            assert "timestamp" in point
            assert "total" in point
            assert isinstance(point["total"], int)
            
            # Check all severity levels are present
            for severity in SeverityLevel:
                assert severity.value in point
                assert isinstance(point[severity.value], int)


class TestChartDataValidation:
    """Test validation for chart data endpoint."""
    
    def test_chart_data_invalid_group_by(self, test_client: TestClient):
        """Test chart data with invalid group_by parameter."""
        response = test_client.get("/api/v1/logs/chart-data?group_by=invalid")
        assert response.status_code == 422
    
    def test_chart_data_invalid_severity(self, test_client: TestClient):
        """Test chart data with invalid severity."""
        response = test_client.get("/api/v1/logs/chart-data?severity=INVALID")
        assert response.status_code == 422
    
    def test_chart_data_invalid_date_format(self, test_client: TestClient):
        """Test chart data with invalid date format."""
        response = test_client.get("/api/v1/logs/chart-data?start_date=invalid-date")
        assert response.status_code == 422


class TestAnalyticsEdgeCases:
    """Test edge cases for analytics endpoints."""
    
    def test_aggregation_with_no_matching_filters(self, test_client: TestClient, create_sample_logs):
        """Test aggregation with filters that match no logs."""
        response = test_client.get("/api/v1/logs/aggregation?source=non-existent-service")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["total_logs"] == 0
        assert data["by_severity"] == []
        assert data["by_source"] == []
        assert data["by_date"] == []
    
    def test_chart_data_with_no_matching_filters(self, test_client: TestClient, create_sample_logs):
        """Test chart data with filters that match no logs."""
        response = test_client.get("/api/v1/logs/chart-data?source=non-existent-service")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should return structure but with zero counts
        assert isinstance(data["data"], list)
        assert data["filters"]["source"] == "non-existent-service"
    
    def test_analytics_with_future_date_range(self, test_client: TestClient, create_sample_logs):
        """Test analytics with future date range (should return no data)."""
        future_start = (datetime.now() + timedelta(days=1)).isoformat()
        future_end = (datetime.now() + timedelta(days=2)).isoformat()
        
        # Test aggregation
        agg_response = test_client.get(f"/api/v1/logs/aggregation?start_date={future_start}&end_date={future_end}")
        assert agg_response.status_code == 200
        agg_data = agg_response.json()
        assert agg_data["total_logs"] == 0
        
        # Test chart data
        chart_response = test_client.get(f"/api/v1/logs/chart-data?start_date={future_start}&end_date={future_end}")
        assert chart_response.status_code == 200
        chart_data = chart_response.json()
        assert chart_data["start_date"] == future_start
        assert chart_data["end_date"] == future_end
    
    def test_analytics_concurrent_requests(self, test_client: TestClient, create_sample_logs):
        """Test multiple concurrent requests to analytics endpoints."""
        endpoints = [
            "/api/v1/logs/aggregation",
            "/api/v1/logs/chart-data"
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
    
    def test_analytics_large_time_ranges(self, test_client: TestClient, create_sample_logs):
        """Test analytics with large time ranges."""
        # Very wide date range
        start_date = "2020-01-01T00:00:00"
        end_date = "2025-12-31T23:59:59"
        
        response = test_client.get(f"/api/v1/logs/aggregation?start_date={start_date}&end_date={end_date}")
        assert response.status_code == 200
        
        response = test_client.get(f"/api/v1/logs/chart-data?start_date={start_date}&end_date={end_date}")
        assert response.status_code == 200