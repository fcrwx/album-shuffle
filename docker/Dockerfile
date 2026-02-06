# Build stage for client
FROM node:20-alpine AS client-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# Copy server code
COPY server/src ./server/src

# Copy built client
COPY --from=client-builder /app/client/dist ./client/dist

# Copy config
COPY config.json ./

# Create data directory
RUN mkdir -p server/data

# Set environment variables
ENV NODE_ENV=production
ENV IMAGES_DIR=/images

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start server
WORKDIR /app/server
CMD ["node", "src/index.js"]
