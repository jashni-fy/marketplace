#!/bin/bash

echo "🗄️ Initializing PostgreSQL database"
echo "===================================="

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec db pg_isready -U marketplace -d marketplace_development; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Create database if it doesn't exist
echo "📝 Creating database..."
docker-compose exec web rails db:create

# Run migrations
echo "🔄 Running migrations..."
docker-compose exec web rails db:migrate

# Seed database (if seeds exist)
if [ -f db/seeds.rb ] && [ -s db/seeds.rb ]; then
    echo "🌱 Seeding database..."
    docker-compose exec web rails db:seed
else
    echo "ℹ️ No seeds found, skipping seeding"
fi

echo "✅ Database initialization complete!"