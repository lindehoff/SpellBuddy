#!/bin/bash

# SpellBuddy Container Management Script
# This script provides a unified interface for managing the SpellBuddy Docker container

# Default values
CONTAINER_NAME="spellbuddy"
IMAGE_NAME="lindehoff/spellbuddy"
IMAGE_TAG="latest"
PORT="9928"
DATA_DIR="/volume1/docker/spellbuddy/data"
ENV_FILE="/volume1/docker/spellbuddy/.env.local"
DEBUG_MODE="false"
ACTION="start"  # Default action: start the container
OPTIMIZE_FLAGS=""
VERIFY_ACHIEVEMENTS="false"
FORCE_VERSION=""

# Print usage information
function print_usage {
  echo "SpellBuddy Container Management Script"
  echo ""
  echo "Usage: $0 [action] [options]"
  echo ""
  echo "Actions:"
  echo "  start       Start the container (default)"
  echo "  stop        Stop the container"
  echo "  restart     Restart the container"
  echo "  rebuild     Rebuild and restart the container"
  echo "  upgrade     Pull the latest image and restart the container"
  echo "  logs        Show container logs"
  echo "  optimize    Build an optimized Docker image"
  echo "  verify      Verify and seed achievements if needed"
  echo "  version     Show current version information"
  echo ""
  echo "Options:"
  echo "  --container-name NAME   Container name (default: spellbuddy)"
  echo "  --image-name NAME       Docker image name without tag (default: lindehoff/spellbuddy)"
  echo "  --image-tag TAG        Docker image tag (default: latest)"
  echo "  --port PORT             Host port to map to container port 3000 (default: 9928)"
  echo "  --data-dir DIR          Host directory to mount as /app/data (default: /volume1/docker/spellbuddy/data)"
  echo "  --env-file FILE         Environment file to mount (default: /volume1/docker/spellbuddy/.env.local)"
  echo "  --debug                 Enable debug mode with additional logging"
  echo "  --optimize-flags FLAGS  Additional flags to pass to optimize-docker-build.sh"
  echo "  --verify-achievements   Force verification and seeding of achievements"
  echo "  --force-version VER    Force upgrade/downgrade to a specific version"
  echo "  --help                  Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 start                Start the container with default settings"
  echo "  $0 rebuild --debug      Rebuild and start the container with debug mode enabled"
  echo "  $0 upgrade              Pull the latest image and restart the container"
  echo "  $0 upgrade --force-version v1.2.3  Upgrade/downgrade to a specific version"
  echo "  $0 logs                 Show container logs"
  echo "  $0 verify               Verify and seed achievements if needed"
  echo "  $0 version              Show current version information"
  echo "  $0 optimize --optimize-flags \"--no-cache --benchmark\""
}

# Parse action (first argument)
if [[ $1 == "start" || $1 == "stop" || $1 == "restart" || $1 == "rebuild" || $1 == "upgrade" || $1 == "logs" || $1 == "optimize" || $1 == "verify" || $1 == "version" ]]; then
  ACTION="$1"
  shift
fi

# Parse options
while [[ $# -gt 0 ]]; do
  case $1 in
    --container-name)
      CONTAINER_NAME="$2"
      shift 2
      ;;
    --image-name)
      IMAGE_NAME="$2"
      shift 2
      ;;
    --image-tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    --data-dir)
      DATA_DIR="$2"
      shift 2
      ;;
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --debug)
      DEBUG_MODE="true"
      shift
      ;;
    --optimize-flags)
      OPTIMIZE_FLAGS="$2"
      shift 2
      ;;
    --verify-achievements)
      VERIFY_ACHIEVEMENTS="true"
      shift
      ;;
    --force-version)
      FORCE_VERSION="$2"
      IMAGE_TAG="$2"
      shift 2
      ;;
    --help)
      print_usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      print_usage
      exit 1
      ;;
  esac
done

# Load environment variables from .env.local if it exists
if [ -f "$ENV_FILE" ]; then
  echo "Loading environment variables from $ENV_FILE"
  export $(grep -v '^#' "$ENV_FILE" | xargs)
elif [ -f .env.local ]; then
  echo "Loading environment variables from .env.local"
  export $(grep -v '^#' .env.local | xargs)
else
  echo "Warning: No .env file found. Using default or provided environment variables."
fi

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "Error: OPENAI_API_KEY is not set. Please set it in $ENV_FILE or provide it as an environment variable."
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

# Set up debug environment variables
DEBUG_ENV=""
if [ "$DEBUG_MODE" = "true" ]; then
  echo "Enabling debug mode with additional logging"
  DEBUG_ENV="-e DEBUG=true -e NODE_OPTIONS=--inspect=0.0.0.0:9229"
fi

# Function to stop and remove the container
function stop_container {
  if docker ps -a | grep -q "$CONTAINER_NAME"; then
    echo "Stopping and removing container: $CONTAINER_NAME"
    docker stop "$CONTAINER_NAME"
    docker rm "$CONTAINER_NAME"
  else
    echo "Container $CONTAINER_NAME is not running"
  fi
}

