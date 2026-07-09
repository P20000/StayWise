# StayWise.ai — Luxury Hospitality & AI Precision Concession Marketplace
\[!\[Build Status\](https://img.shields.io/badge/build-passing-emerald.svg?style=for-the-badge)\](https://staywise.ai)
\[!\[License: MIT\](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)\](LICENSE)
\[!\[Design: Elevated Brutalism\](https://img.shields.io/badge/Design-Elevated%20Brutalism-212121.svg?style=for-the-badge)\](docs/DESIGN.md)
\[!\[Frontend: React\](https://img.shields.io/badge/Frontend-React%20%2B%20Tailwind-0EA5E9.svg?style=for-the-badge)\](client/)
\[!\[Backend: Node/Express\](https://img.shields.io/badge/Backend-Node%2FExpress-339933.svg?style=for-the-badge)\](server/)
\[!\[Database: MongoDB + Redis\](https://img.shields.io/badge/Storage-MongoDB%20%2B%20Redis-47A248.svg?style=for-the-badge)\](docs/DATABASE_SCHEMA.md)
\[!\[Payments: Stripe & Razorpay\](https://img.shields.io/badge/Payments-Stripe%20%7C%20Razorpay-6772E5.svg?style=for-the-badge)\](docs/API_REFERENCE.md)
\[!\[Media: Cloudinary CDN\](https://img.shields.io/badge/CDN-Cloudinary%20Memory%20Pipe-F4B400.svg?style=for-the-badge)\](docs/SECURITY.md)
---
## 💡 The Pitch
\*\*StayWise.ai\*\* is a premier B2B2C Concession Model hospitality booking platform that fuses high-trust itemized financial transparency with an \*\*Elevated Brutalism ("Architectural Premium")\*\* design aesthetic and algorithmic \*\*SmartStay AI\*\* recommendations. Engineered for ultra-high concurrency and horizontal scalability, StayWise eliminates hidden booking fees while providing real-time room availability locking and stateless cloud pipelines.
---
## 🏗️ 3-Tier Clean Architecture
---
## 🚀 Quick Start Guide
### 1. Prerequisites
- \*\*Node.js\*\*: \`v18.0.0\` or higher (\`npm v9+\`)
- \*\*MongoDB\*\*: Active MongoDB Atlas Cluster or local instance (\`v6.0+\`)
- \*\*Redis\*\*: Active Upstash or AWS ElastiCache instance (\`v7.0+\`)
### 2. Repository Setup
Clone the repository and install dependencies across the client and server:
```bash
git clone https://github.com/staywise-ai/StayWise.git
cd StayWise

# Install Backend Service Dependencies
cd server && npm install

# Install Frontend Client Dependencies
cd ../client && npm install
```
### 3. Environment Variables Configuration
Copy the sample environment templates and populate your local secrets:
```bash
# In the server directory
cp .env.example .env

# In the client directory
cp .env.example .env.local
```
\*(Refer to \[\`docs/ENVIRONMENT_VARIABLES.md\`\](docs/ENVIRONMENT_VARIABLES.md) for detailed descriptions of every required key including \`MONGO_URI\`, \`REDIS_URL\`, \`STRIPE_SECRET_KEY\`, and \`CLOUDINARY_CLOUD_NAME\`).\*
### 4. Running Locally in Development Mode
Start both the backend API and frontend dev server:
```bash
# Terminal 1: Start Express Backend API (Port 5000)
cd server && npm run dev

# Terminal 2: Start React Client Dev Server (Port 5173)
cd client && npm run dev
```
---
## ✨ Key Features & Architectural Highlights
- \*\*📐 Elevated Brutalism ("Architectural Premium") UI\*\*: Features raw bone backgrounds (\`#F1EDEA\`), heavy charcoal structural grids (\`#212121\`), warm brass hardware badges (\`#C5A059\`), and signature terracotta conversion triggers (\`#C84B31\`). See \[\`docs/DESIGN.md\`\](docs/DESIGN.md).
- \*\*💸 Itemized Concession Model Ledger\*\*: Transparent financial breakdowns displaying base vendor nightly rates alongside StayWise platform concession cuts and exact hospitality tax calculations without hidden cart markups. See \[\`docs/PRD.md\`\](docs/PRD.md).
- \*\*🔒 High-Concurrency Double-Booking Prevention\*\*: Combines \*\*Optimistic Concurrency Control (OCC via Mongoose \`__v\`)\*\* with \*\*Pessimistic Concurrency Control (PCC via Redis Distributed Locks)\*\* and atomic MongoDB \`\$elemMatch\` date overlap queries. See \[\`docs/DATABASE_SCHEMA.md\`\](docs/DATABASE_SCHEMA.md).
- \*\*☁️ Stateless Cloudinary Media Pipeline\*\*: Zero local disk writes (\`no multer.diskStorage\`). All image uploads are buffered in RAM via \`multer.memoryStorage()\` and streamed directly to Cloudinary CDN via \`streamifier\`. See \[\`docs/SECURITY.md\`\](docs/SECURITY.md).
- \*\*🛡️ Cryptographic Webhook Supremacy\*\*: Payments and booking status transitions are strictly finalized via asynchronous, signature-verified Stripe and Razorpay webhooks (\`express.raw()\`) protected by 24-hour Redis idempotency checks. See \[\`docs/API_REFERENCE.md\`\](docs/API_REFERENCE.md).
- \*\*🤖 SmartStay AI Recommender\*\*: Asynchronous TF-IDF hotel attribute vectorization and cosine similarity scoring cached in Redis with strict similarity threshold filtering.
---
## 📚 Documentation Index
Our engineering and operational documentation is meticulously organized inside the \`docs/\` directory:
\| Document \| Purpose & Description \|
\| :--- \| :--- \|
\| \*\*\[\`docs/PRD.md\`\](docs/PRD.md)\*\* \| \*\*Product Requirements Document\*\*: Single source of truth for features, user roles, routing, and payment lifecycle. \|
\| \*\*\[\`docs/DESIGN.md\`\](docs/DESIGN.md)\*\* \| \*\*Design System\*\*: Authoritative guidelines for Elevated Brutalism, color palettes, spacing, and UI components. \|
\| \*\*\[\`docs/API_REFERENCE.md\`\](docs/API_REFERENCE.md)\*\* \| \*\*Engineering Contracts\*\*: Complete REST API specifications, JWT auth mechanisms, and webhook schemas. \|
\| \*\*\[\`docs/DATABASE_SCHEMA.md\`\](docs/DATABASE_SCHEMA.md)\*\* \| \*\*Data Modeling & Concurrency\*\*: MongoDB schemas, indexes, \`bookedSlots\` arrays, and Redis locking strategies. \|
\| \*\*\[\`docs/SECURITY.md\`\](docs/SECURITY.md)\*\* \| \*\*Security Blueprint\*\*: Rate limiting, Helmet CSP directives, RBAC boundaries, and stateless media validation. \|
\| \*\*\[\`docs/DEPLOYMENT_GUIDE.md\`\](docs/DEPLOYMENT_GUIDE.md)\*\* \| \*\*Operations Guide\*\*: Step-by-step production deployment instructions across Vercel, Render/ECS, and Stripe CLI. \|
\| \*\*\[\`docs/ENVIRONMENT_VARIABLES.md\`\](docs/ENVIRONMENT_VARIABLES.md)\*\*\| \*\*Secret Ledger\*\*: Master reference table for all required \`.env\` keys across client and server. \|
\| \*\*\[\`docs/TESTING_STRATEGY.md\`\](docs/TESTING_STRATEGY.md)\*\* \| \*\*QA & Governance\*\*: Unit, integration, and concurrency load testing methodologies (\`Jest + Supertest\`). \|
\| \*\*\[\`docs/CONTRIBUTING.md\`\](docs/CONTRIBUTING.md)\*\* \| \*\*Developer Rulebook\*\*: Branch naming, commit formatting, design rules, and state management routing rules. \|
\| \*\*\[\`docs/AGENT.md\`\](docs/AGENT.md)\*\* \| \*\*AI Agent Workspace Rules\*\*: Automated prompt evaluation, Notion sync, and strict architectural guardrails. \|
---
\*Built with precision for the StayWise.ai Engineering Ecosystem.\*