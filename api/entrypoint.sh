#!/bin/bash
set -e

echo "Starting application setup..."

# Wait for database to be ready (additional safety)
echo "Waiting for database to be ready..."
while ! python -c "from app.core.database import SessionLocal; db = SessionLocal(); db.close()" 2>/dev/null; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "Database is ready!"

# Create database tables first
echo "Creating database tables..."
python -c "from app.core.database import create_tables; create_tables()"

# Check if we need to seed data
echo "Checking if database needs seeding..."
python -c "
from app.core.database import SessionLocal
from app.models.log import LogEntry
db = SessionLocal()
count = db.query(LogEntry).count()
db.close()
exit(0 if count > 0 else 1)
" || {
    echo "No data found, seeding database with sample data..."
    python scripts.py seed-data --count 1000 --days 30
    echo "Database seeding completed!"
}

echo "Starting API server..."
exec "$@"