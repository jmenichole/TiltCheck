# TrapHouse Discord Bot Dockerfile
FROM node:18-alpine

# Set locale and unicode support
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV NODE_OPTIONS="--no-warnings"

# Install unicode and font support
RUN apk add --no-cache \
    fontconfig \
    ttf-dejavu \
    && fc-cache -f

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create data directory for JSON files
RUN mkdir -p data logs

# Set permissions
RUN chown -R node:node /app
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Bot health check')" || exit 1

# Expose port for health checks
EXPOSE 3001

# Start the bot
CMD ["node", "main.js"]
