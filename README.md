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

Remove the entire application stack with Docker Compose:

```bash
docker compose down -v
```

Show api docker logs:
```bash
docker compose logs api -f --tail=20
```

Show frontend docker logs: 
```bash
docker compose logs frontend -f --tail=20
```

This will start both the frontend and API services. The application will be available at:
- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`

### Manual Setup

#### Prerequisites (For non-docker options)

- Python 3.x
- Bun (Works as a runtime, package manager and testing)

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

```bash
cd frontend
bun storybook
```
The frontend storybook on local only will be available at `http://localhost:6006`

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

### Testing
To run all tests for api and frontend together, run script which is ran with docker from root
```bash
./test-all.sh all
```
or
```bash
chmod +x ./test-all.sh && ./test-all.sh all
```
To run individual: 

API: `./test-all.sh api-only` or `./test-api.sh`; Frontend: `./test-all.sh frontend-only` or `./test-frontend.sh`


Run `./test-all.sh help`, `./test-api.sh help`, or `./test-frontend.sh help` to to check which commands are available.  
