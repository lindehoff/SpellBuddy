# Build stage
FROM --platform=linux/amd64 node:18-alpine AS builder

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
FROM --platform=linux/amd64 node:18-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy necessary files from the build stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/.env.local.example ./

# Create a non-root user and switch to it
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create data directory and set proper permissions
RUN mkdir -p /app/data && \
    chown -R nextjs:nodejs /app

# Create a startup script to handle database initialization and migrations
RUN echo '#!/bin/sh \n\
# Initialize database if it doesn'\''t exist \n\
if [ ! -f "/app/data/sqlite.db" ]; then \n\
  echo "Database does not exist. Initializing..." \n\
  npm run db:generate \n\
  npm run db:migrate \n\
fi \n\
\n\
# Start the application \n\
exec npm start \n\
' > /app/start.sh && chmod +x /app/start.sh

USER nextjs

# Create volumes for persistent data
VOLUME ["/app/data"]

# Expose the port the app will run on
EXPOSE 3000

# Start the application with our custom script
CMD ["/app/start.sh"] 