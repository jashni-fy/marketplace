# Marketplace Application

A marketplace application that connects service vendors (photographers, videographers, event managers, etc.) with customers seeking their services.

## Architecture

This application is built using Rails 7.x with a packs-rails architecture for domain separation. The system is organized into the following domains:

- **User Management**: Handles authentication, user profiles, and user-related operations
- **Service Catalog**: Manages service listings, categories, and vendor portfolios  
- **Booking Management**: Handles bookings, scheduling, and customer-vendor interactions

## Prerequisites

### Option 1: Docker (Recommended)
- Docker
- Docker Compose

### Option 2: Local Development
- Ruby 3.2.4
- Rails 7.1.x
- PostgreSQL 15+
- Redis

## Quick Start with Docker

1. **Clone and setup**:
   ```bash
   cd marketplace
   ./scripts/dev-setup.sh
   ```

2. **Or manually**:
   ```bash
   # Build and start services
   docker-compose up -d
   
   # Setup database
   docker-compose exec web rails db:create db:migrate
   ```

3. **Access the application**:
   - Web app: http://localhost:3000
   - Health check: http://localhost:3000/health
   - Sidekiq UI: http://localhost:3000/sidekiq

### Docker Commands

Use the provided Makefile for common tasks:

```bash
make up          # Start all services
make down        # Stop all services
make logs        # View logs
make shell       # Open shell in web container
make console     # Open Rails console
make test        # Run tests
make setup       # Setup database
```

See [README.Docker.md](README.Docker.md) for detailed Docker instructions.

## Local Development Setup

1. Install dependencies:
   ```bash
   bundle install
   ```

2. Start PostgreSQL and Redis services:
   ```bash
   # On macOS with Homebrew:
   brew services start postgresql@15
   brew services start redis
   ```

3. Create and setup the database:
   ```bash
   bin/rails db:create
   bin/rails db:migrate
   ```

4. Start the Rails server:
   ```bash
   bin/rails server
   ```

5. Start Sidekiq for background jobs:
   ```bash
   bundle exec sidekiq
   ```

## Packs Structure

```
packs/
├── user_management/
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── services/
│   ├── spec/
│   └── package.yml
├── service_catalog/
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── services/
│   ├── spec/
│   └── package.yml
└── booking_management/
    ├── app/
    │   ├── controllers/
    │   ├── models/
    │   └── services/
    ├── spec/
    └── package.yml
```

## Configuration

- **Database**: PostgreSQL 15 for all environments, configured in `config/database.yml`
- **Redis**: Configured for Sidekiq and caching in `config/redis.yml`
- **CORS**: Enabled for API access in `config/initializers/cors.rb`
- **Packs**: Domain separation configured with packwerk
- **Docker**: Multi-environment setup with development and production configurations

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `REDIS_URL`: Redis connection URL
- `RAILS_ENV`: Environment (development/test/production)
- `FRONTEND_URL`: Frontend URL for CORS configuration

## Development

The application uses:
- Sidekiq for background job processing
- Redis for caching and session storage
- JWT tokens for API authentication
- CORS enabled for frontend integration