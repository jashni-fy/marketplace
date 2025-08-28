# Docker Setup for Marketplace Application

This document provides instructions for running the Marketplace application using Docker.

## Prerequisites

- Docker
- Docker Compose
- Make (optional, for using Makefile commands)

## Quick Start

1. **Clone the repository and navigate to the marketplace directory**
   ```bash
   cd marketplace
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

3. **Build and start the application**
   ```bash
   make setup
   # or manually:
   docker-compose build
   docker-compose up -d
   ```

The application will be available at:
- Web application: http://localhost (via nginx)
- Backend API: http://localhost/api/v1
- Sidekiq Web UI: http://localhost/sidekiq (development only)
- Direct backend access: http://localhost:3000
- Direct frontend access: http://localhost:5173

## Services

The Docker setup includes the following services:

### Development Services
- **db**: PostgreSQL 15 database server
- **redis**: Redis server for caching and background jobs
- **backend**: Rails API server with Active Storage for file uploads
- **sidekiq**: Background job processor for image processing
- **frontend**: React development server with Vite
- **nginx**: Reverse proxy routing requests to backend/frontend

### Production Services
- **db**: PostgreSQL 15 database server
- **redis**: Redis server with persistence
- **web**: Rails API server (production build)
- **sidekiq**: Background job processor
- **frontend**: Static React build served by nginx
- **nginx**: Production reverse proxy with static file serving

## Available Make Commands

| Command | Description |
|---------|-------------|
| `make build` | Build Docker images |
| `make up` | Start all services |
| `make up-d` | Start all services in detached mode |
| `make down` | Stop all services |
| `make logs` | View logs from all services |
| `make shell` | Open bash shell in web container |
| `make console` | Open Rails console |
| `make test` | Run test suite |
| `make setup` | Install gems and setup database |
| `make clean` | Clean up Docker resources |
| `make db-reset` | Reset database |
| `make bundle` | Install gems |
| `make migrate` | Run database migrations |
| `make rollback` | Rollback last migration |
| `make db-console` | Access PostgreSQL console |
| `make wait-for-db` | Wait for database to be ready |

## Development Workflow

1. **Start the application**
   ```bash
   make up
   ```

2. **Make code changes** - The application will automatically reload thanks to volume mounting

3. **Run tests**
   ```bash
   make test
   ```

4. **Access Rails console**
   ```bash
   make console
   ```

5. **View logs**
   ```bash
   make logs
   ```

## Environment Variables

Copy `.env.example` to `.env` and modify as needed:

```bash
cp .env.example .env
```

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection URL
- `REDIS_URL`: Redis connection URL
- `RAILS_ENV`: Rails environment (development/test/production)
- `JWT_SECRET_KEY`: Secret key for JWT token generation
- `DEVISE_SECRET_KEY`: Secret key for Devise authentication
- `POSTGRES_DB`: PostgreSQL database name
- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `RAILS_ACTIVE_STORAGE_SERVICE`: Active Storage service (local/amazon/google)

## New Features

### File Uploads and Image Processing
- **Active Storage**: Configured for local file storage with volume persistence
- **Image Processing**: Background jobs using Sidekiq for image optimization
- **Bulk Upload**: Support for multiple file uploads via API
- **Storage Volume**: Persistent storage mounted at `/rails/storage`

### Background Jobs
- **Sidekiq**: Configured for background job processing
- **Image Processing Jobs**: Automatic image processing after upload
- **Job Monitoring**: Sidekiq web interface available in development
- **Redis Persistence**: Job queue data persisted across restarts

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication for API access
- **Devise Integration**: User registration and authentication
- **Protected Routes**: Frontend route protection with authentication
- **CORS Configuration**: Proper cross-origin request handling

## Database

The application uses PostgreSQL 15 in all environments. The database data is persisted in a Docker volume named `postgres_data`. 

### Database Access

```bash
# Access PostgreSQL console
make db-console
# or
docker-compose exec db psql -U marketplace -d marketplace_development

# View database logs
docker-compose logs db

# Reset database
make db-reset
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, you can change it in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3001 to any available port
```

### Permission Issues
If you encounter permission issues, try:
```bash
sudo chown -R $USER:$USER .
```

### Clean Start
To start fresh:
```bash
make clean
make build
make up
make setup
```

### View Container Logs
To view logs for a specific service:
```bash
docker-compose logs web
docker-compose logs db
docker-compose logs redis
docker-compose logs sidekiq
```

## Production Deployment

For production deployment, use the production docker-compose file:

```bash
# Copy and configure production environment
cp .env.example .env.production
# Edit .env.production with production values

# Build and start production services
make prod-build
make prod-up

# Or manually:
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Production Environment Variables

Make sure to set these environment variables for production:

```bash
# Required production variables
MARKETPLACE_DATABASE_PASSWORD=secure_database_password
JWT_SECRET_KEY=secure_jwt_secret_key_here
DEVISE_SECRET_KEY=secure_devise_secret_key_here

# Optional SSL configuration
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/private.key
```

### Production Features

- **Static file serving**: Frontend assets served directly by nginx
- **File uploads**: Active Storage with local disk storage
- **Background jobs**: Sidekiq for image processing
- **Health checks**: Built-in health monitoring
- **Security headers**: Configured in nginx
- **Gzip compression**: Enabled for better performance
- **SSL ready**: Configure SSL certificates in nginx