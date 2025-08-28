# Marketplace Application

A full-stack marketplace application built with Rails (backend) and React (frontend), containerized with Docker.

## Project Structure

```
marketplace/
├── backend/             # Rails backend code
│   ├── app/
│   ├── config/
│   ├── db/
│   ├── Gemfile
│   └── ...
├── frontend/            # Frontend code (React, etc.)
│   ├── package.json
│   ├── src/
│   ├── public/
│   └── ...
├── docker-compose.yml   # Docker setup for both frontend and backend
├── Makefile             # Common commands for both frontend and backend
└── README.md            # Project documentation
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Make (optional, for convenience commands)

### Setup and Run

1. **Clone and navigate to the project:**
   ```bash
   cd marketplace
   ```

2. **Build and start all services:**
   ```bash
   make setup
   ```
   
   Or manually:
   ```bash
   docker-compose build
   docker-compose up -d
   docker-compose exec backend bundle exec rails db:create db:migrate db:seed
   ```

3. **Access the application:**
   - Frontend: http://localhost (via nginx proxy)
   - Backend API: http://localhost/api/v1
   - Direct Frontend: http://localhost:5173
   - Direct Backend: http://localhost:3000
   - Sidekiq Web UI: http://localhost/sidekiq (development only)

## Development

### Available Make Commands

```bash
make help           # Show all available commands
make build          # Build all Docker images
make up             # Start all services
make down           # Stop all services
make logs           # Show logs for all services
make shell-backend  # Open shell in backend container
make shell-frontend # Open shell in frontend container
make test-backend   # Run backend tests
make test-frontend  # Run frontend tests
make clean          # Clean up containers and volumes
```

### Backend Development

The Rails backend includes:
- **API-first architecture** with JSON responses
- **Domain-driven design** using packs-rails
- **Authentication** with JWT tokens
- **Background jobs** with Sidekiq
- **Admin interface** with ActiveAdmin
- **Testing** with RSpec

Key backend commands:
```bash
make shell-backend
bundle exec rails console
bundle exec rspec
bundle exec rails db:migrate
```

### Frontend Development

The React frontend includes:
- **Modern React** with hooks and context
- **Routing** with React Router
- **HTTP client** with Axios
- **Testing** with Vitest and Testing Library
- **Build tool** with Vite

Key frontend commands:
```bash
make shell-frontend
npm run dev
npm test
npm run build
```

### Database Operations

```bash
make db-migrate     # Run migrations
make db-seed        # Seed database
make db-reset       # Reset database
```

## Services

The application consists of these Docker services:

- **db**: PostgreSQL database
- **redis**: Redis for caching and background jobs
- **backend**: Rails API server
- **sidekiq**: Background job processor
- **frontend**: React development server
- **nginx**: Reverse proxy (routes requests to frontend/backend)

## Environment Variables

### Backend (.env)
```
RAILS_ENV=development
DATABASE_URL=postgresql://marketplace:password@db:5432/marketplace_development
REDIS_URL=redis://redis:6379/0
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Marketplace
VITE_APP_VERSION=1.0.0
```

## Production Deployment

For production deployment:

1. **Build production images:**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Set production environment variables**

3. **Deploy with production compose file:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Testing

### Backend Tests
```bash
make test-backend
# or
docker-compose exec backend bundle exec rspec
```

### Frontend Tests
```bash
make test-frontend
# or
docker-compose exec frontend npm test
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80, 3000, 5173, 5432, 6379 are available
2. **Database connection**: Wait for database to be ready before starting backend
3. **Node modules**: Delete `node_modules` and reinstall if frontend fails to start
4. **Bundle issues**: Run `bundle install` in backend container if gems are missing

### Logs
```bash
make logs                           # All services
docker-compose logs backend         # Backend only
docker-compose logs frontend        # Frontend only
```

### Reset Everything
```bash
make clean
make setup
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.