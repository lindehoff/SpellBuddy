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
  # Print first 10 characters and length of the API key
  OPENAI_KEY_LENGTH=${#OPENAI_API_KEY}
  OPENAI_KEY_PREFIX=$(echo "$OPENAI_API_KEY" | cut -c 1-10)
  echo "OpenAI API key is configured. Prefix: $OPENAI_KEY_PREFIX... Length: $OPENAI_KEY_LENGTH"
  
  # Check if the API key starts with the expected prefix
  if [[ "$OPENAI_API_KEY" == sk-* ]]; then
    echo "OpenAI API key has the expected 'sk-' prefix."
  else
    echo "WARNING: OpenAI API key does not start with 'sk-'. This might cause issues."
  fi
fi

# Check if JWT_SECRET is set
if [ -z "$JWT_SECRET" ]; then
  echo "WARNING: JWT_SECRET is not set. Authentication may not work correctly."
else
  JWT_SECRET_LENGTH=${#JWT_SECRET}
  echo "JWT_SECRET is configured. Length: $JWT_SECRET_LENGTH"
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

# Ensure data directory exists with proper permissions
mkdir -p /app/data
chmod -R 755 /app/data
touch /app/data/sqlite.db
chmod 666 /app/data/sqlite.db

# Ensure drizzle directories exist with proper permissions
mkdir -p /app/drizzle/migrations /app/drizzle/meta
chmod -R 755 /app/drizzle

# Create empty journal file in all possible locations
echo "Creating empty journal files..."
JOURNAL_CONTENT='{"version":"5","entries":[]}'

# Location 1: /app/drizzle/meta/_journal.json (our original location)
if [ ! -f "/app/drizzle/meta/_journal.json" ]; then
  echo "$JOURNAL_CONTENT" > /app/drizzle/meta/_journal.json
  chmod 644 /app/drizzle/meta/_journal.json
  echo "Created journal file at /app/drizzle/meta/_journal.json"
fi

# Location 2: /app/meta/_journal.json (possible alternate location)
mkdir -p /app/meta
if [ ! -f "/app/meta/_journal.json" ]; then
  echo "$JOURNAL_CONTENT" > /app/meta/_journal.json
  chmod 644 /app/meta/_journal.json
  echo "Created journal file at /app/meta/_journal.json"
fi

# Location 3: /app/node_modules/src/meta/_journal.json (another possible location)
mkdir -p /app/node_modules/src/meta
if [ ! -f "/app/node_modules/src/meta/_journal.json" ]; then
  echo "$JOURNAL_CONTENT" > /app/node_modules/src/meta/_journal.json
  chmod 644 /app/node_modules/src/meta/_journal.json
  echo "Created journal file at /app/node_modules/src/meta/_journal.json"
fi

# Location 4: /app/src/meta/_journal.json (another possible location)
mkdir -p /app/src/meta
if [ ! -f "/app/src/meta/_journal.json" ]; then
  echo "$JOURNAL_CONTENT" > /app/src/meta/_journal.json
  chmod 644 /app/src/meta/_journal.json
  echo "Created journal file at /app/src/meta/_journal.json"
fi

# Create symbolic links to ensure all possible paths can find the journal file
ln -sf /app/meta/_journal.json /app/drizzle/meta/_journal.json 2>/dev/null || true
ln -sf /app/meta/_journal.json /app/src/meta/_journal.json 2>/dev/null || true
ln -sf /app/meta/_journal.json /app/node_modules/src/meta/_journal.json 2>/dev/null || true

# Initialize database if it does not exist
if [ ! -s "/app/data/sqlite.db" ]; then
  echo "Database does not exist or is empty. Initializing..."
  # Try to use @swc-node/register, fall back to direct node if not available
  if node -e "require.resolve('@swc-node/register')" 2>/dev/null; then
    node -r @swc-node/register src/lib/db/schema-generator.ts || echo "Schema generation failed, but continuing startup"
    sleep 2
    node -r @swc-node/register src/lib/db/migrate.ts || echo "Migration failed, but continuing startup"
  else
    echo "Warning: @swc-node/register not found, trying direct execution"
    node src/lib/db/schema-generator.ts || echo "Schema generation failed, but continuing startup"
    sleep 2
    node src/lib/db/migrate.ts || echo "Migration failed, but continuing startup"
  fi
else
  # Check if we need to run migrations
  echo "Checking for pending migrations..."
  # Try to use @swc-node/register, fall back to direct node if not available
  if node -e "require.resolve('@swc-node/register')" 2>/dev/null; then
    node -r @swc-node/register src/lib/db/migrate.ts || echo "Migration failed, but continuing startup"
  else
    echo "Warning: @swc-node/register not found, trying direct execution"
    node src/lib/db/migrate.ts || echo "Migration failed, but continuing startup"
  fi
fi

# Print environment variables that will be available to the application
echo "Environment variables for the application:"
echo "NODE_ENV=$NODE_ENV"
echo "OPENAI_MODEL=$OPENAI_MODEL"
echo "DATABASE_URL=$DATABASE_URL"
echo "OPENAI_API_KEY is $(if [ -z "$OPENAI_API_KEY" ]; then echo "NOT "; fi)set"
echo "JWT_SECRET is $(if [ -z "$JWT_SECRET" ]; then echo "NOT "; fi)set"

# Check if Next.js build files exist in any of the possible locations
if [ -f ".next/server/app/server.js" ]; then
  echo "Found Next.js build files at .next/server/app/server.js"
  NEXT_SERVER_FILE=".next/server/app/server.js"
elif [ -f ".next/server/pages/app.js" ]; then
  echo "Found Next.js build files at .next/server/pages/app.js"
  NEXT_SERVER_FILE=".next/server/pages/app.js"
elif [ -f ".next/server/index.js" ]; then
  echo "Found Next.js build files at .next/server/index.js"
  NEXT_SERVER_FILE=".next/server/index.js"
else
  # List available files to help diagnose the issue
  echo "ERROR: Next.js build files not found. Checking available files:"
  find .next -type f -name "*.js" | grep -E 'server|index|app' || echo "No matching files found"
  exit 1
fi

# Start the application using node directly instead of npm
echo "Starting Next.js application..."
exec node $NEXT_SERVER_FILE 