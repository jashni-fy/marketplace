# Marketplace Development Commands

.PHONY: help build up down logs shell-backend shell-frontend test-backend test-frontend clean

# Default target
help:
	@echo "Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  build          - Build all Docker images"
	@echo "  up             - Start all services"
	@echo "  down           - Stop all services"
	@echo "  logs           - Show logs for all services"
	@echo "  setup          - Initial setup (build and start)"
	@echo ""
	@echo "Production:"
	@echo "  prod-build     - Build production images"
	@echo "  prod-up        - Start production services"
	@echo "  prod-down      - Stop production services"
	@echo "  prod-logs      - Show production logs"
	@echo ""
	@echo "Development Tools:"
	@echo "  shell-backend  - Open shell in backend container"
	@echo "  shell-frontend - Open shell in frontend container"
	@echo "  test-backend   - Run backend tests"
	@echo "  test-frontend  - Run frontend tests"
	@echo "  sidekiq-web    - Access Sidekiq web interface"
	@echo ""
	@echo "Database:"
	@echo "  db-migrate     - Run database migrations"
	@echo "  db-seed        - Seed database with sample data"
	@echo "  db-reset       - Reset database (drop, create, migrate, seed)"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean          - Clean up containers and volumes"
	@echo "  storage-clean  - Clean uploaded files"
	@echo "  jobs-status    - Check background job status"
	@echo "  health         - Check service health"

# Build all images
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# Show logs
logs:
	docker-compose logs -f

# Backend shell
shell-backend:
	docker-compose exec backend bash

# Frontend shell
shell-frontend:
	docker-compose exec frontend sh

# Run backend tests
test-backend:
	docker-compose exec backend bundle exec rspec

# Run frontend tests
test-frontend:
	docker-compose exec frontend npm test

# Clean up
clean:
	docker-compose down -v
	docker system prune -f

# Initial setup
setup: build up
	@echo "Waiting for services to start..."
	@sleep 10
	@echo "Running database setup..."
	docker-compose exec backend bundle exec rails db:create db:migrate db:seed
	@echo "Setup complete! Access the application at http://localhost"

# Development helpers
dev-backend:
	docker-compose up -d db redis
	cd backend && bundle install && rails server

dev-frontend:
	cd frontend && npm install && npm run dev

# Database operations
db-migrate:
	docker-compose exec backend bundle exec rails db:migrate

db-seed:
	docker-compose exec backend bundle exec rails db:seed

db-reset:
	docker-compose exec backend bundle exec rails db:drop db:create db:migrate db:seed

# Install dependencies
install-backend:
	docker-compose exec backend bundle install

install-frontend:
	docker-compose exec frontend npm install

# Production commands
prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-up:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Sidekiq monitoring
sidekiq-web:
	@echo "Sidekiq web interface available at http://localhost/sidekiq (development only)"

# Storage and uploads
storage-clean:
	docker-compose exec backend rm -rf storage/*
	docker-compose exec backend mkdir -p storage

# Image processing jobs
jobs-status:
	docker-compose exec backend bundle exec rails runner "puts Sidekiq::Stats.new.inspect"

# Health checks
health:
	@echo "Checking service health..."
	@curl -f http://localhost/up || echo "Backend health check failed"
	@curl -f http://localhost/ || echo "Frontend health check failed"