#!/bin/bash

echo "🚀 Setting up Marketplace development environment"
echo "==============================================="

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update as needed."
else
    echo "✅ .env file already exists"
fi

# Build Docker images
echo "🔨 Building Docker images..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 5

# Install gems
echo "💎 Installing gems..."
docker-compose exec web bundle install

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Setup database
echo "🗄️ Setting up database..."
docker-compose exec web rails db:create
docker-compose exec web rails db:migrate

# Check if everything is working
echo "🏥 Testing application health..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ "$response" = "200" ]; then
    echo "✅ Application is healthy and ready!"
    echo ""
    echo "🎉 Development environment setup complete!"
    echo ""
    echo "📝 Available commands:"
    echo "   make up          - Start all services"
    echo "   make down        - Stop all services"
    echo "   make logs        - View logs"
    echo "   make shell       - Open shell in web container"
    echo "   make console     - Open Rails console"
    echo "   make test        - Run tests"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Web app: http://localhost:3000"
    echo "   Health:  http://localhost:3000/health"
    echo "   Sidekiq: http://localhost:3000/sidekiq (development only)"
else
    echo "❌ Application health check failed (HTTP $response)"
    echo "📋 Checking logs..."
    docker-compose logs web
fi