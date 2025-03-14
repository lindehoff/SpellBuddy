#!/bin/sh
set -e

# Print environment information for debugging
echo "Starting SpellBuddy application..."
echo "NODE_ENV: $NODE_ENV"
echo "Database path: /app/data/sqlite.db"

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "WARNING: OPENAI_API_KEY is not set. The application may not function correctly."
else
  echo "OpenAI API key is configured."
fi

# Check if JWT_SECRET is set
if [ -z "$JWT_SECRET" ]; then
  echo "WARNING: JWT_SECRET is not set. Authentication may not work correctly."
else
  echo "JWT_SECRET is configured."
fi

# Check if OPENAI_MODEL is set
if [ -z "$OPENAI_MODEL" ]; then
  echo "Using default OpenAI model: gpt-4o-mini"
else
  echo "Using OpenAI model: $OPENAI_MODEL"
fi

# Check if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Using DATABASE_URL: $DATABASE_URL"
fi

# Ensure proper permissions for data directory
chmod -R 755 /app/data
touch /app/data/sqlite.db
chmod 666 /app/data/sqlite.db

# Ensure drizzle directories exist with proper permissions
mkdir -p /app/drizzle/migrations /app/drizzle/meta
chmod -R 755 /app/drizzle

# Create empty journal file if it doesn't exist
if [ ! -f "/app/drizzle/meta/_journal.json" ]; then
  echo "Creating empty journal file..."
  echo '{"version":"5","entries":[]}' > /app/drizzle/meta/_journal.json
  chmod 644 /app/drizzle/meta/_journal.json
fi

# Initialize database if it does not exist
if [ ! -s "/app/data/sqlite.db" ]; then
  echo "Database does not exist or is empty. Initializing..."
  npm run db:generate || echo "Schema generation failed, but continuing startup"
  sleep 2
  npm run db:migrate || echo "Migration failed, but continuing startup"
else
  # Check if we need to run migrations
  echo "Checking for pending migrations..."
  npm run db:migrate || echo "Migration failed, but continuing startup"
fi

# Start the application
echo "Starting Next.js application..."
exec npm start 