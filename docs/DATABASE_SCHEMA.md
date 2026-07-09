# StayWise.ai — Database Schema & Concurrency Engineering
[StayWise.ai](http://StayWise.ai) employs a **polyglot persistence architecture** combining **MongoDB Atlas** for document-oriented, flexible schema modeling (users, room catalogs, bookings) and **Redis** for distributed locking, session caching, and webhook idempotency. This document defines our exact data schemas, indexing strategies, and concurrency mechanisms designed to eliminate race conditions under high volume.
---
## 1. MongoDB Collections & Schemas
### `users` Collection
Manages authentication credentials, role-based boundaries (`Customer`, `Vendor`, `Admin`), and encrypted customer metadata.
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true, select: false }, // Bcrypt 12+ rounds
  role: {
    type: String,
    enum: ['Customer', 'Vendor', 'Admin'],
    default: 'Customer',
    required: true,
    index: true
  },
  phone: { type: String, trim: true },
  avatarUrl: { type: String },
  smartStayPreferences: {
    preferredDestinations: [{ type: String }],
    maxBudget: { type: Number, default: 10000 },
    favoriteAmenities: [{ type: String }]
  },
  vendorLocation: {
    address: { type: String },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  }
}, { timestamps: true, optimisticConcurrency: true });

// Pre-save hook enforcing bcrypt password hashing (12 rounds minimum)
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});
```
---
### `rooms` Collection
The core inventory catalog representing hotel properties. Enforces itemized concession pricing fields and atomic slot booking structures (`bookedSlots`).
```javascript
const bookedSlotSchema = new mongoose.Schema({
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  status: {
    type: String,
    enum: ['LOCKED', 'CONFIRMED', 'CANCELLED'],
    default: 'LOCKED',
    required: true
  }
}, { _id: true });

const roomSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  destination: { type: String, required: true, index: true },
  address: { type: String, required: true },
  
  // Itemized Concession Ledger Fields
  basePrice: { type: Number, required: true, min: 0 }, // Base vendor rate (INR)
  concessionPrice: { type: Number, required: true, min: 0 }, // StayWise listed rate
  taxAndFees: { type: Number, required: true, default: 0 }, // GST + Platform fee
  
  maxGuests: { type: Number, required: true, default: 2 },
  bedrooms: { type: Number, required: true, default: 1 },
  amenities: [{ type: String, index: true }], // e.g., ["WiFi", "Pool", "Spa"]
  images: [{ type: String, required: true }], // Cloudinary CDN HTTPS URLs
  
  rating: { type: Number, default: 4.8, min: 1, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  smartStayScore: { type: Number, default: 0.85 }, // Algorithmic match index
  
  // Geospatial Indexes
  locationCoordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  
  // Atomic Availability & Overlap Array
  bookedSlots: [bookedSlotSchema]
}, { timestamps: true, optimisticConcurrency: true });

// Compound and Geospatial Indexes for High-Speed Marketplace Filtering
roomSchema.index({ locationCoordinates: '2dsphere' });
roomSchema.index({ destination: 1, concessionPrice: 1, maxGuests: 1 });
roomSchema.index({ 'bookedSlots.checkIn': 1, 'bookedSlots.checkOut': 1 });
roomSchema.index({ rating: -1, reviewsCount: -1 });
```
---
### `bookings` Collection
Records the complete financial ledger, guest information, and payment gateway lifecycle (`Stripe` / `Razorpay`).
```javascript
const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true }, // e.g., "SW-8892-XT"
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  nights: { type: Number, required: true, min: 1 },
  guestsCount: { type: Number, required: true, min: 1 },
  
  // Itemized Financial Ledger Snapshot
  pricingSnapshot: {
    baseRatePerNight: { type: Number, required: true },
    concessionRatePerNight: { type: Number, required: true },
    stayWiseCut: { type: Number, required: true },
    gstTax: { type: Number, required: true },
    totalPayable: { type: Number, required: true }
  },
  
  gateway: { type: String, enum: ['STRIPE', 'RAZORPAY'], required: true },
  paymentIntentId: { type: String, required: true, unique: true, index: true },
    status: {
    type: String,
    enum: ['AWAITING_WEBHOOK', 'CONFIRMED', 'CANCELLED', 'REFUNDED'],
    default: 'AWAITING_WEBHOOK',
    required: true,
    index: true
  }
}, { timestamps: true, optimisticConcurrency: true });
```
---
### `reviews` Collection
Stores guest reviews and ratings mapped directly to listed rooms. Updates room's average rating aggregates upon creation.
```javascript
const reviewSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true }
}, { timestamps: true });

