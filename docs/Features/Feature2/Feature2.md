### ✅ The Correct Mental Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT (Docker Compose)           │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │ Frontend │   │ Backend  │   │ MongoDB  │   │  Redis   │    │
│  │  :3000   │◄─►│  :5000   │◄─►│  :27017  │   │  :6379   │    │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ docker-compose.yml (dev only)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION (Render + Managed)                │
│                                                                 │
│  ┌────────────────┐       ┌────────────────┐                    │
│  │ Vercel Static  │       │ Render Web Svc │                    │
│  │  (Frontend)    │──────►│  (Backend API) │                    │
│  │  staywise.ai   │       │  Dockerfile    │                    │
│  └────────────────┘       └───────┬────────┘                    │
│                                   │                             │
│                    ┌──────────────┼──────────────┐              │
│                    ▼              ▼              ▼              │
│            ┌──────────────┐ ┌──────────┐ ┌──────────┐          │
│            │ MongoDB Atlas│ │  Upstash │ │Cloudinary│          │
│            │  (Managed)   │ │  Redis   │ │   CDN    │          │
│            └──────────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📐 Refined Deployment Architecture

### Tier 1: Frontend (React + Tailwind)
- **Local**: Docker container with Nginx serving the built React app
- **Production**: **Vercel Static Site** (per `PRD.md` — edge-cached, zero-config)
- **Why not Render?**: Vercel's edge network delivers sub-100ms TTFB globally; Render Static Sites are slower and cost more.

### Tier 2: Backend (Node.js + Express)
- **Local**: Docker container running the Express API
- **Production**: **Render Web Service** using a custom `Dockerfile`
- **Why Docker here?**: You need precise control over Node.js version, Multer memory buffers, and Cloudinary streamifier dependencies.

### Tier 3: Database (MongoDB)
- **Local**: Docker container running `mongo:7`
- **Production**: **MongoDB Atlas** (managed, 3-node replica set per `PRD.md`)
- **NEVER containerize MongoDB in production.**

### Tier 4: Cache (Redis)
- **Local**: Docker container running `redis:7-alpine`
- **Production**: **Upstash Redis** (serverless, pay-per-request) or **Render Managed Redis**

---

## 📦 Docker Artifacts for StayWise.ai

### 1. Backend `Dockerfile` (`server/Dockerfile`)

```dockerfile
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
CMD ["node", "src/server.js"]
```

### 2. Frontend `Dockerfile` (`client/Dockerfile`)

```dockerfile
# ============================================
# StayWise.ai Frontend — Multi-Stage Build
# ============================================
# Stage 1: Build React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# Stage 2: Serve with Nginx (production-grade, lightweight)
FROM nginx:1.27-alpine AS runner
# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf
# Copy custom nginx config
COPY client/nginx.conf /etc/nginx/conf.d/
# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Nginx Config for Frontend (`client/nginx.conf`)

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers (aligns with PRD.md helmet config)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|webp|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback — all routes to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK";
    }
}
```

### 4. Local Development `docker-compose.yml` (ROOT)

```yaml
# ============================================
# StayWise.ai — LOCAL DEVELOPMENT ONLY
# DO NOT use this file for Render production deployment
# ============================================
version: '3.9'

services:
  # ─── Tier 1: Frontend ───
  frontend:
    build:
      context: .
      dockerfile: client/Dockerfile
    container_name: staywise-frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:5000
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - staywise-network
    restart: unless-stopped

  # ─── Tier 2: Backend API ───
  backend:
    build:
      context: .
      dockerfile: server/Dockerfile
    container_name: staywise-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - PORT=5000
      - MONGO_URI=mongodb://staywise:staywise_dev@mongodb:27017/staywise?authSource=admin
      - REDIS_URL=redis://redis:6379
      - JWT_PRIVATE_SECRET=${JWT_PRIVATE_SECRET:-dev_secret_change_in_prod}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
    env_file:
      - .env
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - staywise-network
    restart: unless-stopped

  # ─── Tier 3: MongoDB (LOCAL ONLY) ───
  mongodb:
    image: mongo:7
    container_name: staywise-mongodb
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=staywise
      - MONGO_INITDB_ROOT_PASSWORD=staywise_dev
    volumes:
      - mongodb_data:/data/db
      - ./scripts/mongo-seed.js:/docker-entrypoint-initdb.d/seed.js:ro
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - staywise-network
    restart: unless-stopped

  # ─── Tier 4: Redis (LOCAL ONLY) ───
  redis:
    image: redis:7-alpine
    container_name: staywise-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - staywise-network
    restart: unless-stopped

volumes:
  mongodb_data:
    driver: local
  redis_data:
    driver: local

networks:
  staywise-network:
    driver: bridge
```

### 5. `.dockerignore` (ROOT)

