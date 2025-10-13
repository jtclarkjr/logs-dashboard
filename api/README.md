# API - Logs Dashboard

## Overview

A high-performance, production-ready REST API for log management and analytics,
built with modern Python frameworks and enterprise-grade architecture patterns.
Designed to handle large-scale log ingestion, complex querying, and real-time analytics.

## Tech Stack

- **FastAPI** - Modern, high-performance web framework for building APIs
- **Python 3.11+** - Latest Python with improved performance and typing features
- **Uvicorn** - Lightning-fast ASGI server with automatic reloading
- **Pydantic 2.5** - Data validation using Python type annotations
- **PostgreSQL 15** - Enterprise-grade relational database with ACID compliance
- **SQLAlchemy 2.0** - Modern Python SQL toolkit and ORM with async support
- **Alembic 1.12** - Database migration management system
- **psycopg2-binary** - High-performance PostgreSQL adapter for Python

### API Architecture

- REST API with OpenAPI 3.0 documentation, CORS support, and comprehensive validation

## Architecture & Design Decisions

### Framework Choice: FastAPI
- ASGI-based async framework delivering 3,000+ requests/second
- Zero-configuration API documentation with Swagger UI and ReDoc
- Type safety with Pydantic integration and modern Python features
- Automatic validation, dependency injection, and OpenAPI compliance

### Database Choice: PostgreSQL
- ACID compliance with advanced indexing and full-text search capabilities
- Connection pooling, partitioning, and MVCC for high concurrency
- Optimized for time-based queries, aggregations, and data retention

### ORM Choice: SQLAlchemy 2.0
- Async support, type safety, and performance optimizations with Alembic migrations
- Declarative models with relationship mapping and expressive query builder

### API Architecture Patterns
- Repository pattern with separation of concerns and shared CRUD operations
- Schema-first design with Pydantic validation and automatic documentation
- Centralized error handling, logging, CORS, and performance monitoring
- Comprehensive error handling strategy (see ERROR_STRATEGY.md)

#### Error Handling Strategy
Long explaination so moved to [Error Strategy](./ERROR_STRATEGY.md)

### Data Modeling Strategy

#### Log Entry Model Design
```python
class LogEntry(Base):
    id: int              # Primary key with auto-increment
    timestamp: datetime  # Indexed timestamp with timezone support
    message: str        # Full log message content
    severity: SeverityLevel  # Enum-constrained severity levels
    source: str         # Indexed source identifier
    created_at: datetime # Audit trail - record creation time
    updated_at: datetime # Audit trail - last modification time
```

- Primary, time-based, and filtering indexes for optimal query performance
- Enum-based validation with standardized levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)

## Interactive API Documentation

**FastAPI's Strongest Feature: Zero-Configuration Documentation**

One of the primary reasons for choosing FastAPI is its **automatic, interactive API documentation** that requires zero additional configuration or maintenance.

### Swagger UI Interface (`/docs`)

Interactive testing interface with live API calls, authentication support, and schema exploration.

**Access**: [http://localhost:8000/docs](http://localhost:8000/docs)

### ReDoc Interface (`/redoc`)

Production-ready documentation with responsive design, search functionality, and code examples.

**Access**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### OpenAPI 3.0 Specification

Machine-readable API contract with automatic generation and client SDK support.

**Access**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

## Key Features
- PostgreSQL database with comprehensive filtering, sorting, and pagination
- Analytics endpoints with CSV export and dashboard metrics
- Proper error handling, health checks, and sample data seeding


## API Endpoints

### General
- `GET /` - Welcome message and API information
- `GET /health` - Health check with database connectivity test

### **Endpoints**

#### **Log List Page Support**
- `GET /api/v1/logs` - Get logs with comprehensive filtering:
  - **Search**: `?search=database` (searches in message)
  - **Filter**: `?severity=ERROR&source=api-server&start_date=2024-01-01&end_date=2024-01-31`
  - **Sort**: `?sort_by=timestamp&sort_order=desc`
  - **Paginate**: `?page=1&page_size=50`
  - **Response**: Includes `total`, `total_pages`, `page`, `page_size`

#### **Log Detail Page Support** 
- `GET /api/v1/logs/{log_id}` - Get specific log for detail view
- `PUT /api/v1/logs/{log_id}` - Update log (partial updates supported)
- `DELETE /api/v1/logs/{log_id}` - Delete log with confirmation message

#### **Log Creation Page Support**
- `POST /api/v1/logs` - Create new log with validation:
  - Required: `message`, `severity`, `source`
  - Optional: `timestamp` (defaults to current time)
  - Full validation with error messages

#### **Dashboard Support**
- `GET /api/v1/logs/aggregation` - Complete dashboard data:
  - Total logs count
  - Breakdown by severity level
  - Top 10 sources with counts
  - Daily time series data
  - Supports date range and filtering

#### **Chart Data Support**
- `GET /api/v1/logs/chart-data` - Optimized for frontend charts:
  - **Time grouping**: `?group_by=hour|day|week|month`
  - **Filtering**: Same as logs endpoint
  - **Format**: Ready for Chart.js/D3.js consumption
  - **Data**: Includes severity breakdown per time period

#### **Metadata Support**
- `GET /api/v1/logs/metadata` - Frontend configuration data:
  - Available severity levels
  - All unique sources (for dropdowns)
  - Date range (earliest/latest logs)
  - Current statistics by severity
  - Sortable fields list
  - Pagination limits

### **Export Features**
- `GET /api/v1/logs/export/csv` - Export filtered logs as CSV file

## Database Schema

The application uses a PostgreSQL database with the following schema:

```sql
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL, -- DEBUG, INFO, WARNING, ERROR, CRITICAL
    source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_severity ON logs(severity);
CREATE INDEX idx_logs_source ON logs(source);
```

## Project Architecture

### FastAPI Structure
This project follows the **standard FastAPI project structure** with clear separation of concerns:

- **`app/api/`**: API routes organized by version and functionality
- **`app/core/`**: Core configuration, database setup, and dependencies
- **`app/crud/`**: Database operations separated from route handlers
- **`app/models/`**: SQLAlchemy database models
- **`app/schemas/`**: Pydantic models for request/response validation
- **`app/scripts/`**: Utility scripts (data seeding, migrations, etc.)
- **`main.py`**: Clean application entry point
- **`scripts.py`**: CLI interface for running utility scripts
