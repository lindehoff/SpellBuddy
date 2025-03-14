#!/bin/bash

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local"
  export $(grep -v '^#' .env.local | xargs)
else
  echo "Warning: .env.local file not found. Using default or provided environment variables."
fi

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "Error: OPENAI_API_KEY is not set. Please set it in .env.local or provide it as an environment variable."
  exit 1
fi

# Check if JWT_SECRET is set
if [ -z "$JWT_SECRET" ]; then
  echo "Warning: JWT_SECRET is not set. Using a default value."
  JWT_SECRET="default_jwt_secret_for_development"
fi

# Set default OpenAI model if not specified
if [ -z "$OPENAI_MODEL" ]; then
  echo "Using default OpenAI model: gpt-4o-mini"
  OPENAI_MODEL="gpt-4o-mini"
fi

# Run the Docker container with environment variables
echo "Starting SpellBuddy container..."
docker run -d \
  --name spellbuddy \
  -p 9928:3000 \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e OPENAI_MODEL="$OPENAI_MODEL" \
  -e DATABASE_URL="file:/app/data/sqlite.db" \
  -v /volume1/docker/spellbuddy/data:/app/data:rw \
  -v /volume1/docker/spellbuddy/.env.local:/app/.env.local:ro \
  lindehoff/spellbuddy:main

echo "SpellBuddy container started. Access it at http://localhost:9928" 