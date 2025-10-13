#!/bin/bash

# Bun-based test runner for logs dashboard frontend

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}Frontend Test Runner (Bun)${NC}"
echo "=================================="

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${RED}Error: Bun is not installed or not in PATH${NC}"
    echo "Please install Bun: https://bun.sh"
    exit 1
fi

# Function to check if we're in the frontend directory
ensure_frontend_dir() {
    if [ ! -f "package.json" ] || [ ! -d "frontend" ]; then
        if [ -d "frontend" ]; then
            echo -e "${YELLOW}Switching to frontend directory...${NC}"
            cd frontend
        else
            echo -e "${RED}Error: Could not find frontend directory${NC}"
            exit 1
        fi
    fi
}

# Function to install dependencies if needed
ensure_dependencies() {
    if [ ! -d "node_modules" ] || [ ! -f "bun.lockb" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        if ! bun install; then
            echo -e "${RED}Failed to install dependencies${NC}"
            exit 1
        fi
    fi
}

# Function to run linting
run_lint() {
    echo -e "\n${YELLOW}Running ESLint and TypeScript checks...${NC}"
    if bun run lint; then
        echo -e "${GREEN}✓ Linting passed!${NC}"
        return 0
    else
        echo -e "${RED}✗ Linting failed!${NC}"
        return 1
    fi
}

# Function to run specific test patterns
run_tests() {
    local test_type="$1"
    local pattern="$2"
    local extra_args="$3"
    
    echo -e "\n${YELLOW}Running $test_type tests...${NC}"
    
    if [ -n "$pattern" ]; then
        if bun test $pattern $extra_args; then
            echo -e "${GREEN}✓ $test_type tests passed!${NC}"
            return 0
        else
            echo -e "${RED}✗ $test_type tests failed!${NC}"
            return 1
        fi
    else
        if bun test $extra_args; then
            echo -e "${GREEN}✓ $test_type tests passed!${NC}"
            return 0
        else
            echo -e "${RED}✗ $test_type tests failed!${NC}"
            return 1
        fi
    fi
}

# Function to run tests with coverage
run_coverage() {
    echo -e "\n${YELLOW}Running tests with coverage...${NC}"
    if bun test --coverage --coverage-reporter text lib; then
        echo -e "${GREEN}✓ Tests with coverage completed!${NC}"
        echo -e "${CYAN}Coverage report generated${NC}"
        return 0
    else
        echo -e "${RED}✗ Tests with coverage failed!${NC}"
        return 1
    fi
}

# Function to watch tests
run_watch() {
    echo -e "\n${YELLOW}Starting test watcher...${NC}"
    echo -e "${CYAN}Press Ctrl+C to stop watching${NC}"
    bun test --watch
}

# Setup
ensure_frontend_dir
ensure_dependencies

# Default to running all tests if no argument provided
TEST_SUITE=${1:-"all"}

# Initialize test results tracking
FAILED_TESTS=0

case $TEST_SUITE in
    "all")
        echo "Running complete frontend test suite..."
        run_lint || ((FAILED_TESTS++))
        run_tests "All" "" || ((FAILED_TESTS++))
        ;;
    "hooks")
        echo "Running hooks tests only..."
        run_tests "Hooks" "lib/hooks/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "utils")
        echo "Running utility tests only..."
        run_tests "Utils" "lib/utils/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "services")
        echo "Running service tests only..."
        run_tests "Services" "lib/services/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "components")
        echo "Running component tests only..."
        run_tests "Components" "components/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "pages")
        echo "Running page tests only..."
        run_tests "Pages" "app/**/tests/*.test.*" || ((FAILED_TESTS++))
        ;;
    "state")
        echo "Running state management tests..."
        run_tests "State" "lib/hooks/state/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "query")
        echo "Running query hooks tests..."
        run_tests "Query" "lib/hooks/query/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "optimized")
        echo "Running optimized queries tests..."
        run_tests "Optimized Queries" "lib/hooks/query/tests/use-optimized-queries.test.ts" || ((FAILED_TESTS++))
        ;;
    "debounced")
        echo "Running debounced hooks tests..."
        run_tests "Debounced" "lib/hooks/utils/tests/use-debounced*.test.*" || ((FAILED_TESTS++))
        ;;
    "unit")
        echo "Running unit tests (excluding integration)..."
        run_tests "Unit" "lib/**/*.test.*" || ((FAILED_TESTS++))
        ;;
    "integration")
        echo "Running integration tests..."
        run_tests "Integration" "app/**/tests/*.test.*" || ((FAILED_TESTS++))
        ;;
    "lint")
        echo "Running linting only..."
        run_lint || ((FAILED_TESTS++))
        ;;
    "coverage")
        echo "Running tests with coverage report..."
        run_lint || ((FAILED_TESTS++))
        run_coverage || ((FAILED_TESTS++))
        ;;
    "watch")
        echo "Starting test watcher..."
        run_watch
        ;;
    "fast")
        echo "Running fast tests (no linting)..."
        run_tests "Fast" "" "--bail" || ((FAILED_TESTS++))
        ;;
    "verbose")
        echo "Running tests with verbose output..."
        run_lint || ((FAILED_TESTS++))
        run_tests "Verbose" "" "--verbose" || ((FAILED_TESTS++))
        ;;
    "bail")
        echo "Running tests (stop on first failure)..."
        run_tests "Bail" "" "--bail" || ((FAILED_TESTS++))
        ;;
    "debug")
        echo "Running tests with debug output..."
        run_tests "Debug" "" "--verbose --bail" || ((FAILED_TESTS++))
        ;;
    "install")
        echo "Installing/updating dependencies..."
        if bun install; then
            echo -e "${GREEN}✓ Dependencies installed successfully!${NC}"
        else
            echo -e "${RED}✗ Failed to install dependencies!${NC}"
            exit 1
        fi
        ;;
    "clean")
        echo "Cleaning node_modules and reinstalling..."
        rm -rf node_modules bun.lockb
        if bun install; then
            echo -e "${GREEN}✓ Clean install completed!${NC}"
        else
            echo -e "${RED}✗ Clean install failed!${NC}"
            exit 1
        fi
        ;;
    "type-check")
        echo "Running TypeScript type checking..."
        if bunx tsc --noEmit; then
            echo -e "${GREEN}✓ Type checking passed!${NC}"
        else
            echo -e "${RED}✗ Type checking failed!${NC}"
            ((FAILED_TESTS++))
        fi
        ;;
    "format")
        echo "Running code formatting..."
        if bun run prettier; then
            echo -e "${GREEN}✓ Code formatting completed!${NC}"
        else
            echo -e "${RED}✗ Code formatting failed!${NC}"
            ((FAILED_TESTS++))
        fi
        ;;
    "help")
        echo "Available commands:"
        echo ""
        echo "  Test Suites:"
        echo "    all         - Run all tests with linting (default)"
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
        echo "    fast        - Run tests without linting"
        echo "    verbose     - Run with verbose output"
        echo "    bail        - Stop on first failure"
        echo "    debug       - Run with debug output"
        echo ""
        echo "  Quality Checks:"
        echo "    lint        - Run ESLint and TypeScript checks only"
        echo "    type-check  - Run TypeScript type checking only"
        echo "    format      - Run code formatting (prettier)"
        echo ""
        echo "  Maintenance:"
        echo "    install     - Install/update dependencies"
        echo "    clean       - Clean install (removes node_modules)"
        echo "    help        - Show this help message"
        echo ""
        echo "  Examples:"
        echo "    ./test-frontend.sh                    # Run all tests"
        echo "    ./test-frontend.sh hooks              # Run only hooks tests"
        echo "    ./test-frontend.sh coverage           # Run with coverage"
        echo "    ./test-frontend.sh watch              # Start test watcher"
        echo "    ./test-frontend.sh fast               # Quick test run"
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
