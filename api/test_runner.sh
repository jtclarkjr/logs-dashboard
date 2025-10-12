#!/bin/bash
set -e

echo "Running tests in Docker container..."
echo "Working directory: $(pwd)"
echo "Python path: $PYTHONPATH"
echo "Environment: $ENVIRONMENT"
echo "Database URL: $DATABASE_URL"
echo "Debug mode: $DEBUG"
echo ""

# Run tests based on arguments
case "${1:-all}" in
    "coverage")
        echo "Running tests with coverage..."
        python -m pytest tests/ -v --cov=app --cov-report=html:htmlcov --cov-report=term-missing --cov-report=xml
        ;;
    "fast")
        echo "Running fast tests (excluding slow tests)..."
        python -m pytest tests/ -v -m "not slow" --tb=short
        ;;
    "integration")
        echo "Running integration tests only..."
        python -m pytest tests/integration/ -v --tb=short
        ;;
    "unit")
        echo "Running unit tests only..."
        python -m pytest tests/ -v -k "not integration" --tb=short
        ;;
    "api")
        echo "Running API tests only..."
        python -m pytest tests/api/ -v --tb=short
        ;;
    "debug")
        echo "Running tests with debug info..."
        python -m pytest tests/ -v -s --tb=long
        ;;
    *)
        echo "Running all tests..."
        if [ $# -eq 0 ] || [ "$1" = "all" ]; then
            python -m pytest tests/ -v --tb=short
        else
            python -m pytest tests/ -v --tb=short "$@"
        fi
        ;;
esac

echo "Tests completed!"
