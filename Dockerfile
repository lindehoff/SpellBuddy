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

# Create a non-root user and switch to it
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 