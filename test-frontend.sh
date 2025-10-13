#!/bin/bash

# Frontend test runner for logs dashboard (Docker)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}Frontend Test Runner (Bun + Docker)${NC}"
echo "=================================="

# Get the test suite argument first
TEST_SUITE=${1:-"all"}

# Always use Docker mode - no local Bun required
echo -e "${CYAN}Using Docker mode - Bun runs in container${NC}"
DOCKER_MODE=true


# Function to run tests with Docker
run_docker_tests() {
    local test_type="$1"
    local extra_args="$2"
    
    echo -e "\n${YELLOW}Running $test_type tests with Docker...${NC}"
    
    # Build and run tests using Docker Compose
    if docker-compose -f docker-compose.frontend-test.yml run --rm frontend bun test $extra_args; then
        echo -e "${GREEN}✓ $test_type tests passed!${NC}"
        return 0
    else
        echo -e "${RED}✗ $test_type tests failed!${NC}"
        return 1
    fi
}

# Initialize test results tracking
FAILED_TESTS=0

case $TEST_SUITE in
    "all")
        echo "Running complete frontend test suite with Docker..."
        run_docker_tests "All" "" || ((FAILED_TESTS++))
        ;;
    "hooks")
        echo "Running hooks tests with Docker..."
        run_docker_tests "Hooks" "lib/hooks/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "utils")
        echo "Running utility tests with Docker..."
        run_docker_tests "Utils" "lib/utils/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "services")
        echo "Running service tests with Docker..."
        run_docker_tests "Services" "lib/services/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "components")
        echo "Running component tests with Docker..."
        run_docker_tests "Components" "components/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "pages")
        echo "Running page tests with Docker..."
        run_docker_tests "Pages" "app/**/tests/*.test.*" || ((FAILED_TESTS++))
        ;;
    "state")
        echo "Running state management tests with Docker..."
        run_docker_tests "State" "lib/hooks/state/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "query")
        echo "Running query hooks tests with Docker..."
        run_docker_tests "Query" "lib/hooks/query/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "optimized")
        echo "Running optimized queries tests with Docker..."
        run_docker_tests "Optimized Queries" "lib/hooks/query/tests/use-optimized-queries.test.ts" || ((FAILED_TESTS++))
        ;;
    "debounced")
        echo "Running debounced hooks tests with Docker..."
        run_docker_tests "Debounced" "lib/hooks/utils/tests/use-debounced*.test.*" || ((FAILED_TESTS++))
        ;;
    "unit")
        echo "Running unit tests with Docker..."
        run_docker_tests "Unit" "lib/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "integration")
        echo "Running integration tests with Docker..."
        run_docker_tests "Integration" "app/**/tests/*.test.*" || ((FAILED_TESTS++))
        ;;
    "lint")
        echo "Running linting with Docker..."
        docker-compose -f docker-compose.frontend-test.yml run --rm frontend bun run lint || ((FAILED_TESTS++))
        ;;
    "coverage")
        echo "Running tests with coverage report using Docker..."
        run_docker_tests "Coverage" "--coverage --coverage-reporter text" || ((FAILED_TESTS++))
        ;;
    "watch")
        echo "Starting test watcher with Docker..."
        docker-compose -f docker-compose.frontend-test.yml run --rm frontend bun test --watch
        ;;
    "fast")
        echo "Running fast tests with Docker..."
        run_docker_tests "Fast" "--bail" || ((FAILED_TESTS++))
        ;;
    "verbose")
        echo "Running tests with verbose output using Docker..."
        run_docker_tests "Verbose" "--verbose" || ((FAILED_TESTS++))
        ;;
    "bail")
        echo "Running tests (stop on first failure) with Docker..."
        run_docker_tests "Bail" "--bail" || ((FAILED_TESTS++))
        ;;
    "debug")
        echo "Running tests with debug output using Docker..."
        run_docker_tests "Debug" "--verbose --bail" || ((FAILED_TESTS++))
        ;;
    "shell")
        echo "Opening shell in frontend Docker container..."
        docker-compose -f docker-compose.frontend-test.yml run --rm frontend sh
        ;;
    "build")
        echo "Building frontend test image..."
        if docker-compose -f docker-compose.frontend-test.yml build frontend; then
            echo -e "${GREEN}✓ Frontend test image built successfully!${NC}"
        else
            echo -e "${RED}✗ Failed to build frontend test image!${NC}"
            exit 1
        fi
        ;;
    "clean")
        echo "Cleaning up frontend test containers..."
        docker-compose -f docker-compose.frontend-test.yml down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN}✓ Docker cleanup completed!${NC}"
        ;;
    "install")
        echo "Building frontend test image (installs dependencies)..."
        if docker-compose -f docker-compose.frontend-test.yml build frontend; then
            echo -e "${GREEN}✓ Dependencies installed in Docker image!${NC}"
        else
            echo -e "${RED}✗ Failed to install dependencies!${NC}"
            exit 1
        fi
        ;;
    "type-check")
        echo "Running TypeScript type checking with Docker..."
        if docker-compose -f docker-compose.frontend-test.yml run --rm frontend bun run lint; then
            echo -e "${GREEN}✓ Type checking passed!${NC}"
        else
            echo -e "${RED}✗ Type checking failed!${NC}"
            ((FAILED_TESTS++))
        fi
        ;;
    "format")
        echo "Running code formatting with Docker..."
        if docker-compose -f docker-compose.frontend-test.yml run --rm frontend bun run prettier; then
            echo -e "${GREEN}✓ Code formatting completed!${NC}"
        else
            echo -e "${RED}✗ Code formatting failed!${NC}"
            ((FAILED_TESTS++))
        fi
        ;;
    "help")
        echo "Available commands (all run in Docker):"
        echo ""
        echo "  Test Suites:"
        echo "    all         - Run all tests (default)"
        echo "    unit        - Run unit tests (lib/**/*.test.*)"
        echo "    integration - Run integration tests (app/**/tests/*.test.*)"
        echo "    hooks       - Run hooks tests only"
        echo "    utils       - Run utility tests only"
        echo "    services    - Run service tests only"
        echo "    components  - Run component tests only"
        echo "    pages       - Run page tests only"
        echo "    state       - Run state management tests"
        echo "    query       - Run query hooks tests"
        echo "    optimized   - Run optimized queries tests"
        echo "    debounced   - Run debounced hooks tests"
        echo ""
        echo "  Test Modes:"
        echo "    coverage    - Run tests with coverage report"
        echo "    watch       - Start test watcher"
        echo "    fast        - Run tests (quick mode)"
        echo "    verbose     - Run with verbose output"
        echo "    bail        - Stop on first failure"
        echo "    debug       - Run with debug output"
        echo ""
        echo "  Quality Checks:"
        echo "    lint        - Run ESLint and TypeScript checks"
        echo "    type-check  - Run TypeScript type checking"
        echo "    format      - Run code formatting (prettier)"
        echo ""
        echo "  Container Management:"
        echo "    shell       - Open shell in Docker container"
        echo "    build       - Build frontend test image"
        echo "    clean       - Clean up Docker containers"
        echo "    install     - Build image (installs dependencies)"
        echo "    help        - Show this help message"
        echo ""
        echo "  Examples:"
        echo "    ./test-frontend.sh                    # Run all tests"
        echo "    ./test-frontend.sh hooks              # Run only hooks tests"
        echo "    ./test-frontend.sh coverage           # Run with coverage"
        echo "    ./test-frontend.sh watch              # Start test watcher"
        echo "    ./test-frontend.sh shell              # Open Docker shell"
        ;;
    *)
        echo -e "${RED}Unknown command: $TEST_SUITE${NC}"
        echo "Run './test-frontend.sh help' for available options"
        exit 1
        ;;
esac

# Final summary
if [ $FAILED_TESTS -eq 0 ] && [ "$TEST_SUITE" != "help" ] && [ "$TEST_SUITE" != "watch" ]; then
    echo -e "\n${GREEN} All frontend tests completed successfully!${NC}"
    echo -e "${CYAN}Frontend: Ready for deployment${NC}"
    exit 0
elif [ "$TEST_SUITE" != "help" ] && [ "$TEST_SUITE" != "watch" ]; then
    echo -e "\n${RED} $FAILED_TESTS test suite(s) failed${NC}"
    echo -e "${YELLOW}Check the output above for details${NC}"
    exit 1
fi
