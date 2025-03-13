# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
# We'll build it here as a fallback, but the .next directory might already exist from CI/CD
RUN if [ ! -d ".next" ] || [ -z "$(ls -A .next)" ]; then \
    echo "Building Next.js application..." && \
    npm run build; \
    else \
    echo "Using existing .next directory"; \
    fi

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy necessary files from the build stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/.env.local.example ./
COPY --from=builder /app/docker-entrypoint.sh ./

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create data directory with proper permissions
RUN mkdir -p /app/data /app/drizzle /app/drizzle/migrations /app/drizzle/meta && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app/data && \
    chmod +x /app/docker-entrypoint.sh

# Switch to non-root user
USER nextjs

# Create volumes for persistent data
VOLUME ["/app/data"]

# Expose the port the app will run on
EXPOSE 3000

# Set the entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"] 