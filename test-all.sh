#!/bin/bash

# Master test runner for logs dashboard (API + Frontend)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${MAGENTA}Logs Dashboard - Complete Test Suite${NC}"
echo "=========================================="

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to run API tests
run_api_tests() {
    local test_type="$1"
    print_section "API Tests ($test_type)"
    
    if [ ! -f "./api/test-api.sh" ]; then
        echo -e "${RED}Error: test-api.sh not found${NC}"
        return 1
    fi
    
    if ./api/test-api.sh "$test_type"; then
        echo -e "${GREEN}✓ API tests ($test_type) passed!${NC}"
        return 0
    else
        echo -e "${RED}✗ API tests ($test_type) failed!${NC}"
        return 1
    fi
}

# Function to run frontend tests
run_frontend_tests() {
    local test_type="$1"
    print_section "Frontend Tests ($test_type)"
    
    if [ ! -f "./frontend/test-frontend.sh" ]; then
        echo -e "${RED}Error: test-frontend.sh not found${NC}"
        return 1
    fi
    
    if ./frontend/test-frontend.sh "$test_type"; then
        echo -e "${GREEN}✓ Frontend tests ($test_type) passed!${NC}"
        return 0
    else
        echo -e "${RED}✗ Frontend tests ($test_type) failed!${NC}"
        return 1
    fi
}

