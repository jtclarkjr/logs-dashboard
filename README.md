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

## Deployment

The application is deployed on Google Cloud Platform using Cloud Run:

- **Frontend**: https://logs-dashboard-1056575639677.asia-northeast1.run.app/
- **API**: https://logs-dashboard-api-1056575639677.asia-northeast1.run.app/docs

[Pull Request](https://github.com/jtclarkjr/logs-dashboard/pull/1) with details and comments regarding deployment

## Project Structure

```
logs-dashboard/
├── api/          # Python backend API
└── frontend/     # Next.js frontend application
```

Folder related Descisions and tech have seperate README files.

- [API README](/api/README.md)
- [Frontend README](/frontend/README.md)

## Getting Started

### Quick Start with Makefile

> **Note:** This project uses a Makefile to wrap Docker Compose commands and test scripts for easier management. All `docker compose` commands and script executions are handled through `make` targets. First initial docker build can take up to 140s with cpu limit 8 and memory limit 4GB after that it averages at 2s. Scripts use docker compose instead of docker-compose this should be ok if using Docker desktop.

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

#### Maintenance
```bash
# Clean up everything (warning removes all containers)
make clean
```

#### Prerequisites (For non-docker options)

- Python 3.x
- Bun (Works as a runtime, package manager and testing)



### Manual Setup

#### Frontend Setup

```bash
cd frontend
bun install
bun dev
```

The frontend will be available at `http://localhost:3000`

#### API Setup

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

#### Set up test environment 
Builds Docker images with fresh dependencies for test environment. The point is to not need to locally install deps like Bun to run tests.

```bash
make setup-test
```

#### Quick Testing Commands
```bash
# Run all tests (API + Frontend)
make test

# Run tests in parallel for faster execution
make test-parallel

# Quick validation tests
make test-fast
```

#### Test Types
```bash
# Unit tests only
make test-unit

# Integration tests only
make test-integration

# Tests with coverage reports
make coverage
```

#### Component-Specific Testing
```bash
# API tests only
make test-api

# Frontend tests only
make test-frontend
```

## Docker Configuration

### Dockerfiles (Multi-stage)
- `api/Dockerfile` - Multi-stage API image with `base`, `development`, `test`, and `production` stages
- `frontend/Dockerfile` - Multi-stage frontend image with `base`, `test`, `builder`, and `production` stages

### Docker Compose File (Consolidated)
- `docker-compose.yml` - Single file with profiles for all environments:
  - `--profile dev` - Development stack (API + Frontend + PostgreSQL)
  - `--profile api-test` - API test environment using `test` stage
  - `--profile frontend-test` - Frontend test environment using `test` stage

### Scripts
- `api/entrypoint.sh` - Database initialization and seeding for API container
- `api/test_runner.sh` - Configurable test runner supporting multiple test modes
- `api/test-api.sh` - Docker-based API test runner with cleanup
- `frontend/test-frontend.sh` - Docker-based frontend test runner with Bun
- `test-all.sh` - Master test orchestrator for both API and frontend
