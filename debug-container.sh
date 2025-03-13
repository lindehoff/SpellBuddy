#!/bin/bash

# This script helps debug issues with the Docker container

# Build the image
echo "Building Docker image..."
docker build -t spellbuddy-debug .

# Run the container in interactive mode with a shell
echo "Running container in interactive mode..."
docker run -it --rm \
  -v $(pwd)/data:/app/data \
  --entrypoint /bin/sh \
  spellbuddy-debug

# This will give you a shell inside the container where you can:
# - Explore the filesystem
# - Run commands manually
# - Check permissions
# - Test the entrypoint script: /app/docker-entrypoint.sh 