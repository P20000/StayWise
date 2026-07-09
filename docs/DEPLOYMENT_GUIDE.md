# StayWise.ai — Production Deployment & Operations Guide
This guide provides authoritative, step-by-step instructions for deploying the 3-tier [StayWise.ai](http://StayWise.ai) platform from [localhost](http://localhost) to high-availability production across **Vercel** (Frontend Presentation), **Render / AWS ECS** (Stateless Backend Application Layer), and **MongoDB Atlas / Redis** (Persistence & Concurrency Locking).
---
## 1. Frontend Presentation Layer Deployment (`Vercel`)
The React + Tailwind CSS client is optimized for edge delivery via Vercel CDN.
### Step 1: Project Import & Build Settings
1. Connect your GitHub repository (`StayWise`) to Vercel.
2. Select the **`client/`** root directory as the Project Root.
3. Configure the exact build parameters:
- **Framework Preset**: `Vite` / `React`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
### Step 2: Vercel Production Environment Variables
In the Vercel Dashboard under **Settings → Environment Variables**, add:
```bash
VITE_API_BASE_URL=https://api.staywise.ai/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51P5X...
VITE_RAZORPAY_KEY_ID=rzp_live_89A...
VITE_CLOUDINARY_CLOUD_NAME=staywise
```
*Note: After setting environment variables, trigger a fresh production deployment (**`Deployments → Redeploy`**).*
---
## 2. Stateless Backend Application Layer Deployment (`Render` / `AWS ECS`)
Per our **Stateless Media Pipeline Rule (#9)** and **Horizontal Scaling Rules**, our Express API runs in multi-instance containers without local filesystem state.
### Option A: Render Web Service (Zero-Config Container)
1. In the Render Dashboard, click **New + → Web Service** and connect the `StayWise` GitHub repo.
2. Configure service details:
- **Root Directory**: `server`
- **Environment**: `Node` or `Docker`
- **Build Command**: `npm install`
- **Start Command**: `npm start` (or `node server.js`)
- **Instance Type**: Minimum `Standard Plus` (2 CPU / 4GB RAM recommended for high concurrency).
1. Under **Environment Variables**, paste your complete production `.env` block (see [`docs/ENVIRONMENT_VARIABLES.md`](docs/ENVIRONMENT_VARIABLES.md)).
### Option B: Containerized Dockerfile (`AWS ECS` / `Docker`)
For enterprise deployment on AWS ECS Fargate, build using our production-grade multi-stage Dockerfile (`server/Dockerfile`):
### Step 3: MongoDB Atlas & Redis Connection Configuration
1. **MongoDB Atlas (****`MONGO_URI`****)**:
- Ensure IP Access List includes `0.0.0.0/0` (or Render/Vercel static egress IPs) when deploying cloud-native.
- Append `?retryWrites=true&w=majority` to the Atlas connection URI to ensure high write availability during concurrency bursts.
1. **Redis Distributed Cache (****`REDIS_URL`****)**:
- For Upstash or AWS ElastiCache, verify TLS (`rediss://...`) is enabled and pass `tls: { rejectUnauthorized: false }` in your Node Redis connection pool if required by cloud SSL cert chains.
---
## 3. Cloudinary CDN Configuration (`staywise_listings`)
Because our Node.js servers never write uploaded images to local storage (`multer.memoryStorage()` pipeline), Cloudinary must be pre-configured with dedicated storage folders and auto-optimization rules:
### Step 1: Create Folder Structure
In the Cloudinary Console (`Media Library`), create a dedicated root folder named:
### Step 2: Auto-Optimization & Quality Transformation Presets
To guarantee lightning-fast page loading without manual image resizing, create an **Upload Preset (****`staywise_auto_optimize`****)**:
- **Format Transformation**: `f_auto` (Automatically delivers WebP or AVIF based on guest browser support).
- **Quality Transformation**: `q_auto:best` (Applies perceptual compression without human-noticeable degradation).
- **Max Dimensions**: Set `width: 1920, height: 1080, crop: limit` to prevent multi-megabyte raw camera uploads from wasting CDN bandwidth.
---
## 4. Payment Gateway Webhook Configuration (`Stripe` & `Razorpay`)
Cryptographic webhooks (`express.raw()`) are the sole mechanism for finalizing booking transactions (`Rule #10`).
### Local Development Testing (`Stripe CLI`)
To test webhook callbacks locally without exposing port 5000 to the public internet, use the official Stripe CLI:
```bash
# 1. Login to your Stripe Account
stripe login

# 2. Forward live events to your local Express webhook handler
stripe listen --forward-to localhost:5000/api/payment/webhook/stripe
```
The CLI will output a local signing secret (`whsec_12345...`). Copy this value into your local `server/.env` as `STRIPE_WEBHOOK_SECRET`.
### Production Webhook Endpoint Setup (`Stripe Dashboard`)
1. Go to **Stripe Dashboard → Developers → Webhooks → Add endpoint**.
2. **Endpoint URL**: `https://api.staywise.ai/api/payment/webhook/stripe`
3. **Events to Select**:
- `payment_intent.succeeded` (Triggers room booking confirmation & slot lock commitment).
- `payment_intent.payment_failed` (Releases temporary Redis room lock).
- `charge.refunded` (Triggers booking cancellation status).
1. Reveal and copy the **Signing Secret (****`whsec_...`****)** into your Render/AWS ECS environment variables as `STRIPE_WEBHOOK_SECRET`.
---
## 5. Post-Deployment Verification Checklist
After deploying all three tiers, verify system stability:
- [ ] **Health Check API**: `curl https://api.staywise.ai/api/health` returns `{ "status": "UP", "database": "CONNECTED", "redis": "CONNECTED" }`.
- [ ] **CORS Egress Check**: Verify that requests from `https://staywise.ai` succeed with valid `Access-Control-Allow-Origin` headers, while unauthorized domains return `500 CORS_SECURITY_VIOLATION`.
- [ ] **Stateless Image Upload**: Log in as `Admin` or `Vendor`, upload a test property image via `/admin/rooms`, and verify the image streams directly to `https://res.cloudinary.com/staywise/image/upload/...` without creating local files in the container.
- [ ] **Idempotent Webhook Replay**: Send a duplicate simulated webhook event via `Stripe CLI` (`stripe trigger payment_intent.succeeded`) and check server logs for `[SECURITY] Replay/Duplicate webhook event detected... Ignoring safely`.