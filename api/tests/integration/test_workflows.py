"""
Integration tests for complete API workflows.

These tests verify that different endpoints work together correctly
and that complete user workflows function as expected.
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

from app.models.log import SeverityLevel


class TestCompleteLogWorkflow:
    """Test complete log management workflows."""
    
    def test_full_log_lifecycle(self, test_client: TestClient):
        """Test creating, reading, updating, and deleting a log through the full lifecycle."""
        # 1. Create a log
        create_data = {
            "message": "Test log for lifecycle",
            "severity": SeverityLevel.INFO.value,
            "source": "lifecycle-service"
        }
        
        create_response = test_client.post("/api/v1/logs/", json=create_data)
        assert create_response.status_code == 201
        created_log = create_response.json()
        log_id = created_log["id"]
        
        # 2. Read the log by ID
        get_response = test_client.get(f"/api/v1/logs/{log_id}")
        assert get_response.status_code == 200
        retrieved_log = get_response.json()
        assert retrieved_log["message"] == create_data["message"]
        assert retrieved_log["severity"] == create_data["severity"]
        assert retrieved_log["source"] == create_data["source"]
        
        # 3. Verify it appears in the list
        list_response = test_client.get("/api/v1/logs/")
        assert list_response.status_code == 200
        logs_list = list_response.json()
        assert logs_list["total"] >= 1
        log_ids = [log["id"] for log in logs_list["logs"]]
        assert log_id in log_ids
        
        # 4. Update the log
        update_data = {
            "message": "Updated lifecycle message",
            "severity": SeverityLevel.WARNING.value
        }
        
        update_response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
        assert update_response.status_code == 200
        updated_log = update_response.json()
        assert updated_log["message"] == update_data["message"]
        assert updated_log["severity"] == update_data["severity"]
        assert updated_log["source"] == create_data["source"]  # Unchanged
        
        # 5. Verify update is reflected in get
        get_updated_response = test_client.get(f"/api/v1/logs/{log_id}")
        assert get_updated_response.status_code == 200
        assert get_updated_response.json()["message"] == update_data["message"]
        
        # 6. Delete the log
        delete_response = test_client.delete(f"/api/v1/logs/{log_id}")
        assert delete_response.status_code == 200
        
        # 7. Verify log is deleted
        get_deleted_response = test_client.get(f"/api/v1/logs/{log_id}")
        assert get_deleted_response.status_code == 404
    
    def test_bulk_operations_workflow(self, test_client: TestClient):
        """Test workflows involving multiple logs."""
        # Create multiple logs
        created_log_ids = []
        
        for i in range(5):
            log_data = {
                "message": f"Bulk log {i}",
                "severity": SeverityLevel.INFO.value if i % 2 == 0 else SeverityLevel.ERROR.value,
                "source": f"bulk-service-{i}"
            }
            
            response = test_client.post("/api/v1/logs/", json=log_data)
            assert response.status_code == 201
            created_log_ids.append(response.json()["id"])
        
        # Verify all logs exist in list
        list_response = test_client.get("/api/v1/logs/")
        assert list_response.status_code == 200
        logs_data = list_response.json()
        assert logs_data["total"] >= 5
        
        # Test filtering
        info_response = test_client.get(f"/api/v1/logs/?severity={SeverityLevel.INFO.value}")
        assert info_response.status_code == 200
        info_logs = info_response.json()
        assert info_logs["total"] == 3  # 3 INFO logs (indices 0, 2, 4)
        
        error_response = test_client.get(f"/api/v1/logs/?severity={SeverityLevel.ERROR.value}")
        assert error_response.status_code == 200
        error_logs = error_response.json()
        assert error_logs["total"] == 2  # 2 ERROR logs (indices 1, 3)
        
        # Test pagination
        page1_response = test_client.get("/api/v1/logs/?page=1&page_size=3")
        assert page1_response.status_code == 200
        page1_data = page1_response.json()
        assert len(page1_data["logs"]) == 3
        assert page1_data["page"] == 1
        
        # Delete some logs
        for log_id in created_log_ids[:2]:
            delete_response = test_client.delete(f"/api/v1/logs/{log_id}")
            assert delete_response.status_code == 200
        
        # Verify deletion
        final_list_response = test_client.get("/api/v1/logs/")
        final_logs_data = final_list_response.json()
        assert final_logs_data["total"] >= 3  # At least 3 remaining logs
        
        remaining_ids = [log["id"] for log in final_logs_data["logs"]]
        for deleted_id in created_log_ids[:2]:
            assert deleted_id not in remaining_ids
    
    def test_analytics_workflow(self, test_client: TestClient, create_sample_logs):
        """Test analytics workflow with existing data."""
        # Get aggregation data
        agg_response = test_client.get("/api/v1/logs/aggregation")
        assert agg_response.status_code == 200
        agg_data = agg_response.json()
        
        # Verify aggregation matches expected data
        assert agg_data["total_logs"] == 5
        
        # Get chart data
        chart_response = test_client.get("/api/v1/logs/chart-data")
        assert chart_response.status_code == 200
        chart_data = chart_response.json()
        assert len(chart_data["data"]) > 0
        
        # Test filtering analytics
        info_agg_response = test_client.get(f"/api/v1/logs/aggregation?severity={SeverityLevel.INFO.value}")
        assert info_agg_response.status_code == 200
        info_agg_data = info_agg_response.json()
        assert info_agg_data["total_logs"] == 1  # Only one INFO log in sample data
        
        # Test chart data with filtering
        info_chart_response = test_client.get(f"/api/v1/logs/chart-data?severity={SeverityLevel.INFO.value}")
        assert info_chart_response.status_code == 200
        info_chart_data = info_chart_response.json()
        assert info_chart_data["filters"]["severity"] == SeverityLevel.INFO.value
    
    def test_export_workflow(self, test_client: TestClient, create_sample_logs):
        """Test export workflow."""
        # Get metadata first
        metadata_response = test_client.get("/api/v1/logs/metadata")
        assert metadata_response.status_code == 200
        metadata = metadata_response.json()
        
        # Verify metadata shows our data
        assert metadata["total_logs"] == 5
        assert len(metadata["sources"]) == 5
        assert len(metadata["severity_stats"]) == 5
        
        # Export all data
        export_response = test_client.get("/api/v1/logs/export/csv")
        assert export_response.status_code == 200
        assert export_response.headers["content-type"] == "text/csv; charset=utf-8"
        
        content = export_response.content.decode()
        lines = content.strip().split('\n')
        assert len(lines) == 6  # Header + 5 data rows
        
        # Export filtered data
        filtered_export = test_client.get(f"/api/v1/logs/export/csv?severity={SeverityLevel.ERROR.value}")
        assert filtered_export.status_code == 200
        
        filtered_content = filtered_export.content.decode()
        filtered_lines = filtered_content.strip().split('\n')
        assert len(filtered_lines) == 2  # Header + 1 ERROR log
    
    def test_search_and_filter_workflow(self, test_client: TestClient):
        """Test comprehensive search and filtering workflow."""
        # Create logs with specific patterns for searching
        test_logs = [
            {"message": "Database connection failed", "severity": SeverityLevel.ERROR.value, "source": "db-service"},
            {"message": "User authentication successful", "severity": SeverityLevel.INFO.value, "source": "auth-service"},
            {"message": "Database query slow", "severity": SeverityLevel.WARNING.value, "source": "db-service"},
            {"message": "Authentication timeout", "severity": SeverityLevel.ERROR.value, "source": "auth-service"},
        ]
        
        created_ids = []
        for log_data in test_logs:
            response = test_client.post("/api/v1/logs/", json=log_data)
            assert response.status_code == 201
            created_ids.append(response.json()["id"])
        
        # Test search by message content
        search_response = test_client.get("/api/v1/logs/?search=Database")
        assert search_response.status_code == 200
        search_results = search_response.json()
        assert search_results["total"] == 2  # 2 logs contain "Database"
        
        # Test filter by source
        db_response = test_client.get("/api/v1/logs/?source=db-service")
        assert db_response.status_code == 200
        db_results = db_response.json()
        assert db_results["total"] == 2  # 2 logs from db-service
        
        # Test combined search and filter
        combined_response = test_client.get("/api/v1/logs/?search=authentication&severity=ERROR")
        assert combined_response.status_code == 200
        combined_results = combined_response.json()
        assert combined_results["total"] == 1  # Only "Authentication timeout" ERROR log
        
        # Test sorting
        sorted_response = test_client.get("/api/v1/logs/?sort_by=severity&sort_order=desc")
        assert sorted_response.status_code == 200
        sorted_results = sorted_response.json()
        # First logs should be ERROR severity (highest)
        assert sorted_results["logs"][0]["severity"] == SeverityLevel.ERROR.value


class TestErrorHandlingWorkflow:
    """Test workflows involving error conditions."""
    
    def test_invalid_operations_workflow(self, test_client: TestClient):
        """Test workflow with various invalid operations."""
        # Try to get non-existent log
        get_response = test_client.get("/api/v1/logs/99999")
        assert get_response.status_code == 404
        
        # Try to update non-existent log
        update_response = test_client.put("/api/v1/logs/99999", json={"message": "test"})
        assert update_response.status_code == 404
        
        # Try to delete non-existent log
        delete_response = test_client.delete("/api/v1/logs/99999")
        assert delete_response.status_code == 404
        
        # Try invalid create
        invalid_create = test_client.post("/api/v1/logs/", json={
            "message": "",  # Empty message
            "severity": SeverityLevel.INFO.value,
            "source": "test"
        })
        assert invalid_create.status_code == 422
        
        # Try invalid filters
        invalid_severity = test_client.get("/api/v1/logs/?severity=INVALID")
        assert invalid_severity.status_code == 422
        
        invalid_date = test_client.get("/api/v1/logs/?start_date=invalid-date")
        assert invalid_date.status_code == 422
    
    def test_data_consistency_workflow(self, test_client: TestClient):
        """Test that data remains consistent across operations."""
        # Create a log
        log_data = {
            "message": "Consistency test log",
            "severity": SeverityLevel.INFO.value,
            "source": "consistency-service"
        }
        
        create_response = test_client.post("/api/v1/logs/", json=log_data)
        assert create_response.status_code == 201
        log_id = create_response.json()["id"]
        
        # Get initial total count
        initial_list = test_client.get("/api/v1/logs/")
        initial_count = initial_list.json()["total"]
        
        # Update log multiple times
        updates = [
            {"message": "First update"},
            {"severity": SeverityLevel.WARNING.value},
            {"message": "Final update", "severity": SeverityLevel.ERROR.value}
        ]
        
        for update_data in updates:
            update_response = test_client.put(f"/api/v1/logs/{log_id}", json=update_data)
            assert update_response.status_code == 200
        
        # Verify count hasn't changed
        after_updates_list = test_client.get("/api/v1/logs/")
        assert after_updates_list.json()["total"] == initial_count
        
        # Verify final state
        final_get = test_client.get(f"/api/v1/logs/{log_id}")
        final_log = final_get.json()
        assert final_log["message"] == "Final update"
        assert final_log["severity"] == SeverityLevel.ERROR.value
        
        # Delete and verify count decreases
        delete_response = test_client.delete(f"/api/v1/logs/{log_id}")
        assert delete_response.status_code == 200
        
        final_list = test_client.get("/api/v1/logs/")
        assert final_list.json()["total"] == initial_count - 1


class TestPerformanceWorkflow:
    """Test workflows under various load conditions."""
    
    def test_pagination_performance_workflow(self, test_client: TestClient):
        """Test pagination with larger datasets."""
        # Create 50 logs
        created_ids = []
        for i in range(50):
            log_data = {
                "message": f"Performance test log {i:03d}",
                "severity": SeverityLevel.INFO.value if i % 3 == 0 else 
                           SeverityLevel.WARNING.value if i % 3 == 1 else 
                           SeverityLevel.ERROR.value,
                "source": f"perf-service-{i % 5}"  # 5 different services
            }
            
            response = test_client.post("/api/v1/logs/", json=log_data)
            assert response.status_code == 201
            created_ids.append(response.json()["id"])
        
        # Test different page sizes
        page_sizes = [10, 20, 50]
        
        for page_size in page_sizes:
            response = test_client.get(f"/api/v1/logs/?page_size={page_size}")
            assert response.status_code == 200
            data = response.json()
            assert len(data["logs"]) <= page_size
            assert data["page_size"] == page_size
            assert data["total"] >= 50
        
        # Test pagination consistency
        page1 = test_client.get("/api/v1/logs/?page=1&page_size=20").json()
        page2 = test_client.get("/api/v1/logs/?page=2&page_size=20").json()
        page3 = test_client.get("/api/v1/logs/?page=3&page_size=20").json()
        
        # No overlap between pages
        page1_ids = {log["id"] for log in page1["logs"]}
        page2_ids = {log["id"] for log in page2["logs"]}
        page3_ids = {log["id"] for log in page3["logs"]}
        
        assert len(page1_ids & page2_ids) == 0
        assert len(page2_ids & page3_ids) == 0
        assert len(page1_ids & page3_ids) == 0
    
    def test_complex_analytics_workflow(self, test_client: TestClient):
        """Test analytics with complex filtering combinations."""
        # Create logs with time distribution
        now = datetime.now()
        for i in range(20):
            timestamp = now - timedelta(hours=i)
            log_data = {
                "message": f"Complex analytics log {i}",
                "severity": SeverityLevel.ERROR.value if i < 5 else
                           SeverityLevel.WARNING.value if i < 10 else
                           SeverityLevel.INFO.value,
                "source": f"analytics-service-{i % 3}",
                "timestamp": timestamp.isoformat()
            }
            
            response = test_client.post("/api/v1/logs/", json=log_data)
            assert response.status_code == 201
        
        # Test different time groupings
        groupings = ["hour", "day", "week", "month"]
        
        for grouping in groupings:
            response = test_client.get(f"/api/v1/logs/chart-data?group_by={grouping}")
            assert response.status_code == 200
            data = response.json()
            assert data["group_by"] == grouping
            assert len(data["data"]) > 0
        
        # Test filtered aggregations
        last_day = (now - timedelta(hours=24)).isoformat()
        
        recent_agg = test_client.get(f"/api/v1/logs/aggregation?start_date={last_day}")
        assert recent_agg.status_code == 200
        recent_data = recent_agg.json()
        assert recent_data["total_logs"] >= 20
        
        # Test source-specific analytics
        source_agg = test_client.get("/api/v1/logs/aggregation?source=analytics-service-0")
        assert source_agg.status_code == 200
        source_data = source_agg.json()
        
        # Should have logs from only one service (every 3rd log)
        expected_count = len([i for i in range(20) if i % 3 == 0])
        assert source_data["total_logs"] == expected_count


class TestConcurrencyWorkflow:
    """Test concurrent operations workflow."""
    
    def test_concurrent_crud_operations(self, test_client: TestClient):
        """Test concurrent create, read, update, delete operations."""
        # Create base logs for testing
        base_logs = []
        for i in range(5):
            log_data = {
                "message": f"Concurrent test log {i}",
                "severity": SeverityLevel.INFO.value,
                "source": f"concurrent-service-{i}"
            }
            
            response = test_client.post("/api/v1/logs/", json=log_data)
            assert response.status_code == 201
            base_logs.append(response.json())
        
        # Simulate concurrent reads
        read_responses = []
        for _ in range(10):
            response = test_client.get("/api/v1/logs/")
            read_responses.append(response)
        
        # All reads should succeed and be consistent
        for response in read_responses:
            assert response.status_code == 200
            data = response.json()
            assert data["total"] >= 5
        
        # Simulate concurrent updates to different logs
        update_responses = []
        for i, log in enumerate(base_logs):
            update_data = {"message": f"Concurrently updated log {i}"}
            response = test_client.put(f"/api/v1/logs/{log['id']}", json=update_data)
            update_responses.append(response)
        
        # All updates should succeed
        for response in update_responses:
            assert response.status_code == 200
        
        # Verify all updates are applied
        for i, log in enumerate(base_logs):
            get_response = test_client.get(f"/api/v1/logs/{log['id']}")
            assert get_response.status_code == 200
            updated_log = get_response.json()
            assert updated_log["message"] == f"Concurrently updated log {i}"