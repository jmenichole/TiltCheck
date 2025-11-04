# TiltCheck API Server Dockerfile - Production Ready
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    fontconfig \
    ttf-dejavu \
    curl \
    && fc-cache -f

# Set working directory
WORKDIR /app

# ===== Dependencies stage =====
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production --ignore-scripts

# ===== Build stage =====
FROM base AS build

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# ===== Production stage =====
FROM base AS production

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY --from=build /app .

# Create necessary directories
RUN mkdir -p data logs config \
    && chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check - check if server is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the server
CMD ["node", "api-server.js"]
