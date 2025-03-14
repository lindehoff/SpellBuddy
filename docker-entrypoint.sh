#!/bin/sh
set -e

# Ensure proper permissions for data directory
chmod -R 755 /app/data
touch /app/data/sqlite.db
chmod 666 /app/data/sqlite.db

# Ensure drizzle directories exist
mkdir -p /app/drizzle/migrations /app/drizzle/meta
chmod -R 755 /app/drizzle

# Initialize database if it does not exist
if [ ! -s "/app/data/sqlite.db" ]; then
  echo "Database does not exist or is empty. Initializing..."
  npm run db:generate
  sleep 2
  npm run db:migrate
else
  # Check if we need to run migrations
  echo "Checking for pending migrations..."
  npm run db:migrate
fi

# Start the application
exec npm start 