# Function to run parallel tests (if supported)
run_parallel_tests() {
    local api_test_type="$1"
    local frontend_test_type="$2"
    
    print_section "Running Tests in Parallel"
    echo -e "${CYAN}API: $api_test_type | Frontend: $frontend_test_type${NC}"
    
    # Create temporary files for capturing exit codes
    api_result_file="/tmp/api_test_result.$$"
    frontend_result_file="/tmp/frontend_test_result.$$"
    
    # Run tests in parallel
    (run_api_tests "$api_test_type"; echo $? > "$api_result_file") &
    api_pid=$!
    
    (run_frontend_tests "$frontend_test_type"; echo $? > "$frontend_result_file") &
    frontend_pid=$!
    
    # Wait for both to complete
    wait $api_pid
    wait $frontend_pid
    
    # Read results
    api_result=$(cat "$api_result_file" 2>/dev/null || echo "1")
    frontend_result=$(cat "$frontend_result_file" 2>/dev/null || echo "1")
    
    # Cleanup temp files
    rm -f "$api_result_file" "$frontend_result_file"
    
    # Return combined result
    if [ "$api_result" -eq 0 ] && [ "$frontend_result" -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# Check if required scripts exist
check_scripts() {
    if [ ! -f "./api/test-api.sh" ]; then
        echo -e "${RED}Error: test-api.sh not found in api directory${NC}"
        echo "Make sure you're running this from the project root"
        exit 1
    fi
    
    if [ ! -f "./frontend/test-frontend.sh" ]; then
        echo -e "${RED}Error: test-frontend.sh not found in frontend directory${NC}"
        echo "Make sure you're running this from the project root"
        exit 1
    fi
    
    # Make sure scripts are executable
    chmod +x ./api/test-api.sh
    chmod +x ./frontend/test-frontend.sh
}

# Default test suite
TEST_SUITE=${1:-"all"}

# Initialize failure counter
FAILED_COMPONENTS=0

# Check prerequisites
check_scripts

case $TEST_SUITE in
    "all")
        echo "Running complete test suite for both API and Frontend..."
        run_api_tests "all" || ((FAILED_COMPONENTS++))
        run_frontend_tests "all" || ((FAILED_COMPONENTS++))
        ;;
    "parallel")
        echo "Running API and Frontend tests in parallel..."
        run_parallel_tests "all" "all" || ((FAILED_COMPONENTS++))
        ;;
    "unit")
        echo "Running unit tests for both API and Frontend..."
        run_api_tests "unit" || ((FAILED_COMPONENTS++))
        run_frontend_tests "unit" || ((FAILED_COMPONENTS++))
        ;;
    "integration")
        echo "Running integration tests for both API and Frontend..."
        run_api_tests "integration" || ((FAILED_COMPONENTS++))
        run_frontend_tests "integration" || ((FAILED_COMPONENTS++))
        ;;
    "fast")
        echo "Running fast tests for both API and Frontend..."
        run_api_tests "fast" || ((FAILED_COMPONENTS++))
        run_frontend_tests "fast" || ((FAILED_COMPONENTS++))
        ;;
    "coverage")
        echo "Running coverage reports for both API and Frontend..."
        run_api_tests "coverage" || ((FAILED_COMPONENTS++))
        run_frontend_tests "coverage" || ((FAILED_COMPONENTS++))
        ;;
    "api-only")
        echo "Running API tests only..."
        run_api_tests "all" || ((FAILED_COMPONENTS++))
        ;;
    "frontend-only")
        echo "Running Frontend tests only..."
        run_frontend_tests "all" || ((FAILED_COMPONENTS++))
        ;;
    "lint")
        echo "Running linting for both API and Frontend..."
        run_frontend_tests "lint" || ((FAILED_COMPONENTS++))
        echo -e "${YELLOW}Note: API linting is included in API tests${NC}"
        ;;
    "quick")
        echo "Running quick validation tests..."
        run_api_tests "fast" || ((FAILED_COMPONENTS++))
        run_frontend_tests "fast" || ((FAILED_COMPONENTS++))
        ;;
    "ci")
        echo "Running CI/CD pipeline tests..."
        print_section "CI/CD Pipeline - Phase 1: Linting"
        run_frontend_tests "lint" || ((FAILED_COMPONENTS++))
        
        print_section "CI/CD Pipeline - Phase 2: Unit Tests"
        run_api_tests "unit" || ((FAILED_COMPONENTS++))
        run_frontend_tests "unit" || ((FAILED_COMPONENTS++))
        
        print_section "CI/CD Pipeline - Phase 3: Integration Tests"
        run_api_tests "integration" || ((FAILED_COMPONENTS++))
        run_frontend_tests "integration" || ((FAILED_COMPONENTS++))
        
        print_section "CI/CD Pipeline - Phase 4: Coverage"
        run_api_tests "coverage" || ((FAILED_COMPONENTS++))
        run_frontend_tests "coverage" || ((FAILED_COMPONENTS++))
        ;;
    "debug")
        echo "Running debug tests with verbose output..."
        run_api_tests "debug" || ((FAILED_COMPONENTS++))
        run_frontend_tests "debug" || ((FAILED_COMPONENTS++))
        ;;
    "clean")
        echo "Cleaning up test environments..."
        print_section "Cleaning API Test Environment"
        ./api/test-api.sh clean
        
        print_section "Cleaning Frontend Test Environment"
        ./frontend/test-frontend.sh clean
        
        echo -e "${GREEN}✓ Cleanup completed for both environments${NC}"
        ;;
    "help")
        echo "Available commands:"
        echo ""
        echo "  Test Suites:"
        echo "    all         - Run all tests for both API and Frontend (default)"
        echo "    parallel    - Run API and Frontend tests in parallel"
        echo "    unit        - Run unit tests for both components"
        echo "    integration - Run integration tests for both components"
        echo "    fast        - Run fast tests for both components"
        echo "    coverage    - Run coverage reports for both components"
        echo ""
        echo "  Component-Specific:"
        echo "    api-only      - Run API tests only"
        echo "    frontend-only - Run Frontend tests only"
        echo "    lint          - Run linting for both components"
        echo ""
        echo "  Special Modes:"
        echo "    quick       - Quick validation (fast tests)"
        echo "    ci          - Full CI/CD pipeline simulation"
        echo "    debug       - Debug mode with verbose output"
        echo "    clean       - Clean up both test environments"
        echo "    help        - Show this help message"
        echo ""
        echo "  Examples:"
        echo "    ./test-all.sh                    # Run all tests"
        echo "    ./test-all.sh parallel           # Run tests in parallel"
        echo "    ./test-all.sh unit               # Run unit tests only"
        echo "    ./test-all.sh ci                 # Full CI pipeline"
        echo "    ./test-all.sh quick              # Quick validation"
        echo ""
        echo "  Individual Test Scripts:"
        echo "    ./api/test-api.sh help           # API-specific options"
        echo "    ./frontend/test-frontend.sh help # Frontend-specific options"
        ;;
    *)
        echo -e "${RED}Unknown command: $TEST_SUITE${NC}"
        echo "Run './test-all.sh help' for available options"
        exit 1
        ;;
esac

# Final summary
if [ $FAILED_COMPONENTS -eq 0 ] && [ "$TEST_SUITE" != "help" ] && [ "$TEST_SUITE" != "clean" ]; then
    print_section "Test Results Summary"
    echo -e "${GREEN}All tests completed successfully!${NC}"
    echo -e "${CYAN}API: Ready${NC}"
    echo -e "${CYAN}Frontend: Ready${NC}"
    echo -e "${MAGENTA}Application: Ready for deployment${NC}"
    exit 0
elif [ "$TEST_SUITE" != "help" ] && [ "$TEST_SUITE" != "clean" ]; then
    print_section "Test Results Summary"
    echo -e "${RED} $FAILED_COMPONENTS component(s) failed testing${NC}"
    
    if [ $FAILED_COMPONENTS -eq 1 ]; then
        echo -e "${YELLOW}  One component has issues - check logs above${NC}"
    else
        echo -e "${YELLOW}  Multiple components have issues - check logs above${NC}"
    fi
    
    echo -e "${CYAN} Run individual test scripts for detailed debugging:${NC}"
    echo -e "${CYAN}   ./api/test-api.sh debug${NC}"
    echo -e "${CYAN}   ./frontend/test-frontend.sh debug${NC}"
    exit 1
fi
