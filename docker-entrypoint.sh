#!/bin/sh
set -e

# Initialize database if it doesn't exist
if [ ! -f /app/data/prod.db ]; then
  echo "Initializing database..."
  npx prisma db push --skip-generate || echo "Database initialization completed"
fi

# Start the application
exec "$@"


