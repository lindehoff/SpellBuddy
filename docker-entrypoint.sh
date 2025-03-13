#!/bin/sh
set -e

# Ensure proper permissions for data directory
chmod -R 755 /app/data
touch /app/data/sqlite.db
chmod 666 /app/data/sqlite.db

# Initialize database if it does not exist
if [ ! -s "/app/data/sqlite.db" ]; then
  echo "Database does not exist or is empty. Initializing..."
  npm run db:generate
  sleep 2
  npm run db:migrate || echo "Migration failed, but continuing startup"
else
  # Check if we need to run migrations
  echo "Checking for pending migrations..."
  npm run db:migrate || echo "Migration failed, but continuing startup"
fi

# Start the application
exec npm start 