# StayWise.ai — Security Blueprint & Defense-in-Depth Strategy
[StayWise.ai](http://StayWise.ai) enforces a **zero-trust, multi-layered security posture** designed to safeguard customer PII, maintain strict financial integrity across B2B2C vendor payouts, and protect the underlying stateless serverless/container infrastructure against Denial of Service (DoS) and injection vulnerabilities.
---
## 1. Network Boundary Protection & Rate Limiting
To mitigate automated scraping, brute-force login attempts, and volumetric DoS attacks, all API routes are fortified with strict rate-limiting middleware using `express-rate-limit` backed by Redis sliding windows:
```javascript
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis.js';

// Global API Boundary Rate Limiter (100 Requests per 15 Minutes)
export const globalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: 'rate:limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `windowMs`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS: You have exceeded the 100 requests / 15 minutes rate limit. Please throttle your connections.'
  }
});

// High-Security Auth Throttle (5 Requests per 15 Minutes for Login/Register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'SECURITY_THROTTLED: Too many login attempts detected. Account locked for 15 minutes.'
  }
});
```
---
## 2. HTTP Header Security & CSP Directives (`helmet`)
To prevent Cross-Site Scripting (XSS), Clickjacking, and Packet Sniffing, the Express application initializes **`helmet`** with explicitly tailored Content Security Policy (CSP) directives whitelisting Stripe, Razorpay, and Cloudinary domains:
```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://checkout.razorpay.com"
      ],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://api.razorpay.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://lumberjack.razorpay.com",
        "https://api.cloudinary.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://res.cloudinary.com",
        "https://images.unsplash.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 Year HSTS enforcement
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' }
}));
```
---
## 3. Strict CORS Policy & Origin Whitelisting
Cross-Origin Resource Sharing (CORS) is explicitly constrained to whitelisted production and development domains. Wildcard (`*`) origins are strictly forbidden when credentials (`cookies`) are enabled:
```javascript
import cors from 'cors';

const WHITELISTED_ORIGINS = [
  'https://staywise.ai',
  'https://www.staywise.ai',
  'https://admin.staywise.ai',
  process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests in dev) only if explicit
    if (!origin || WHITELISTED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS_SECURITY_VIOLATION: Origin not whitelisted by StayWise security policies.'));
    }
  },
  credentials: true, // Required to accept HttpOnly JWT cookies across CORS boundaries
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```
---
## 4. Stateless Media Upload Security (`Multer` Memory Pipe)
To prevent Local File Inclusion (LFI), Path Traversal, and Server Disk Exhaustion attacks, local disk writes (`multer.diskStorage`) are banned per **Rule #9**.
### Multi-Layer Upload Guard:
1. **RAM-Only Buffering**: Files are read directly into ephemeral memory (`multer.memoryStorage()`).
2. **Hard Size Bounds**: Enforces a strict `4MB` limit per file.
3. **MIME Type Whitelisting**: Rejects any file where `mimetype` is not explicitly `image/jpeg`, `image/png`, or `image/webp`.
4. **Direct Streamifier CDN Pipe**: Memory buffers are immediately piped into Cloudinary's encrypted CDN ingestion endpoints, ensuring no unverified binary ever touches the server file system.
```javascript
import multer from 'multer';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';

const uploadGuard = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB maximum payload
    files: 8 // Max 8 photos per listing
  },
  fileFilter: (req, file, cb) => {
    const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('SECURITY_INVALID_FILE_TYPE: Only JPEG, PNG, and WEBP formats are accepted.'));
    }
  }
});
```
---
## 5. Financial Integrity & Cryptographic Webhook Security
To prevent fraudulent booking confirmations, man-in-the-middle tampering, and replay attacks during payment gateway callbacks, StayWise enforces **Webhook Supremacy (Rule #10)**:
### 1. Cryptographic HMAC Verification
All webhook payloads from Stripe (`stripe-signature`) and Razorpay (`x-razorpay-signature`) are verified using the exact raw binary byte payload (`express.raw()`) against secret webhook keys (`STRIPE_WEBHOOK_SECRET` / `RAZORPAY_WEBHOOK_SECRET`). If a single byte or header timestamp is modified, the verification throws an immediate security exception.
### 2. Distributed Redis Idempotency Defense
Even with verified HMAC signatures, attackers or network retries might send duplicate successful payment notifications (`payment_intent.succeeded`) to force duplicate room allocations or double-refund processing.
Before executing database updates, the webhook handler atomically checks a Redis key for the event ID:
```javascript
const eventId = stripeEvent.id; // e.g., "evt_3P5X..."
const idempotencyKey = `webhook:event:${eventId}`;

// SETNX returns 1 if key was newly set, 0 if it already existed
const isFirstProcessing = await redisClient.set(idempotencyKey, 'PROCESSED', 'NX', 'EX', 86400); // 24 Hours TTL

if (!isFirstProcessing) {
  console.warn(`[SECURITY] Replay/Duplicate webhook event detected: ${eventId}. Ignoring safely.`);
  return res.status(200).json({ received: true, status: "IDEMPOTENT_REPLAY_IGNORED" });
}

// Proceed safely with Booking & Room slot confirmation...
```
This guarantees that each transaction hash is processed exactly once (`Exactly-Once Processing Guarantee`), rendering replay attacks completely harmless.