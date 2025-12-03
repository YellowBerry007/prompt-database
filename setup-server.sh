#!/bin/bash

# Setup script voor Hertzner server
# Dit script installeert nginx en configureert de reverse proxy

set -e

APP_DIR="/opt/prompt-database-app"
NGINX_CONF="/etc/nginx/sites-available/prompt-database"
NGINX_ENABLED="/etc/nginx/sites-enabled/prompt-database"

echo "🚀 Setting up server voor prompt-database..."

# Check of nginx geïnstalleerd is
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing nginx..."
    apt-get update
    apt-get install -y nginx
fi

# Nginx configuratie kopiëren
echo "📝 Configuring nginx..."
cp $APP_DIR/nginx.conf $NGINX_CONF

# Symlink maken naar sites-enabled
if [ -L $NGINX_ENABLED ]; then
    rm $NGINX_ENABLED
fi
ln -s $NGINX_CONF $NGINX_ENABLED

# Test nginx configuratie
echo "🧪 Testing nginx configuration..."
nginx -t

# Nginx herstarten
echo "🔄 Restarting nginx..."
systemctl restart nginx
systemctl enable nginx

# Docker installeren als dat nog niet is gebeurd
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Docker Compose installeren
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# App directory
cd $APP_DIR

# Docker containers bouwen en starten
echo "🐳 Building and starting Docker containers..."
docker-compose down || true
docker-compose up -d --build

# Wachten tot de app klaar is
echo "⏳ Waiting for application to be ready..."
sleep 10

# Database initialiseren
echo "🗄️ Initializing database..."
docker-compose exec -T app npx prisma migrate deploy || true

echo "✅ Setup voltooid!"
echo "📍 Applicatie is beschikbaar op: http://46.224.72.129/prompt-database"
echo ""
echo "Handige commands:"
echo "  - Logs bekijken: cd $APP_DIR && docker-compose logs -f"
echo "  - App herstarten: cd $APP_DIR && docker-compose restart"
echo "  - Nginx status: systemctl status nginx"

