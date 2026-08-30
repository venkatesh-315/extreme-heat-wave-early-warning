FROM node:20-alpine

WORKDIR /app

# Set production environment defaults
ENV NODE_ENV=production \
    PORT=5000

# Install dependencies (only production packages)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .

# Use non-root node user for container security
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
