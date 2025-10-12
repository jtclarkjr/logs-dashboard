# Logs Dashboard

A full-stack application for monitoring and analyzing logs.

## Project Structure

```
logs-dashboard/
├── api/          # Python backend API
└── frontend/     # Next.js frontend application
```

## Getting Started

### Quick Start with Docker

Run the entire application stack with Docker Compose:

```bash
docker compose up --build -d
```

show api docker logs:
```bash
docker compose logs api -f --tail=20
```

show frontend docker logs: 
```bash
docker compose logs frontend -f --tail=20
```

This will start both the frontend and API services. The application will be available at:
- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`

### Manual Setup

#### Prerequisites

- Python 3.x (for API)
- Bun (JavaScript runtime and package manager)
- Docker & Docker Compose (for containerized deployment)

#### Frontend Setup

**Option 1: Docker Compose**
```bash
docker-compose up --build frontend
```

**Option 2: Manual Setup**
```bash
cd frontend
bun install
bun dev
```

The frontend will be available at `http://localhost:3000`

#### API Setup

**Option 1: Docker Compose**
```bash
docker-compose up --build api
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
