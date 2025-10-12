#!/bin/bash

# Docker-based test runner for logs dashboard API

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Docker-based Test Runner${NC}"
echo "=================================="

# Function to run tests with Docker
run_docker_tests() {
    local test_type="$1"
    local extra_args="$2"
    
    echo -e "\n${YELLOW}Running $test_type tests with Docker...${NC}"
    
    # Build and run tests using internal script
    if docker-compose -f docker-compose.test.yml run --rm api /app/test_runner.sh $extra_args; then
        echo -e "${GREEN} $test_type tests passed!${NC}"
        return 0
    else
        echo -e "${RED} $test_type tests failed!${NC}"
        return 1
    fi
}

# Default to running all tests if no argument provided
TEST_SUITE=${1:-"all"}

# Start test database
echo -e "${YELLOW}Starting test database...${NC}"
docker-compose -f docker-compose.test.yml up -d db

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 5

case $TEST_SUITE in
    "all")
        echo "Running complete test suite..."
        run_docker_tests "All" "all"
        ;;
    "unit")
        echo "Running unit tests only..."
        run_docker_tests "Unit" "unit"
        ;;
    "integration")
        echo "Running integration tests only..."
        run_docker_tests "Integration" "integration"
        ;;
    "api")
        echo "Running API endpoint tests..."
        run_docker_tests "API Endpoints" "api"
        ;;
    "crud")
        echo "Running CRUD operation tests..."
        run_docker_tests "CRUD" "api"
        ;;
    "analytics")
        echo "Running analytics tests..."
        run_docker_tests "Analytics" "api"
        ;;
    "utilities")
        echo "Running utilities tests..."
        run_docker_tests "Utilities" "api"
        ;;
    "coverage")
        echo "Running tests with detailed coverage report..."
        run_docker_tests "Coverage" "coverage"
        echo -e "${GREEN} Coverage report will be in api/htmlcov/index.html${NC}"
        ;;
    "fast")
        echo "Running fast tests (excluding slow tests)..."
        run_docker_tests "Fast" "fast"
        ;;
    "debug")
        echo "Running tests with debug output..."
        run_docker_tests "Debug" "debug"
        ;;
    "build-only")
        echo "Building test image only..."
        if docker-compose -f docker-compose.test.yml build api; then
            echo -e "${GREEN} Test image built successfully!${NC}"
        else
            echo -e "${RED} Failed to build test image!${NC}"
            exit 1
        fi
        ;;
    "shell")
        echo "Opening shell in test container..."
        docker-compose -f docker-compose.test.yml run --rm api sh
        ;;
    "clean")
        echo "Cleaning up test containers and volumes..."
        docker-compose -f docker-compose.test.yml down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN} Cleanup completed!${NC}"
        ;;
    "help")
        echo "Available commands:"
        echo "  all         - Run all tests (default)"
        echo "  unit        - Run unit tests only"
        echo "  integration - Run integration tests only"
        echo "  api         - Run API endpoint tests"
        echo "  crud        - Run CRUD operation tests"
        echo "  analytics   - Run analytics tests"
        echo "  utilities   - Run utilities tests"
        echo "  coverage    - Run tests with detailed coverage"
        echo "  build-only  - Build test image only"
        echo "  shell       - Open shell in test container"
        echo "  clean       - Clean up test containers and volumes"
        echo "  help        - Show this help message"
        ;;
    *)
        echo -e "${RED}Unknown command: $TEST_SUITE${NC}"
        echo "Run './test-docker.sh help' for available options"
        exit 1
        ;;
esac

# Cleanup
if [ "$TEST_SUITE" != "shell" ] && [ "$TEST_SUITE" != "build-only" ] && [ "$TEST_SUITE" != "clean" ]; then
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    docker-compose -f docker-compose.test.yml down
fi

# Final summary
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN} Docker test execution completed successfully!${NC}"
    exit 0
else
    echo -e "\n${RED} Some tests failed. Check the output above.${NC}"
    exit 1
fi