# Function to start the container
function start_container {
  # Check if container already exists
  if docker ps -a | grep -q "$CONTAINER_NAME"; then
    echo "Container $CONTAINER_NAME already exists. Stopping and removing it first."
    stop_container
  fi
  
  # Add verification flag if needed
  VERIFY_ENV=""
  if [ "$VERIFY_ACHIEVEMENTS" = "true" ]; then
    echo "Enabling achievement verification"
    VERIFY_ENV="-e VERIFY_ACHIEVEMENTS=true"
  fi
  
  echo "Starting container: $CONTAINER_NAME"
  docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$PORT:3000" \
    $DEBUG_ENV \
    $VERIFY_ENV \
    -e OPENAI_API_KEY="$OPENAI_API_KEY" \
    -e JWT_SECRET="$JWT_SECRET" \
    -e OPENAI_MODEL="$OPENAI_MODEL" \
    -e DATABASE_URL="file:/app/data/sqlite.db" \
    -v "$DATA_DIR:/app/data:rw" \
    -v "$ENV_FILE:/app/.env.local:ro" \
    --restart always \
    "$IMAGE_NAME:$IMAGE_TAG"
    
  echo "Container $CONTAINER_NAME started. Access it at http://localhost:$PORT"
}

# Function to show container logs
function show_logs {
  if docker ps -a | grep -q "$CONTAINER_NAME"; then
    echo "Showing logs for container: $CONTAINER_NAME"
    docker logs -f "$CONTAINER_NAME"
  else
    echo "Container $CONTAINER_NAME does not exist"
  fi
}

# Function to build the Docker image
function build_image {
  echo "Building Docker image: $IMAGE_NAME"
  docker build -t "$IMAGE_NAME" .
}

# Function to build an optimized Docker image
function optimize_image {
  echo "Building optimized Docker image: $IMAGE_NAME"
  
  # Check if optimize-docker-build.sh exists
  if [ ! -f "./optimize-docker-build.sh" ]; then
    echo "Error: optimize-docker-build.sh not found. Please make sure it exists in the current directory."
    exit 1
  fi
  
  # Make sure it's executable
  chmod +x ./optimize-docker-build.sh
  
  # Run the optimization script
  ./optimize-docker-build.sh --image-name "$IMAGE_NAME" $OPTIMIZE_FLAGS
}

# Function to get current version
function get_current_version {
  if docker ps -a | grep -q "$CONTAINER_NAME"; then
    local current_image=$(docker inspect --format='{{.Config.Image}}' "$CONTAINER_NAME")
    echo "$current_image"
  else
    echo "Container not running"
  fi
}

# Function to get available versions
function get_available_versions {
  echo "Available versions:"
  docker image ls "$IMAGE_NAME" --format "{{.Tag}}"
}

# Function to check if version exists
function version_exists {
  local version="$1"
  # Try to pull the manifest first
  if docker pull "$IMAGE_NAME:$version" >/dev/null 2>&1; then
    return 0
  else
    # If pull fails, check if we have it locally
    if docker image inspect "$IMAGE_NAME:$version" >/dev/null 2>&1; then
      return 0
    fi
    return 1
  fi
}

# Function to handle version management
function handle_version {
  echo "Current version: $(get_current_version)"
  echo ""
  echo "Available versions locally:"
  get_available_versions
  
  if [ -n "$FORCE_VERSION" ]; then
    echo ""
    echo "Checking availability of version $FORCE_VERSION..."
    if version_exists "$FORCE_VERSION"; then
      echo "Version $FORCE_VERSION is available"
    else
      echo "Version $FORCE_VERSION is not available"
    fi
  fi
}

# Function to pull the latest Docker image
function pull_image {
  if [ -n "$FORCE_VERSION" ]; then
    echo "Attempting to pull version $FORCE_VERSION of image: $IMAGE_NAME"
    if docker pull "$IMAGE_NAME:$FORCE_VERSION"; then
      echo "Successfully pulled version $FORCE_VERSION"
    else
      echo "Error: Failed to pull version $FORCE_VERSION. Please check if the version exists and you have proper access."
      exit 1
    fi
  else
    echo "Pulling latest image: $IMAGE_NAME:$IMAGE_TAG"
    if ! docker pull "$IMAGE_NAME:$IMAGE_TAG"; then
      echo "Error: Failed to pull latest image. Please check your internet connection and Docker Hub access."
      exit 1
    fi
  fi
}

# Function to verify and seed achievements
function verify_achievements {
  echo "Verifying and seeding achievements in container: $CONTAINER_NAME"
  
  if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Container $CONTAINER_NAME is not running. Starting it first."
    start_container
    # Wait for container to start
    sleep 5
  fi
  
  echo "Running achievement verification script..."
  docker exec "$CONTAINER_NAME" node /app/verify-achievements.js
  
  echo "Achievement verification completed."
}

# Execute the requested action
case "$ACTION" in
  start)
    start_container
    ;;
  stop)
    stop_container
    ;;
  restart)
    stop_container
    start_container
    ;;
  rebuild)
    stop_container
    build_image
    start_container
    show_logs
    ;;
  upgrade)
    stop_container
    pull_image
    start_container
    show_logs
    ;;
  logs)
    show_logs
    ;;
  optimize)
    stop_container
    optimize_image
    start_container
    show_logs
    ;;
  verify)
    verify_achievements
    ;;
  version)
    handle_version
    ;;
  *)
    echo "Unknown action: $ACTION"
    print_usage
    exit 1
    ;;
esac 