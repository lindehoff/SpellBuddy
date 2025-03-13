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

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create data directory with proper permissions
RUN mkdir -p /app/data /app/drizzle && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app/data

# Create a startup script to handle database initialization and migrations
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Ensure proper permissions for data directory' >> /app/start.sh && \
    echo 'chmod -R 755 /app/data' >> /app/start.sh && \
    echo 'touch /app/data/sqlite.db' >> /app/start.sh && \
    echo 'chmod 666 /app/data/sqlite.db' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Initialize database if it does not exist' >> /app/start.sh && \
    echo 'if [ ! -s "/app/data/sqlite.db" ]; then' >> /app/start.sh && \
    echo '  echo "Database does not exist or is empty. Initializing..."' >> /app/start.sh && \
    echo '  npm run db:generate' >> /app/start.sh && \
    echo '  npm run db:migrate || echo "Migration failed, but continuing startup"' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  # Check if we need to run migrations' >> /app/start.sh && \
    echo '  echo "Checking for pending migrations..."' >> /app/start.sh && \
    echo '  npm run db:generate' >> /app/start.sh && \
    echo '  npm run db:migrate || echo "Migration failed, but continuing startup"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start the application' >> /app/start.sh && \
    echo 'exec npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Switch to non-root user
USER nextjs

# Create volumes for persistent data
VOLUME ["/app/data"]

# Expose the port the app will run on
EXPOSE 3000

# Start the application with our custom script
CMD ["/bin/sh", "/app/start.sh"] 