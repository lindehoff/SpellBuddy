#!/bin/bash

# Script to optimize Docker build process for SpellBuddy
# This script provides options for building optimized Docker images

# Default values
IMAGE_NAME="lindehoff/spellbuddy:main"
USE_CACHE="true"
COMPRESS="true"
PRUNE_AFTER="false"
SQUASH="false"
PLATFORM="linux/amd64"
BUILD_ARGS=""
BENCHMARK="false"
COMPARE_WITH=""

# Print usage information
function print_usage {
  echo "SpellBuddy Docker Build Optimizer"
  echo ""
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  --image-name NAME       Docker image name (default: lindehoff/spellbuddy:main)"
  echo "  --no-cache              Disable Docker build cache"
  echo "  --no-compress           Disable compression of layers"
  echo "  --prune-after           Prune Docker system after build"
  echo "  --squash                Squash newly built layers into a single layer (requires experimental features)"
  echo "  --platform PLATFORM     Set target platform (default: linux/amd64)"
  echo "  --build-arg KEY=VALUE   Add build arguments (can be used multiple times)"
  echo "  --benchmark             Run benchmarks on the built image"
  echo "  --compare-with IMAGE    Compare size with another image"
  echo "  --help                  Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                                  Build with default settings"
  echo "  $0 --image-name myname/spellbuddy   Build with custom image name"
  echo "  $0 --no-cache --prune-after         Build without cache and prune after"
  echo "  $0 --benchmark --compare-with lindehoff/spellbuddy:previous"
}

# Parse options
while [[ $# -gt 0 ]]; do
  case $1 in
    --image-name)
      IMAGE_NAME="$2"
      shift 2
      ;;
    --no-cache)
      USE_CACHE="false"
      shift
      ;;
    --no-compress)
      COMPRESS="false"
      shift
      ;;
    --prune-after)
      PRUNE_AFTER="true"
      shift
      ;;
    --squash)
      SQUASH="true"
      shift
      ;;
    --platform)
      PLATFORM="$2"
      shift 2
      ;;
    --build-arg)
      BUILD_ARGS="$BUILD_ARGS --build-arg $2"
      shift 2
      ;;
    --benchmark)
      BENCHMARK="true"
      shift
      ;;
    --compare-with)
      COMPARE_WITH="$2"
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

# Build Docker command
BUILD_CMD="docker build"

# Add cache option
if [ "$USE_CACHE" = "false" ]; then
  BUILD_CMD="$BUILD_CMD --no-cache"
fi

# Add compression option
if [ "$COMPRESS" = "true" ]; then
  BUILD_CMD="$BUILD_CMD --compress"
fi

# Add squash option
if [ "$SQUASH" = "true" ]; then
  BUILD_CMD="$BUILD_CMD --squash"
fi

# Add platform option
BUILD_CMD="$BUILD_CMD --platform $PLATFORM"

# Add build args
if [ -n "$BUILD_ARGS" ]; then
  BUILD_CMD="$BUILD_CMD $BUILD_ARGS"
fi

# Add tag
BUILD_CMD="$BUILD_CMD -t $IMAGE_NAME"

# Add build context
BUILD_CMD="$BUILD_CMD ."

# Print build information
echo "Building Docker image with the following settings:"
echo "  Image name: $IMAGE_NAME"
echo "  Using cache: $USE_CACHE"
echo "  Compression: $COMPRESS"
echo "  Squash layers: $SQUASH"
echo "  Target platform: $PLATFORM"
echo "  Build args: $BUILD_ARGS"
echo "  Prune after build: $PRUNE_AFTER"
echo "  Run benchmark: $BENCHMARK"
echo "  Compare with: $COMPARE_WITH"
echo ""
echo "Build command: $BUILD_CMD"
echo ""

# Start time measurement
START_TIME=$(date +%s)

# Execute build command
echo "Starting build process..."
eval $BUILD_CMD

# Check if build was successful
if [ $? -eq 0 ]; then
  # Calculate build time
  END_TIME=$(date +%s)
  BUILD_TIME=$((END_TIME - START_TIME))
  
  echo ""
  echo "Build completed successfully in $BUILD_TIME seconds."
  
  # Get image size
  IMAGE_SIZE=$(docker images --format "{{.Size}}" $IMAGE_NAME)
  echo "Image size: $IMAGE_SIZE"
  
  # Compare with another image if requested
  if [ -n "$COMPARE_WITH" ]; then
    COMPARE_SIZE=$(docker images --format "{{.Size}}" $COMPARE_WITH 2>/dev/null)
    if [ -n "$COMPARE_SIZE" ]; then
      echo "Comparison image size: $COMPARE_SIZE"
      echo "Comparing $IMAGE_NAME with $COMPARE_WITH"
    else
      echo "Comparison image $COMPARE_WITH not found."
    fi
  fi
  
  # Run benchmark if requested
  if [ "$BENCHMARK" = "true" ]; then
    echo ""
    echo "Running benchmark..."
    
    # Analyze image layers
    echo "Layer analysis:"
    docker history $IMAGE_NAME
    
    # Analyze image size breakdown
    echo ""
    echo "Size breakdown by directory:"
    docker run --rm $IMAGE_NAME find /app -type d -name "node_modules" -o -name ".next" | xargs du -sh
    
    # Measure startup time
    echo ""
    echo "Measuring container startup time..."
    START_CONTAINER_TIME=$(date +%s%N)
    CONTAINER_ID=$(docker run -d --rm $IMAGE_NAME)
    
    # Wait for container to be healthy
    for i in {1..30}; do
      if docker ps | grep -q $CONTAINER_ID; then
        CONTAINER_READY=true
        break
      fi
      sleep 1
    done
    
    END_CONTAINER_TIME=$(date +%s%N)
    CONTAINER_STARTUP_TIME=$(( (END_CONTAINER_TIME - START_CONTAINER_TIME) / 1000000 ))
    
    echo "Container startup time: $CONTAINER_STARTUP_TIME ms"
    
    # Clean up benchmark container
    docker stop $CONTAINER_ID >/dev/null 2>&1
  fi
  
  # Prune if requested
  if [ "$PRUNE_AFTER" = "true" ]; then
    echo ""
    echo "Pruning Docker system..."
    docker system prune -f
  fi
  
  echo ""
  echo "You can now use the image with:"
  echo "  ./manage-container.sh start --image-name $IMAGE_NAME"
else
  echo ""
  echo "Build failed."
  exit 1
fi 