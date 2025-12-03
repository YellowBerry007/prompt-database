#!/bin/sh
set -e

# Ensure data directory exists
mkdir -p /app/data

# Initialize database if it doesn't exist
# Run as root first to ensure we can write, then fix permissions
if [ ! -f /app/data/prod.db ]; then
  echo "Initializing database..."
  # Run prisma as root to avoid permission issues
  npx prisma db push --skip-generate || echo "Database initialization completed"
  # Fix ownership after creation
  chown -R nextjs:nodejs /app/data 2>/dev/null || true
fi

# Switch to nextjs user for running the app
if [ "$(id -u)" = "0" ]; then
  # If running as root, switch to nextjs user
  exec su-exec nextjs "$@"
else
  # Already running as nextjs or other user
  exec "$@"
fi


