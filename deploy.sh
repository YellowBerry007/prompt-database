#!/bin/bash

# Deployment script voor Hertzner server
# Gebruik: ./deploy.sh [--setup] [--key=/path/to/key]

set -e

SERVER="root@46.224.72.129"
REMOTE_REPO="/opt/prompt-database"
APP_DIR="/opt/prompt-database-app"
SSH_KEY=""

# Parse arguments
for arg in "$@"; do
    case $arg in
        --setup)
            SETUP=true
            shift
            ;;
        --key=*)
            SSH_KEY="${arg#*=}"
            shift
            ;;
        *)
            ;;
    esac
done

# SSH command met key als die is opgegeven
if [ -n "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY -o StrictHostKeyChecking=no"
else
    SSH_CMD="ssh -o StrictHostKeyChecking=no"
fi

echo "🚀 Deploying naar Hertzner server..."

# Push naar remote repository
echo "📤 Pushing code naar server..."
if [ -n "$SSH_KEY" ]; then
    GIT_SSH_COMMAND="ssh -i $SSH_KEY -o StrictHostKeyChecking=no" git push hertzner main
else
    git push hertzner main
fi

# Pull en update op de server
echo "🔄 Updating applicatie op server..."
$SSH_CMD $SERVER << EOF
  cd $APP_DIR
  git pull origin main
  
  # Rebuild en restart Docker containers
  echo "🐳 Rebuilding containers..."
  docker-compose down
  docker-compose up -d --build
  
  # Database migrations
  echo "🗄️ Running database migrations..."
  docker-compose exec -T app npx prisma migrate deploy || true
  
  echo "✅ Code bijgewerkt en applicatie herstart"
EOF

# Run setup als gevraagd
if [ "$SETUP" = true ]; then
    echo "🔧 Running server setup..."
    $SSH_CMD $SERVER "bash $APP_DIR/setup-server.sh"
fi

echo "✅ Deployment voltooid!"
echo "📍 Applicatie is beschikbaar op: http://46.224.72.129/prompt-database"

