# StayWise.ai — API Reference & Engineering Contracts
This document establishes the authoritative contract between the frontend presentation layer (`client/`) and the stateless Express.js application layer (`server/`). All responses adhere strictly to JSON API conventions, and all state mutating operations enforce robust concurrency and security checks.
---
## 1. Authentication Flow & Security Boundaries
[StayWise.ai](http://StayWise.ai) utilizes **JSON Web Tokens (JWT)** transmitted exclusively via cryptographically secured **`HttpOnly`**** and ****`Secure`**** cookies** (`staywise_jwt`). LocalStorage or sessionStorage token storage is strictly prohibited to prevent Cross-Site Scripting (XSS) payload extraction.
### Authentication Middleware (`authMiddleware`)
Every authenticated request is verified before route handling:
1. Extracts `req.cookies.staywise_jwt` (or `Authorization: Bearer <token>` in automated testing environments).
2. Verifies signature against `JWT_PRIVATE_SECRET`.
3. Attaches decoded payload (`{ userId, email, role, iat, exp }`) to `req.user`.
### Role-Based Access Control (`rbacMiddleware`)
Administrative routes (`/api/admin/*`) require explicit RBAC verification:
```javascript
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Administrative clearance required for this operation.'
    });
  }
  next();
};
```
---
## 2. Public Endpoints (Stateless & High Concurrency)
### `GET /api/rooms/search`
Searches and filters available hotel listings and room inventory across the StayWise ecosystem.
- **Query Parameters**:
<table>
<tr>
<td>Parameter</td>
<td>Type</td>
<td>Required</td>
<td>Description</td>
<td>Example</td>
</tr>
<tr>
<td>:---</td>
<td>:---</td>
<td>:---</td>
<td>:---</td>
<td>:---</td>
</tr>
<tr>
<td>`destination`</td>
<td>String</td>
<td>No</td>
<td>Case-insensitive city or neighborhood match</td>
<td>`Goa`</td>
</tr>
<tr>
<td>`checkIn`</td>
<td>String (ISO)</td>
<td>No</td>
<td>Desired check-in date (`YYYY-MM-DD`)</td>
<td>`2026-04-12`</td>
</tr>
<tr>
<td>`checkOut`</td>
<td>String (ISO)</td>
<td>No</td>
<td>Desired check-out date (`YYYY-MM-DD`)</td>
<td>`2026-04-16`</td>
</tr>
<tr>
<td>`guests`</td>
<td>Integer</td>
<td>No</td>
<td>Minimum occupancy required</td>
<td>`2`</td>
</tr>
<tr>
<td>`minPrice`</td>
<td>Number</td>
<td>No</td>
<td>Minimum nightly rate in INR (₹)</td>
<td>`2000`</td>
</tr>
<tr>
<td>`maxPrice`</td>
<td>Number</td>
<td>No</td>
<td>Maximum nightly rate in INR (₹)</td>
<td>`15000`</td>
</tr>
<tr>
<td>`sortBy`</td>
<td>String</td>
<td>No</td>
<td>Sort order (`price_asc`, `price_desc`, `rating`)</td>
<td>`rating`</td>
</tr>
<tr>
<td>`page` / `limit`</td>
<td>Integer</td>
<td>No</td>
<td>Pagination offsets (default: page 1, limit 20)</td>
<td>`1` / `20`</td>
</tr>
</table>
- **Response (****`200 OK`****)**:
```json
{
  "success": true,
  "count": 14,
  "pagination": { "current": 1, "total": 2 },
  "data": [
    {
      "_id": "6612a8f9c1b3e8203f1a9d01",
      "title": "The Palms Resort & Spa",
      "destination": "Indiranagar, Bangalore",
      "basePrice": 4500,
      "concessionPrice": 3899,
      "taxAndFees": 468,
      "rating": 4.89,
      "reviewsCount": 124,
      "images": ["https://res.cloudinary.com/staywise/image/upload/v1/listings/palms-1.jpg"],
      "smartStayScore": 0.94
    }
  ]
}
```
---
### `GET /api/rooms/:id/check`
Performs an atomic, real-time availability check against the room's booked inventory array.
- **URL Parameters**: `id` (MongoDB `ObjectId` of the Room/Property)
- **Query Parameters**: `checkIn` (`YYYY-MM-DD`), `checkOut` (`YYYY-MM-DD`)
- **Atomic MongoDB ****`$elemMatch`**** Overlap Logic**:
The route executes an atomic query verifying that the requested date interval `[checkIn, checkOut)` does NOT intersect any existing confirmed slot inside `bookedSlots`:
```javascript
const isBooked = await Room.findOne({
  _id: req.params.id,
  bookedSlots: {
    $elemMatch: {
      $or: [
        { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
      ],
      status: { $in: ['CONFIRMED', 'LOCKED'] }
    }
  }
});
```
- **Response (****`200 OK`****)**:
```json
{
  "success": true,
  "available": true,
  "roomId": "6612a8f9c1b3e8203f1a9d01",
  "requestedWindow": { "checkIn": "2026-04-12", "checkOut": "2026-04-16", "nights": 4 },
  "pricingBreakdown": {
    "baseTotal": 15596,
    "concessionTotal": 13596,
    "stayWiseCut": 1087,
    "gstTax": 2643,
    "totalPayable": 17326
  }
}
```
---
### `GET /api/recommender`
Retrieves algorithmic **SmartStay AI** personalized recommendations using TF-IDF attribute vectors and cosine similarity scoring.
- **Query Parameters**: `userId` (optional), `roomId` (optional reference property), `threshold` (default: `0.70`)
- **Engine Logic**: Checks Redis cache (`cache:tfidf:matrix`) for pre-computed cosine similarities. Filters out any property with a similarity score below `threshold` (`0.70`) to prevent hallucinated matches.
- **Response (****`200 OK`****)**: Returns top 6 ranked properties with `similarityMatch` score tags (`"✨ 94% MATCH"`).
---
## 3. Authenticated Consumer Endpoints (`req.user` required)
### `POST /api/payment/intent`
Generates a secure payment intent client secret from Stripe or Razorpay while acquiring a short-lived **Redis Pessimistic Lock (****`PCC`****)** on the room inventory.
- **Request Body (****`application/json`****)**:
```json
{
  "roomId": "6612a8f9c1b3e8203f1a9d01",
  "checkIn": "2026-04-12",
  "checkOut": "2026-04-16",
  "guests": 2,
  "gateway": "STRIPE"
}
```
- **Backend Lifecycle**:
1. Acquires distributed Redis lock (`lock:room:6612a8f9...:2026-04-12_2026-04-16`) with a `TTL` of 600 seconds (`10 minutes`).
2. If lock fails (`409 Conflict`), aborts immediately (`"Room currently locked by another guest checkout"`).
3. Creates Stripe PaymentIntent / Razorpay Order for `totalPayable` in lowest denomination (paise/cents).
- **Response (****`200 OK`****)**:
```json
{
  "success": true,
  "gateway": "STRIPE",
  "clientSecret": "pi_3P5X..._secret_89A...",
  "lockExpiresAt": "2026-07-09T08:45:00.000Z"
}
```
---
### `POST /api/bookings/create`
Creates a pending booking record pending final webhook verification.
- **Request Body (****`application/json`****)**:
```json
{
  "roomId": "6612a8f9c1b3e8203f1a9d01",
  "paymentIntentId": "pi_3P5X..._secret_89A...",
  "checkIn": "2026-04-12",
  "checkOut": "2026-04-16",
  "guestDetails": { "name": "Pranav Issam", "phone": "+91 9876543210" }
}
```
- **Response (****`201 Created`****)**: Returns pending booking object with `status: "AWAITING_WEBHOOK"`.
---
## 4. Administrative Endpoints (`req.user.role === 'Admin'`)
### `POST /api/admin/rooms`
Creates a new property listing with stateless Cloudinary image processing.
- **Headers**: `Content-Type: multipart/form-data`
- **Multer Memory Buffer Requirement**:
Per **Rule #9 (Stateless Media Pipeline)**, local disk storage (`multer.diskStorage`) is strictly forbidden. The route expects up to 8 images (`field: "images"`) processed via `multer.memoryStorage()`:
```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB Limit
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP allowed.'));
  }
});
```
- **CDN Streaming Pipeline**: Each memory buffer (`req.files[i].buffer`) is piped through `streamifier.createReadStream()` directly into `cloudinary.uploader.upload_stream({ folder: 'staywise_listings' })`.
- **Response (****`201 Created`****)**: Returns complete Room document with generated Cloudinary HTTPS URLs.
---
## 5. Webhook Endpoints (Cryptographic Supremacy)
### `POST /api/payment/webhook/stripe` & `POST /api/payment/webhook/razorpay`
The absolute single source of truth for confirming payments and booking state transitions. Frontend redirects are ignored for state confirmation.
- **Mandatory Body Parser (****`express.raw()`****)**:
Per **Rule #10 (Webhook Supremacy)**, these endpoints **MUST NOT** be intercepted by `express.json()`. They must parse the raw request stream to verify cryptographic HMAC signatures:
```javascript
app.post('/api/payment/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler);
```
- **Security & Idempotency Pipeline**:
1. Extracts signature (`stripe-signature` or `x-razorpay-signature`).
2. Verifies cryptographic signature using `STRIPE_WEBHOOK_SECRET` / `RAZORPAY_WEBHOOK_SECRET`.
3. Checks Redis idempotency cache (`webhook:event:<eventId>`). If key exists, immediately returns `200 OK` without database mutations.
4. Sets Redis idempotency key with a **24-hour TTL (****`86400 seconds`****)**.
5. If `event.type === 'payment_intent.succeeded'`, atomically pushes the confirmed date range into `Room.bookedSlots` and updates `Booking.status` to `"CONFIRMED"`.
- **Response (****`200 OK`****)**: `{ "received": true }`