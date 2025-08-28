#!/bin/bash

echo "🐳 Testing Docker setup for Marketplace application"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

echo "✅ docker-compose is available"

# Build the images
echo "🔨 Building Docker images..."
docker-compose build

if [ $? -eq 0 ]; then
    echo "✅ Docker images built successfully"
else
    echo "❌ Failed to build Docker images"
    exit 1
fi

# Start the services
echo "🚀 Starting services..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ Services started successfully"
else
    echo "❌ Failed to start services"
    exit 1
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Test health endpoint
echo "🏥 Testing health endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ "$response" = "200" ]; then
    echo "✅ Health endpoint is responding"
else
    echo "❌ Health endpoint is not responding (HTTP $response)"
    echo "📋 Checking logs..."
    docker-compose logs web
fi

# Show running containers
echo "📊 Running containers:"
docker-compose ps

echo ""
echo "🎉 Docker setup test completed!"
echo "📝 You can now:"
echo "   - Access the application at http://localhost:3000"
echo "   - View logs with: docker-compose logs -f"
echo "   - Stop services with: docker-compose down"
echo "   - Access Rails console with: docker-compose exec web rails console"