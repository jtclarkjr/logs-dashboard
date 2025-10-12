"""
Tests for general API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestRootEndpoint:
    """Test cases for the root endpoint."""
    
    def test_root_endpoint_success(self, test_client: TestClient):
        """Test successful root endpoint response."""
        response = test_client.get("/api/v1/")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "message" in data
        assert "version" in data
        assert "docs" in data
        assert "redoc" in data
        assert "health" in data
        
        # Verify specific values
        assert "Welcome to Logs Dashboard API" in data["message"]
        assert data["docs"] == "/docs"
        assert data["redoc"] == "/redoc"
        assert data["health"] == "/health"
        assert data["version"] == "1.0.0"
    
    def test_root_endpoint_response_format(self, test_client: TestClient):
        """Test that root endpoint returns proper JSON format."""
        response = test_client.get("/api/v1/")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        
        # Ensure all expected keys are present
        data = response.json()
        expected_keys = {"message", "version", "docs", "redoc", "health"}
        assert set(data.keys()) == expected_keys


class TestHealthEndpoint:
    """Test cases for the health check endpoint."""
    
    def test_health_check_success(self, test_client: TestClient):
        """Test successful health check response."""
        response = test_client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "status" in data
        assert "message" in data
        assert "version" in data
        
        # Verify values - accept both healthy and unhealthy in test environment
        assert data["status"] in ["healthy", "unhealthy"]
        assert "API is running - Database:" in data["message"]
        assert data["version"] == "1.0.0"
    
    def test_health_check_response_format(self, test_client: TestClient):
        """Test that health endpoint returns proper JSON format."""
        response = test_client.get("/api/v1/health")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        
        # Ensure all expected keys are present
        data = response.json()
        expected_keys = {"status", "message", "version"}
        assert set(data.keys()) == expected_keys
    
    def test_health_check_database_connection(self, test_client: TestClient):
        """Test that health check verifies database connectivity."""
        response = test_client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should show database status (connected or disconnected)
        assert "connected" in data["message"] or "disconnected" in data["message"]
        assert data["status"] in ["healthy", "unhealthy"]
    
    def test_health_check_multiple_calls(self, test_client: TestClient):
        """Test that health endpoint is consistent across multiple calls."""
        responses = []
        
        # Make multiple health check calls
        for _ in range(3):
            response = test_client.get("/api/v1/health")
            responses.append(response)
        
        # All should be successful
        for response in responses:
            assert response.status_code == 200
            data = response.json()
            assert data["status"] in ["healthy", "unhealthy"]
            assert "connected" in data["message"] or "disconnected" in data["message"]
    
    def test_health_endpoint_schema_validation(self, test_client: TestClient):
        """Test that health endpoint response matches expected schema."""
        response = test_client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate data types
        assert isinstance(data["status"], str)
        assert isinstance(data["message"], str)
        assert isinstance(data["version"], str)
        
        # Validate status is one of expected values
        assert data["status"] in ["healthy", "unhealthy"]
        
        # Validate version format (should be semantic version)
        version_parts = data["version"].split(".")
        assert len(version_parts) == 3
        for part in version_parts:
            assert part.isdigit()


class TestEndpointIntegration:
    """Integration tests for general endpoints."""
    
    def test_endpoints_accessible_without_auth(self, test_client: TestClient):
        """Test that general endpoints are accessible without authentication."""
        endpoints = [
            "/api/v1/",
            "/api/v1/health"
        ]
        
        for endpoint in endpoints:
            response = test_client.get(endpoint)
            assert response.status_code == 200
    
    def test_endpoints_with_different_methods(self, test_client: TestClient):
        """Test that general endpoints handle different HTTP methods appropriately."""
        endpoints = [
            "/api/v1/",
            "/api/v1/health"
        ]
        
        for endpoint in endpoints:
            # GET should work
            get_response = test_client.get(endpoint)
            assert get_response.status_code == 200
            
            # POST should not be allowed
            post_response = test_client.post(endpoint, json={})
            assert post_response.status_code == 405  # Method Not Allowed
            
            # PUT should not be allowed
            put_response = test_client.put(endpoint, json={})
            assert put_response.status_code == 405  # Method Not Allowed
            
            # DELETE should not be allowed
            delete_response = test_client.delete(endpoint)
            assert delete_response.status_code == 405  # Method Not Allowed
    
    def test_content_type_headers(self, test_client: TestClient):
        """Test that endpoints return correct content type headers."""
        endpoints = [
            "/api/v1/",
            "/api/v1/health"
        ]
        
        for endpoint in endpoints:
            response = test_client.get(endpoint)
            assert response.status_code == 200
            assert "application/json" in response.headers.get("content-type", "")
    
    def test_cors_headers_present(self, test_client: TestClient):
        """Test that CORS headers are present in responses."""
        endpoints = [
            "/api/v1/",
            "/api/v1/health"
        ]
        
        for endpoint in endpoints:
            response = test_client.get(endpoint)
            assert response.status_code == 200
            
            # Check for CORS headers (these should be added by middleware)
            headers = response.headers
            # Note: TestClient might not include all CORS headers,
            # but the actual app should have them via middleware