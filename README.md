# Logs Dashboard

A full-stack application for monitoring and analyzing logs.

## About This Project

This project uses a **Makefile** to simplify Docker Compose commands and script management. Instead of remembering complex `docker compose` commands or script paths, you can use simple `make` commands for all development workflows.

**Why Makefile?**
- **Simplified Commands:** `make up` instead of `docker compose up --build -d`
- **Consistent Interface:** All commands follow the same `make <action>` pattern
- **Script Integration:** Automatically handles test scripts with proper permissions
- **Better Discoverability:** `make help` shows all available commands
- **Workflow-Oriented:** Commands grouped by development tasks

## Project Structure

```
logs-dashboard/
├── api/          # Python backend API
└── frontend/     # Next.js frontend application
```

## Getting Started

### Quick Start with Makefile

> **Note:** This project uses a Makefile to wrap Docker Compose commands and test scripts for easier management. All `docker compose` commands and script executions are handled through `make` targets.

Run the entire application stack:

```bash
make up
```

Remove the entire application stack:

```bash
make down
```

Show API logs:
```bash
make logs-api
```

Show frontend logs:
```bash
make logs-frontend
```

This will start both the frontend and API services. The application will be available at:
- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`

### Available Makefile Commands

For a complete list of available commands, run:
```bash
make help
```

#### What the Makefile Manages

The Makefile wraps and simplifies these underlying commands:

### Common Development Workflows

#### Full Development Setup
```bash
# Start all services
make up

# View logs
make logs
```

#### Development Reset (Clean Slate)
```bash
# Complete reset - stops services, cleans up, rebuilds, and starts
make dev-reset
```

#### Service Management
```bash
# Start individual services
make api          # API only
make frontend     # Frontend only
make db           # Database only

# View service-specific logs
make logs-api     # API logs
make logs-frontend # Frontend logs
make logs-db      # Database logs

# Stop all services
make down
```

#### Quick Testing Workflow
```bash
# Fast validation
make quick-test

# Complete test suite with coverage
make full-test

# Continuous testing
make watch-tests
```

#### Maintenance
```bash
# Clean up everything
make clean

# Update frontend dependencies
make install-frontend

### Manual Setup

> **Note:** While the Makefile is the recommended approach, you can still use Docker Compose commands directly or run scripts manually if needed. The Makefile simply provides a more convenient interface.

#### Prerequisites (For non-docker options)

- Python 3.x
- Bun (Works as a runtime, package manager and testing)

#### Frontend Setup

**Option 1: Using Makefile (Recommended)**
```bash
make frontend
```

**Option 2: Manual Setup**
```bash
cd frontend
bun install
bun dev
```

The frontend will be available at `http://localhost:3000`

**Storybook Development**
```bash
make storybook
```
The frontend storybook will be available at `http://localhost:6006`

#### API Setup

**Option 1: Using Makefile (Recommended)**
```bash
make api
```

**Option 2: Manual Setup**
```bash
cd api
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the API
python main.py
```

The API will be available at `http://localhost:8000`

### Testing

#### Quick Testing Commands
```bash
# Run all tests (API + Frontend)
make test

# Run tests in parallel for faster execution
make test-parallel

# Quick validation tests
make test-fast

# Full CI pipeline simulation
make test-ci
```

#### Test Types
```bash
# Unit tests only
make test-unit

# Integration tests only
make test-integration

# Tests with coverage reports
make coverage

#### Component-Specific Testing
```bash
# API tests only
make test-api

# Frontend tests only
make test-frontend
```

#### Development Testing
```bash
# Continuous testing (frontend)
make watch-tests

# Code formatting
make format

# TypeScript type checking
make type-check
```

#### Getting Help
```bash
# All available make commands
make help

**Docker Compose Commands:**
- `make up` → `docker compose up --build -d`
- `make down` → `docker compose down -v`
- `make logs-api` → `docker compose logs api -f --tail=20`
- `make build` → `docker compose build`
- `make restart` → `docker compose restart`

**Test Script Execution:**
- `make test` → `chmod +x ./test-all.sh && ./test-all.sh all`
- `make test-api` → `chmod +x ./test-api.sh && ./test-api.sh all`
- `make test-frontend` → `chmod +x ./test-frontend.sh && ./test-frontend.sh all`

**Combined Workflows:**
- `make dev-reset` → Full cleanup, build, and startup sequence
- `make clean` → Docker cleanup + test environment cleanup
- `make health` → Service health checks using curl and Docker commands
