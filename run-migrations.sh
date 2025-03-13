#!/bin/bash

# Script to run database migrations in the SpellBuddy Docker container

# Default values
CONTAINER_NAME="spellbuddy"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --container-name)
      CONTAINER_NAME="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --container-name NAME Container name (default: spellbuddy)"
      echo "  --help                Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
  echo "Error: Container $CONTAINER_NAME is not running."
  echo "Please start the container first."
  exit 1
fi

echo "Running database migrations in container $CONTAINER_NAME..."

# Run the migration command in the container
docker exec "$CONTAINER_NAME" sh -c "NODE_OPTIONS=\"--require ./src/lib/env-loader.js\" npm run db:migrate"

echo "Migration completed." 