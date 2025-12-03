#!/bin/sh
set -e

# Ensure data directory exists and has correct permissions
mkdir -p /app/data
chown -R nextjs:nodejs /app/data || true

# Fix permissions for Prisma engines
chown -R nextjs:nodejs /app/node_modules/@prisma 2>/dev/null || true
chmod -R u+w /app/node_modules/@prisma 2>/dev/null || true

# Initialize database if it doesn't exist
if [ ! -f /app/data/prod.db ]; then
  echo "Initializing database..."
  # Run as nextjs user
  su-exec nextjs npx prisma db push --skip-generate || echo "Database initialization completed"
fi

# Start the application
exec "$@"


