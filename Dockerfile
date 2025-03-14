# Build dependencies stage
FROM node:18-alpine AS deps

WORKDIR /app

# Copy only package files for dependency installation
COPY package*.json ./

# Install dependencies with clean cache and production only
RUN npm ci --only=production && \
    npm cache clean --force

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (including dev dependencies)
COPY package*.json ./
RUN npm ci

# Copy only necessary files for the build
COPY next.config.js ./
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY public ./public
COPY src ./src

# Build the application
RUN npm run build

# Production stage - using the smallest possible base image
FROM alpine:3.19 AS runner

WORKDIR /app

# Install Node.js runtime only (no npm) and required dependencies
RUN apk add --no-cache nodejs ca-certificates tzdata && \
    # Create a non-root user
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    # Create data directory with proper permissions
    mkdir -p /app/data /app/drizzle /app/drizzle/migrations /app/drizzle/meta

# Set environment variables
ENV NODE_ENV=production

# Copy only necessary files from previous stages
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY package.json ./
COPY drizzle.config.ts ./
COPY .env.local.example ./
COPY docker-entrypoint.sh ./
COPY src ./src

# Set proper permissions and clean up
RUN chown -R nextjs:nodejs /app && \
    chmod -R 755 /app/data && \
    chmod +x /app/docker-entrypoint.sh && \
    # Clean up
    rm -rf /tmp/* && \
    # Reduce image size by removing unnecessary files
    find /app/node_modules -type d -name "test" -o -name "tests" | xargs rm -rf && \
    find /app/node_modules -type d -name ".git" | xargs rm -rf && \
    find /app/node_modules -type f -name "*.md" -o -name "*.ts" -not -name "*.d.ts" | xargs rm -rf && \
    # Remove unnecessary files from node_modules
    find /app/node_modules -type f -name "LICENSE" -o -name "license" | xargs rm -rf && \
    find /app/node_modules -type d -name "docs" -o -name "doc" -o -name "examples" | xargs rm -rf && \
    # Strip debug symbols from binaries
    find /app/node_modules -type f -name "*.node" | xargs strip --strip-all 2>/dev/null || true

# Switch to non-root user
USER nextjs

# Create volumes for persistent data
VOLUME ["/app/data"]

# Expose the port the app will run on
EXPOSE 3000

# Set the entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"] 