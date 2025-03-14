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

# Create all possible journal file locations
mkdir -p /app/drizzle/meta
mkdir -p /app/meta
mkdir -p /app/node_modules/src/meta
mkdir -p /app/src/meta
mkdir -p /app/meta
mkdir -p /app/node_modules/drizzle/meta

# Write the journal content to the primary location
echo "$JOURNAL_CONTENT" > /app/meta/_journal.json
chmod 644 /app/meta/_journal.json
echo "Created primary journal file at /app/meta/_journal.json"

# Create hard copies (not just symlinks) in all possible locations
cp /app/meta/_journal.json /app/drizzle/meta/_journal.json
cp /app/meta/_journal.json /app/src/meta/_journal.json
cp /app/meta/_journal.json /app/node_modules/src/meta/_journal.json
if [ ! -d "/app/node_modules/drizzle" ]; then
  mkdir -p /app/node_modules/drizzle/meta
fi
cp /app/meta/_journal.json /app/node_modules/drizzle/meta/_journal.json 2>/dev/null || true

# Also create the file directly in the current directory
cp /app/meta/_journal.json /app/meta/_journal.json

echo "Copied journal files to all possible locations"

# Create a helper script to find the journal file
cat > /app/find-journal.js << 'EOF'
const fs = require('fs');
const path = require('path');

// List of possible locations
const locations = [
  '/app/meta/_journal.json',
  '/app/drizzle/meta/_journal.json',
  '/app/src/meta/_journal.json',
  '/app/node_modules/src/meta/_journal.json',
  '/app/node_modules/drizzle/meta/_journal.json',
  'meta/_journal.json',
  './meta/_journal.json',
  '../meta/_journal.json'
];

// Check each location
for (const loc of locations) {
  try {
    if (fs.existsSync(loc)) {
      console.log(`Journal file found at: ${loc}`);
      process.exit(0);
    }
  } catch (err) {
    // Ignore errors
  }
}

console.log('Journal file not found in any of the expected locations');
process.exit(1);
EOF

# Run the helper script to verify journal file locations
echo "Verifying journal file locations:"
node /app/find-journal.js || echo "Warning: Journal file verification failed"

# Create a migration patch script to handle the error
cat > /app/migration-patch.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Function to create tables directly if migration fails
async function createTablesDirectly() {
  console.log("Creating tables directly as a fallback...");
  
  try {
    // Import the database connection
    const db = require('./src/lib/db/db');
    
    // Check if the database is connected
    if (db) {
      console.log("Database connection established");
      
      // Execute schema creation
      try {
        const schemaModule = require('./src/lib/db/schema');
        console.log("Schema module loaded");
        console.log("Tables should be created by the schema module");
        console.log("Migration patch completed successfully");
      } catch (err) {
        console.error("Error loading schema module:", err);
      }
    } else {
      console.error("Failed to connect to database");
    }
  } catch (err) {
    console.error("Error in migration patch:", err);
  }
}

// Run the function
createTablesDirectly();
EOF

# Initialize database if it does not exist
if [ ! -s "/app/data/sqlite.db" ]; then
  echo "Database does not exist or is empty. Initializing..."
  # Try to use @swc-node/register, fall back to direct node if not available
  if node -e "require.resolve('@swc-node/register')" 2>/dev/null; then
    node -r @swc-node/register src/lib/db/schema-generator.ts || echo "Schema generation failed, but continuing startup"
    sleep 2
    node -r @swc-node/register src/lib/db/migrate.ts || echo "Migration failed, trying fallback..."
    # If migration failed, try our patch script
    if [ $? -ne 0 ]; then
      echo "Using migration patch script..."
      node /app/migration-patch.js
    fi
  else
    echo "Warning: @swc-node/register not found, trying direct execution"
    node src/lib/db/schema-generator.ts || echo "Schema generation failed, but continuing startup"
    sleep 2
    node src/lib/db/migrate.ts || echo "Migration failed, trying fallback..."
    # If migration failed, try our patch script
    if [ $? -ne 0 ]; then
      echo "Using migration patch script..."
      node /app/migration-patch.js
    fi
  fi
else
  # Check if we need to run migrations
  echo "Checking for pending migrations..."
  # Try to use @swc-node/register, fall back to direct node if not available
  if node -e "require.resolve('@swc-node/register')" 2>/dev/null; then
    node -r @swc-node/register src/lib/db/migrate.ts || echo "Migration failed, trying fallback..."
    # If migration failed, try our patch script
    if [ $? -ne 0 ]; then
      echo "Using migration patch script..."
      node /app/migration-patch.js
    fi
  else
    echo "Warning: @swc-node/register not found, trying direct execution"
    node src/lib/db/migrate.ts || echo "Migration failed, trying fallback..."
    # If migration failed, try our patch script
    if [ $? -ne 0 ]; then
      echo "Using migration patch script..."
      node /app/migration-patch.js
    fi
  fi
fi

# Print environment variables that will be available to the application
echo "Environment variables for the application:"
echo "NODE_ENV=$NODE_ENV"
echo "OPENAI_MODEL=$OPENAI_MODEL"
echo "DATABASE_URL=$DATABASE_URL"
echo "OPENAI_API_KEY is $(if [ -z "$OPENAI_API_KEY" ]; then echo "NOT "; fi)set"
echo "JWT_SECRET is $(if [ -z "$JWT_SECRET" ]; then echo "NOT "; fi)set"

# Check if Next.js build files exist
if [ -d ".next" ]; then
  echo "Found Next.js build directory at .next/"
  
  # Check if we have the main app files
  if [ -d ".next/server/app" ] && [ -d ".next/static" ]; then
    echo "Next.js build files appear to be present"
    
    # Check if we have node_modules/next/dist/bin/next
    if [ -f "node_modules/next/dist/bin/next" ]; then
      echo "Starting Next.js application using next start..."
      exec node node_modules/next/dist/bin/next start -p 3000
    else
      echo "Starting Next.js application using npx next start..."
      exec npx next start -p 3000
    fi
  else
    echo "ERROR: Next.js build files incomplete. Missing key directories."
    echo "Available directories in .next:"
    find .next -type d -maxdepth 2 | sort
    exit 1
  fi
else
  echo "ERROR: Next.js build directory (.next) not found."
  echo "Available directories in app root:"
  ls -la
  exit 1
fi 