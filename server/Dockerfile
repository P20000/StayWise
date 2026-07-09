# ============================================
# StayWise.ai Backend — Multi-Stage Production Build
# ============================================
# Stage 1: Install dependencies (cached layer)
FROM node:20-alpine AS deps
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S staywise -u 1001

# Copy dependencies and source
COPY --from=deps --chown=staywise:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=staywise:nodejs /app/package*.json ./
COPY --chown=staywise:nodejs server/ ./

# Environment variables (injected at runtime via Render)
ENV NODE_ENV=production \
    PORT=5000

# Expose port
EXPOSE 5000

# Health check for Render's load balancer
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Switch to non-root user
USER staywise

# Start the Express server
CMD ["node", "server.js"]
