# Logs Dashboard Makefile
# Manages Docker Compose and testing workflows

.PHONY: help up down build restart logs clean test test-api test-frontend dev shell lint coverage

# Default target
.DEFAULT_GOAL := help

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Docker Compose files (consolidated)
COMPOSE_FILE := docker-compose.yml
DEV_PROFILE := --profile dev
API_TEST_PROFILE := --profile api-test
FRONTEND_TEST_PROFILE := --profile frontend-test

# Helper function to ensure .env files exist
define ensure-env-files
	@echo "$(YELLOW)Checking for .env files...$(NC)"
	@if [ ! -f api/.env ] && [ -f api/.env.example ]; then \
		echo "$(CYAN)Creating api/.env from api/.env.example$(NC)"; \
		cp api/.env.example api/.env; \
	fi
	@if [ ! -f frontend/.env ] && [ -f frontend/.env.example ]; then \
		echo "$(CYAN)Creating frontend/.env from frontend/.env.example$(NC)"; \
		cp frontend/.env.example frontend/.env; \
	fi
	@echo "$(GREEN)✓ Environment files ready$(NC)"
endef

## Help
help: ## Show this help message
	@echo "$(CYAN)Logs Dashboard - Makefile Commands$(NC)"
	@echo "=================================="
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / && $$1 ~ /^(up|down|build|restart|dev|api|frontend|db|logs|logs-api|logs-frontend|logs-db|shell-api|shell-frontend|shell-db)$$/ {printf "  $(CYAN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / && $$1 ~ /^(test|test-parallel|test-api|test-frontend|test-unit|test-integration|test-fast|test-ci|lint|coverage|test-hooks|test-components|test-utils|test-api-unit|test-api-integration|test-crud|watch-tests|type-check)$$/ {printf "  $(CYAN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / && $$1 ~ /^(format|clean|clean-frontend|install-frontend|env-setup|setup-test|status|health|dev-reset|quick-test|full-test|storybook)$$/ {printf "  $(CYAN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

## Development Commands
up: ## Start all services (frontend, API, database)
	@echo "$(YELLOW)Starting all services...$(NC)"
	$(call ensure-env-files)
	docker compose -f $(COMPOSE_FILE) $(DEV_PROFILE) up --build -d
	@echo "$(GREEN)✓ Services started!$(NC)"
	@echo "$(CYAN)Frontend: http://localhost:3000$(NC)"
	@echo "$(CYAN)API: http://localhost:8000$(NC)"

down: ## Stop and remove all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker compose -f $(COMPOSE_FILE) --profile "*" down -v
	@echo "$(GREEN)✓ Services stopped and volumes removed!$(NC)"

build: ## Build all Docker images
	@echo "$(YELLOW)Building all Docker images...$(NC)"
	$(call ensure-env-files)
	docker compose -f $(COMPOSE_FILE) build
	@echo "$(GREEN)✓ All images built!$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting all services...$(NC)"
	$(call ensure-env-files)
	docker compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)✓ Services restarted!$(NC)"

dev: up ## Start development environment (alias for up)

## Service-specific commands
api: ## Start only the API service
	@echo "$(YELLOW)Starting API service...$(NC)"
	$(call ensure-env-files)
	docker compose -f $(COMPOSE_FILE) up --build api -d
	@echo "$(GREEN)✓ API service started!$(NC)"
	@echo "$(CYAN)API: http://localhost:8000$(NC)"

frontend: ## Start only the frontend service
	@echo "$(YELLOW)Starting frontend service...$(NC)"
	$(call ensure-env-files)
	docker compose -f $(COMPOSE_FILE) up --build frontend -d
	@echo "$(GREEN)✓ Frontend service started!$(NC)"
	@echo "$(CYAN)Frontend: http://localhost:3000$(NC)"

db: ## Start only the database service
	@echo "$(YELLOW)Starting database service...$(NC)"
	docker compose -f $(COMPOSE_FILE) up db -d
	@echo "$(GREEN)✓ Database service started!$(NC)"
	@echo "$(CYAN)Database: localhost:5432$(NC)"

## Logs
logs: ## Show logs for all services
	docker compose -f $(COMPOSE_FILE) logs -f --tail=20

logs-api: ## Show API logs
	docker compose -f $(COMPOSE_FILE) logs api -f --tail=20

logs-frontend: ## Show frontend logs
	docker compose -f $(COMPOSE_FILE) logs frontend -f --tail=20

logs-db: ## Show database logs
	docker compose -f $(COMPOSE_FILE) logs db -f --tail=20

## Shell access
shell-api: ## Open shell in API container
	docker compose -f $(COMPOSE_FILE) exec api sh

shell-frontend: ## Open shell in frontend container
	docker compose -f $(COMPOSE_FILE) exec frontend sh

shell-db: ## Open PostgreSQL shell
	docker compose -f $(COMPOSE_FILE) exec db psql -U postgres -d logs_dashboard

## Testing Commands
test: ## Run all tests (API + Frontend)
	@echo "$(YELLOW)Running all tests...$(NC)"
	@chmod +x ./test-all.sh
	./test-all.sh all

test-parallel: ## Run all tests in parallel
	@echo "$(YELLOW)Running all tests in parallel...$(NC)"
	@chmod +x ./test-all.sh
	./test-all.sh parallel

test-api: ## Run API tests only
	@echo "$(YELLOW)Running API tests...$(NC)"
	@chmod +x ./api/test-api.sh
	./api/test-api.sh all

test-frontend: ## Run frontend tests only
	@echo "$(YELLOW)Running frontend tests...$(NC)"
	@chmod +x ./frontend/test-frontend.sh
	./frontend/test-frontend.sh

test-unit: ## Run unit tests for both API and frontend
	@echo "$(YELLOW)Running unit tests...$(NC)"
	@chmod +x ./test-all.sh
	./test-all.sh unit

test-integration: ## Run integration tests for both API and frontend
	@echo "$(YELLOW)Running integration tests...$(NC)"
	@chmod +x ./test-all.sh
	./test-all.sh integration

test-fast: ## Run fast tests (quick validation)
	@echo "$(YELLOW)Running fast tests...$(NC)"
	@chmod +x ./test-all.sh
	./test-all.sh fast

test-ci: ## Run full CI pipeline tests
	@echo "$(YELLOW)Running CI pipeline tests...$(NC)"
	@chmod +x ./test-all.sh
	./test-all.sh ci

## Code Quality
lint: ## Run linting for both API and frontend
	@echo "$(YELLOW)Running linting...$(NC)"
	@chmod +x ./test-all.sh
	./test-all.sh lint

coverage: ## Run tests with coverage reports
	@echo "$(YELLOW)Running coverage tests...$(NC)"
	@chmod +x ./test-all.sh
	./test-all.sh coverage

## Frontend-specific testing
test-hooks: ## Run frontend hooks tests
	@echo "$(YELLOW)Running frontend hooks tests with Docker...$(NC)"
	@echo "$(CYAN)Note: Using 'docker' mode for all tests in containerized environment$(NC)"
	@chmod +x ./frontend/test-frontend.sh
	./frontend/test-frontend.sh docker

test-components: ## Run frontend component tests
	@echo "$(YELLOW)Running frontend component tests with Docker...$(NC)"
	@echo "$(CYAN)Note: Using 'docker' mode for all tests in containerized environment$(NC)"
	@chmod +x ./frontend/test-frontend.sh
	./frontend/test-frontend.sh docker

test-utils: ## Run frontend utility tests
	@echo "$(YELLOW)Running frontend utility tests with Docker...$(NC)"
	@echo "$(CYAN)Note: Using 'docker' mode for all tests in containerized environment$(NC)"
	@chmod +x ./frontend/test-frontend.sh
	./frontend/test-frontend.sh docker

## API-specific testing
test-api-unit: ## Run API unit tests
	@echo "$(YELLOW)Running API unit tests...$(NC)"
	@chmod +x ./api/test-api.sh
	./api/test-api.sh unit

test-api-integration: ## Run API integration tests
	@echo "$(YELLOW)Running API integration tests...$(NC)"
	@chmod +x ./api/test-api.sh
	./api/test-api.sh integration

test-crud: ## Run API CRUD tests
	@echo "$(YELLOW)Running API CRUD tests...$(NC)"
	@chmod +x ./api/test-api.sh
	./api/test-api.sh crud

## Development Tools
watch-tests: ## Start frontend test watcher
	@echo "$(YELLOW)Starting test watcher with Docker...$(NC)"
	@chmod +x ./frontend/test-frontend.sh
	./frontend/test-frontend.sh docker-watch

format: ## Format frontend code with Prettier
	@echo "$(YELLOW)Formatting code with Docker...$(NC)"
	@chmod +x ./frontend/test-frontend.sh
	./frontend/test-frontend.sh docker-shell -c "bun run prettier"

type-check: ## Run TypeScript type checking
	@echo "$(YELLOW)Running type checking with Docker...$(NC)"
	@chmod +x ./frontend/test-frontend.sh
	./frontend/test-frontend.sh docker-shell -c "bun run lint"

## Maintenance
clean: ## Clean up Docker containers, volumes, and test environments
	@echo "$(YELLOW)Cleaning up Docker environment...$(NC)"
	docker compose -f $(COMPOSE_FILE) down -v --remove-orphans
	@if [ -f "$(API_TEST_COMPOSE_FILE)" ]; then \
		docker compose -f $(API_TEST_COMPOSE_FILE) down -v --remove-orphans; \
	fi
	@if [ -f "$(FRONTEND_TEST_COMPOSE_FILE)" ]; then \
		docker compose -f $(FRONTEND_TEST_COMPOSE_FILE) down -v --remove-orphans; \
	fi
	docker system prune -f
	@echo "$(YELLOW)Cleaning up test environments...$(NC)"
	@chmod +x ./test-all.sh
	./test-all.sh clean
	@echo "$(GREEN)✓ Cleanup completed!$(NC)"

clean-frontend: ## Clean frontend dependencies and reinstall
	@echo "$(YELLOW)Cleaning frontend dependencies with Docker...$(NC)"
	@chmod +x ./frontend/test-frontend.sh
	./frontend/test-frontend.sh docker-clean

install-frontend: ## Install/update frontend dependencies
	@echo "$(YELLOW)Installing frontend dependencies with Docker...$(NC)"
	@chmod +x ./frontend/test-frontend.sh
	./frontend/test-frontend.sh docker-build

env-setup: ## Create .env files from .env.example if they don't exist
	$(call ensure-env-files)

setup-test: ## Initial setup for test environment (build Docker images with no cache)
	@echo "$(YELLOW)Setting up test environment...$(NC)"
	@echo "$(CYAN)This will build fresh Docker images for testing$(NC)"
	@echo "$(YELLOW)Building API test image (multi-stage)...$(NC)"
	docker compose -f $(COMPOSE_FILE) $(API_TEST_PROFILE) build --no-cache api-test
	@echo "$(YELLOW)Building Frontend test image (multi-stage)...$(NC)"
	docker compose -f $(COMPOSE_FILE) $(FRONTEND_TEST_PROFILE) build --no-cache frontend-test
	@echo "$(GREEN)\u2713 Test environment setup complete!$(NC)"
	@echo "$(CYAN)Verifying Bun installation in frontend container...$(NC)"
	docker compose -f $(COMPOSE_FILE) $(FRONTEND_TEST_PROFILE) run --rm frontend-test bun --version
	@echo "$(GREEN)\u2713 All test images ready! You can now run 'make test'$(NC)"

## Status and Health
status: ## Show status of all services
	@echo "$(CYAN)Service Status:$(NC)"
	docker compose -f $(COMPOSE_FILE) ps

health: ## Check health of all services
	@echo "$(CYAN)Health Check:$(NC)"
	@echo "Frontend: $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "DOWN")"
	@echo "API: $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health 2>/dev/null || echo "DOWN")"
	@echo "Database: $$(docker compose -f $(COMPOSE_FILE) exec -T db pg_isready -U postgres 2>/dev/null || echo "DOWN")"

## Quick Development Workflows
dev-reset: ## Full development reset (clean + build + up)
	@echo "$(YELLOW)Performing full development reset...$(NC)"
	$(MAKE) clean
	$(MAKE) build
	$(MAKE) up
	@echo "$(GREEN)✓ Development environment reset complete!$(NC)"

quick-test: ## Quick test run (fast tests only)
	@echo "$(YELLOW)Running quick tests...$(NC)"
	$(MAKE) test-fast

full-test: ## Complete test suite with coverage
	@echo "$(YELLOW)Running complete test suite...$(NC)"
	$(MAKE) coverage

## Storybook
storybook: ## Start Storybook development server
	@echo "$(YELLOW)Starting Storybook...$(NC)"
	cd frontend && bun storybook
	@echo "$(CYAN)Storybook: http://localhost:6006$(NC)"