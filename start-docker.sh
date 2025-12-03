#!/bin/bash

# Script om de Docker omgeving snel op te zetten

echo "🚀 Starting Prompt Database Docker environment..."

# Check of Docker draait
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is niet gestart. Start Docker eerst."
    exit 1
fi

# Build en start containers
echo "📦 Building and starting containers..."
docker-compose up -d --build

# Wacht even tot de container klaar is
echo "⏳ Waiting for container to be ready..."
sleep 5

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy || docker-compose exec -T app npx prisma db push

# Optioneel: seed de database
read -p "Wil je de database seeden met voorbeelddata? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    docker-compose exec -T app npm run db:seed
fi

echo ""
echo "✅ Klaar! De applicatie draait op http://localhost:3300"
echo ""
echo "Handige commands:"
echo "  - Logs bekijken: docker-compose logs -f app"
echo "  - Container stoppen: docker-compose down"
echo "  - Database resetten: docker-compose exec app npx prisma migrate reset"
echo ""

