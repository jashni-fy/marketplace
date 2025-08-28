.PHONY: build up down logs shell test setup clean

# Build the Docker images
build:
	docker-compose build

# Start the application
up:
	docker-compose up

# Start the application in detached mode
up-d:
	docker-compose up -d

# Stop the application
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Open a shell in the web container
shell:
	docker-compose exec web bash

# Run tests
test:
	docker-compose exec web bundle exec rspec

# Setup the application (install gems, create/migrate database)
setup:
	docker-compose run --rm web bundle install
	docker-compose run --rm web rails db:create db:migrate

# Wait for database to be ready
wait-for-db:
	docker-compose exec db pg_isready -U marketplace -d marketplace_development

# Clean up Docker resources
clean:
	docker-compose down -v
	docker system prune -f

# Reset the database
db-reset:
	docker-compose exec web rails db:drop db:create db:migrate

# Access PostgreSQL console
db-console:
	docker-compose exec db psql -U marketplace -d marketplace_development

# Run Rails console
console:
	docker-compose exec web rails console

# Run Sidekiq console
sidekiq-console:
	docker-compose exec sidekiq bundle exec sidekiq-web

# Install new gems
bundle:
	docker-compose exec web bundle install

# Generate migration
migration:
	docker-compose exec web rails generate migration $(name)

# Run migration
migrate:
	docker-compose exec web rails db:migrate

# Rollback migration
rollback:
	docker-compose exec web rails db:rollback

# Production commands
prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-up:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f