// Compound index to speed up reviews loading by room
reviewSchema.index({ room: 1, createdAt: -1 });
```
---
## 2. Concurrency Control Strategy
To guarantee absolute transactional integrity and prevent double-booking race conditions during high-demand booking surges, [StayWise.ai](http://StayWise.ai) implements a **hybrid two-tier locking model**:
### Tier 1: Optimistic Concurrency Control (OCC) — Metadata Updates
For standard catalog edits (e.g., updating room titles, amenities, or base vendor prices), Mongoose's built-in **`optimisticConcurrency: true`** utilizes internal document version keys (`__v`).
If two admin sessions attempt to modify the same room document concurrently, the second save attempt fails with a `VersionError`:
```javascript
// Automatically enforced by Mongoose schema setup
try {
  await roomDocument.save();
} catch (error) {
  if (error.name === 'VersionError') {
    throw new Error('Optimistic Concurrency Failure: Document was modified by another transaction. Please refresh and retry.');
  }
}
```
### Tier 2: Pessimistic Concurrency Control (PCC) — Distributed Redis Locks for Bookings
Because array mutations under high concurrent load can cause race conditions if two users click `"Book Now"` simultaneously for the exact same date interval, we enforce **Pessimistic Concurrency Control (PCC)** using **Redis Distributed Locks (****`Redlock`**** algorithm)**.
#### The PCC Booking Pipeline:
1. **Acquire Lock Before Reading Database**: Before any availability query runs inside `POST /api/payment/intent`, the backend attempts to acquire an exclusive Redis lock targeting the specific room and date interval:
```javascript
const lockKey = `lock:room:${roomId}:${checkIn}_${checkOut}`;
// SETNX with a 10-minute TTL (600 seconds)
const acquired = await redis.set(lockKey, req.user._id.toString(), 'NX', 'EX', 600);
if (!acquired) {
  throw new Error('CONCURRENCY_CONFLICT: This room is currently locked by another guest completing checkout.');
}
```
1. **Execute Atomic Overlap Verification**: With the Redis lock held, the server executes the atomic `$elemMatch` check against MongoDB `Room.bookedSlots`.
2. **Commit or Release**: If the room is confirmed available, the payment intent is generated and the Redis lock remains active for up to 10 minutes (`600s`) while the customer completes payment in Stripe/Razorpay. Once the webhook fires, the slot is permanently written to `bookedSlots` and the temporary Redis lock is deleted (`redis.del(lockKey)`).
---
## 3. Redis Cache Keys & TTL Architecture
Our Upstash/AWS ElastiCache Redis instance manages locks, webhook idempotency, and high-speed recommender matrices.
<table>
<tr>
<td>Key Pattern</td>
<td>Purpose</td>
<td>Data Structure</td>
<td>TTL Structure</td>
</tr>
<tr>
<td>:---</td>
<td>:---</td>
<td>:---</td>
<td>:---</td>
</tr>
<tr>
<td>**`lock:room:{id}:{checkIn}_{checkOut}`**</td>
<td>**PCC Room Lock.** Prevents concurrent double-booking during checkout.</td>
<td>String (User ID holding lock)</td>
<td>`EX 600` (10 minutes auto-expire)</td>
</tr>
<tr>
<td>**`webhook:event:{eventId}`**</td>
<td>**Webhook Idempotency.** Prevents duplicate processing of Stripe/Razorpay webhooks.</td>
<td>String (`"PROCESSED"`)</td>
<td>`EX 86400` (24 hours TTL)</td>
</tr>
<tr>
<td>**`cache:rooms:search:{queryHash}`**</td>
<td>**Search Results Cache.** Stores frequently searched destination queries.</td>
<td>String (JSON array of rooms)</td>
<td>`EX 300` (5 minutes TTL)</td>
</tr>
<tr>
<td>**`cache:tfidf:matrix`**</td>
<td>**Recommender Cosine Matrix.** Pre-calculated TF-IDF similarity vectors.</td>
<td>Hash / String (JSON matrix)</td>
<td>`EX 3600` (1 hour TTL)</td>
</tr>
<tr>
<td>**`rate:limit:{ip}`**</td>
<td>**API Rate Limiting Counter.** Tracks requests per IP boundary.</td>
<td>Integer (Count)</td>
<td>`EX 900` (15 minutes sliding window)</td>
</tr>
</table>