```
# Secrets — NEVER bake into image
.env
.env.local
.env.production
*.pem
*.key

# Dependencies (rebuilt in Docker)
node_modules
client/node_modules
server/node_modules

# Build artifacts
client/dist
server/dist
build

# IDE & OS
.vscode
.idea
.DS_Store
Thumbs.db

# Git & Docs
.git
.gitignore
docs/
*.md

# Docker itself
docker-compose*.yml
Dockerfile
.dockerignore

# Testing & logs
coverage
.nyc_output
*.log
npm-debug.log
```

---

## 🚀 Production Deployment on Render

### Step 1: Backend Web Service

1. In Render Dashboard → **New → Web Service**
2. Connect your GitHub repo
3. **Build Configuration**:
   - **Environment**: `Docker`
   - **Dockerfile Path**: `server/Dockerfile`
   - **Docker Context**: `.` (root)
4. **Plan**: Starter or Standard ($7/mo)
5. **Environment Variables** (add all from `.env`):
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://...  (Atlas connection)
   REDIS_URL=rediss://...       (Upstash connection)
   JWT_PRIVATE_SECRET=...
   CLOUDINARY_*
   STRIPE_*
   RAZORPAY_*
   ```
6. **Health Check Path**: `/api/health`
7. Deploy → Render builds the Docker image and pushes to its registry.

### Step 2: Frontend on Vercel

1. Import GitHub repo into Vercel
2. **Root Directory**: `client`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variable**:
   ```
   VITE_API_BASE_URL=https://staywise-backend.onrender.com
   ```

### Step 3: MongoDB Atlas (Managed)

1. Create free/shared cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Configure **Network Access** → whitelist `0.0.0.0/0` (or restrict to Render's IP range)
3. Create database user with `readWrite` role
4. Copy connection string → paste into Render backend env vars as `MONGO_URI`

### Step 4: Upstash Redis (Serverless)

1. Create free cluster at [upstash.com](https://upstash.com)
2. Copy the `REDISS` URL (TLS-enabled) → paste into Render backend env vars

---

## 📋 Optional: Render Blueprint (`render.yaml`)

If you want **one-click orchestration** of all Render services from a single file (NOT docker-compose), use Render's Blueprint format:

```yaml
# render.yaml — Render Blueprint (production orchestration)
# This is NOT docker-compose. It's Render's native service definition.

services:
  - type: web
    name: staywise-backend
    env: docker
    dockerfilePath: ./server/Dockerfile
    dockerContext: .
    plan: starter
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false  # Injected manually in dashboard
      - key: REDIS_URL
        sync: false
      - key: JWT_PRIVATE_SECRET
        generateValue: true
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false

  # Note: MongoDB and Redis are NOT defined here.
  # They are managed services (Atlas + Upstash) — not containers.
```

---

## 🎯 Alignment with Existing Documentation

| Constraint from Docs | How This Approach Satisfies It |
|---|---|
| `PRD.md`: "Stateless Node.js environment" | Backend Dockerfile uses ephemeral filesystem; Multer buffers in memory only |
| `PRD.md`: "Horizontally scalable behind load balancers" | Docker container has no local state; can scale to N replicas on Render |
| `PRD.md`: "MongoDB Atlas cluster with 3-node replica set" | Production uses Atlas, NOT a container |
| `PRD.md`: "Redis distributed locking" | Production uses Upstash (TLS-enabled, serverless) |
| `PRD.md`: "Vercel for frontend deployment" | Frontend deployed to Vercel, NOT Render |
| `AGENT.md`: "Never commit `.env` or secrets" | `.dockerignore` blocks `.env`; secrets injected via Render dashboard |
| `DESIGN.md`: "Elevated Brutalism tokens" | Frontend build preserves Tailwind config; no runtime changes |

---

## ⚡ Quick-Start Commands

```bash
# Local development (all 4 tiers)
docker-compose up --build

# Local development (background mode)
docker-compose up -d

# Rebuild after code changes
docker-compose up --build --force-recreate

# View logs
docker-compose logs -f backend

# Tear down (preserves DB data)
docker-compose down

# Tear down (DESTROYS DB data)
docker-compose down -v
```

---

## 🔑 Key Takeaways

1. **Docker Compose = Local Dev Only.** Never use it for production on Render.
2. **Render Blueprint (`render.yaml`) = Production Orchestration.** This is Render's equivalent of docker-compose, but it defines services, not containers.
3. **Never containerize stateful services** (MongoDB, Redis) on ephemeral platforms like Render. Use managed alternatives.
4. **Multi-stage Docker builds** keep production images small (~150MB vs ~900MB) and secure (non-root user).
5. **Vercel + Render + Atlas + Upstash** is the optimal production topology per your `PRD.md` architecture.

This refined approach gives you the **best of both worlds**: Docker Compose for frictionless local development, and Render's native service model for production-grade deployment.