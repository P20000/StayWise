# **System Architecture and Implementation Specification for **[**StayWise.ai**](http://StayWise.ai)
## **Abstract System Topography and Technology Stack Alignment**
The design of [StayWise.ai](http://StayWise.ai), a high-concurrency, responsive web-based hotel reservation application, relies on a three-tier clean architectural paradigm to decouple client interfaces, orchestration modules, and database operations1. Traditional monolithic applications frequently suffer from tight coupling, where database schema modifications force sweeping changes across presentation and business logic components3. To mitigate these operational risks, the system establishes decoupled execution boundaries3.
┌────────────────────────────────────────────────────────┐  
│                   PRESENTATION TIER                    │  
│             (React.js, Tailwind, Axios)                │  
└──────────────────────────┬─────────────────────────────┘  
	│ HTTPS (RESTful JSON APIs)  
	▼  
┌────────────────────────────────────────────────────────┐  
│                    APPLICATION TIER                    │  
│             (Express.js, Node.js Runtimes)             │  
└──────────────────────────┬─────────────────────────────┘  
	│ MongoDB Driver / TCP Sockets  
	▼  
┌────────────────────────────────────────────────────────┐  
│                       DATA TIER                        │  
│          (MongoDB / MySQL Persistence & Redis)         │  
└────────────────────────────────────────────────────────┘
The presentation tier is designed around React.js, implementing standard component-based modular interfaces styled with Tailwind CSS for multi-device responsiveness1. Client-side routing is handled via a virtual layout structure that decouples private administrative paths from public hotel discovery routes1. Network communication is delegated to Axios instances optimized with interceptors to inject authorization headers1.  
The application tier runs a stateless Node.js environment utilizing the Express.js framework1. This environment hosts HTTP routers, authentication guards, media parsers, and transactional controllers1. By maintaining a stateless configuration, application servers can scale horizontally behind load balancers without requiring local session storage1.  
The data tier is powered by a document-oriented database (MongoDB) or a relational engine (MySQL)2. For high-concurrency availability checks and inventory tracking, the schema uses atomic array fields and document-level transactions to eliminate race conditions7. An in-memory cache layer (Redis) supports distributed locking mechanisms and stores session-token blacklists8.  
The technologies selected for the [StayWise.ai](http://StayWise.ai) platform are aligned to support dynamic operations across the presentation, application, and data layers:
<table>
<tr>
<td>Layer</td>
<td>Technology</td>
<td>Primary System Role</td>
</tr>
<tr>
<td>:----</td>
<td>:----</td>
<td>:----</td>
</tr>
<tr>
<td>**Frontend UI**</td>
<td>React.js (v18+) & Tailwind CSS</td>
<td>Responsive page construction, state synchronization, and execution of client check-out workflows1.</td>
</tr>
<tr>
<td>**State Management**</td>
<td>Redux Toolkit / Context API</td>
<td>Centralized application state mapping, rendering synchronization, and persistent authentication tracking10.</td>
</tr>
<tr>
<td>**Application Server**</td>
<td>Node.js & Express.js</td>
<td>Exposing secure RESTful routes, processing media buffers, and orchestrating financial callbacks1.</td>
</tr>
<tr>
<td>**Database Engine**</td>
<td>MongoDB (or MySQL)</td>
<td>Document store holding indexing configurations for search fields and chronological check-out intervals7.</td>
</tr>
<tr>
<td>**Identity Verification**</td>
<td>JWT & Crypto SDK</td>
<td>Issuance of encrypted session tokens, hash-based admin credentials verification, and OTP handling4.</td>
</tr>
<tr>
<td>**File Processing**</td>
<td>Multer Middleware</td>
<td>Processing user form payloads and raw photo uploads directly inside ephemeral memory6.</td>
</tr>
<tr>
<td>**CDN & Storage**</td>
<td>Cloudinary API</td>
<td>Cloud storage, media transformations, and global static resource caching via optimized CDN endpoints6.</td>
</tr>
<tr>
<td>**Payment Gateway**</td>
<td>Stripe / Razorpay API</td>
<td>Secure, PCI-compliant processing of card details, UPI collection, and server-side webhook authorization16.</td>
</tr>
<tr>
<td>**Deployment Target**</td>
<td>Render / AWS ECS</td>
<td>Ephemeral container hosting with dynamic scale-up capabilities and secure environment variable injection1.</td>
</tr>
</table>
## **Role-Based Access Control and Secure Identity Management**
[StayWise.ai](http://StayWise.ai) enforces role-based access control (RBAC) to ensure that actors can only perform actions matching their specific authorization level18. The platform defines two primary system actors:
1. **Customer (Guest)**: An authenticated or anonymous user authorized to search listings, check availability, initiate reservations, complete payments, and view their personal confirmation dashboard7. Guests have read-only access to the general inventory and write-only access to bookings associated with their authenticated profile7.  
2. **Admin (Hotel Manager)**: An authenticated administrative user with access to the dashboard at /admin/dashboard5. Admins can perform create, read, update, and delete (CRUD) operations on room inventories, dynamic pricing, and system-wide listings5. They also manage booking changes and process cancellations7.
Identity management is established using stateless JSON Web Tokens (JWT) combined with Secure Sockets Layer (SSL/TLS) transmission paths4. When an administrator logs in at /admin/login, their credentials are sent via an encrypted HTTPS POST request to the application backend21.
┌─────────────┐             ┌────────────────┐             ┌─────────────────┐  
│Admin Browser│             │Express Backend │             │MongoDB Database │  
└──────┬──────┘             └───────┬────────┘             └────────┬────────┘  
	│                            │                               │  
	│ 1. POST /admin/login       │                               │  
	├───────────────────────────\>│                               │  
	│    (Email & Password)      │ 2. Find admin document        │  
	│                            ├──────────────────────────────\>│  
	│                            │                               │  
	│                            │ 3. Return hashed document     │  
	│                            │\<──────────────────────────────┤  
	│                            │                               │  
	│                            │ 4. Verify password (bcrypt)   │  
	│                            ├─┐                             │  
	│                            │││                             │  
	│                            │└┘                             │  
	│                            │ 5. Generate signed JWT        │  
	│                            ├─┐                             │  
	│                            │││                             │  
	│                            │└┘                             │  
	│ 6. Send Token (HttpOnly)   │                               │  
	│\<───────────────────────────┤                               │
To prevent password leakage, plain-text passwords are never stored12. During administrative registration, passwords are hashed using bcrypt with a work factor of 12 rounds and salted to resist rainbow-table attacks22.  
When verifying credentials, the database retrieves the hashed record, and bcrypt compares it securely to resist timing attacks22. Upon validation, the server generates a cryptographically signed JWT4. The token header, payload (containing the user ID and role), and signature are packed together:
JWT Header:  \{"alg": "HS256", "typ": "JWT"\}  
JWT Payload: \{"sub": "65f8a2b1", "role": "Admin", "exp": 1710412800\}
The system sends this token back to the browser using an HttpOnly and Secure cookie flag21. The HttpOnly flag prevents client-side scripts from reading the cookie, mitigating Cross-Site Scripting (XSS) risks, while the Secure flag ensures the cookie is only transmitted over HTTPS21.  
Administrative APIs are protected using authorization middleware that checks both token validity and user roles1. If a route is configured for administrative access, the middleware decodes the token from the request cookies, verifies the signature against the server's private secret, and checks if the role payload matches Admin4. If the validation fails, the system returns a 403 Forbidden response to protect the endpoints23.
## **User Experience Engineering and Frontend Interface Architecture**
To ensure high usability across desktop and mobile devices, the presentation layer uses modular components and client-side routing built with React Router DOM1.
### **Page Routing and State Mappings**
<table>
<tr>
<td>Target Route</td>
<td>Accessibility</td>
<td>Sub-Components</td>
<td>Core Dynamic States</td>
<td>Dynamic APIs Triggered</td>
</tr>
<tr>
<td>:----</td>
<td>:----</td>
<td>:----</td>
<td>:----</td>
<td>:----</td>
</tr>
<tr>
<td>/</td>
<td>Public</td>
<td>SearchBar, FeaturedRooms, RecommenderCarousel</td>
<td>searchQuery, recommendations, dates</td>
<td>GET /api/recommender \[cite: 25\]</td>
</tr>
<tr>
<td>/search-results</td>
<td>Public</td>
<td>FilterSidebar, HotelCardGrid</td>
<td>filters, sorting, listings</td>
<td>GET /api/rooms/search \[cite: 26\]</td>
</tr>
<tr>
<td>/hotel/:id</td>
<td>Public</td>
<td>Gallery, AmenityGrid, AvailabilityWidget</td>
<td>selectedDates, availableRooms</td>
<td>GET /api/rooms/:id/check \[cite: 7\]</td>
</tr>
<tr>
<td>/booking/:hotelId</td>
<td>Authenticated</td>
<td>GuestForm, CostBreakdown, PaymentSelector</td>
<td>bookingData, invoiceTotal</td>
<td>POST /api/bookings/create \[cite: 7, 17\]</td>
</tr>
<tr>
<td>/payment</td>
<td>Authenticated</td>
<td>StripeCardField, RazorpayUPIButton</td>
<td>clientSecret, transactionStatus</td>
<td>POST /api/payment/intent \[cite: 17, 27\]</td>
</tr>
<tr>
<td>/booking/confirmation</td>
<td>Authenticated</td>
<td>ReceiptCard, SupportDetails</td>
<td>bookingSummary, emailStatus</td>
<td>GET /api/bookings/:id \[cite: 28\]</td>
</tr>
<tr>
<td>/admin/login</td>
<td>Public</td>
<td>LoginForm, OTPVerification</td>
<td>credentials, loginError</td>
<td>POST /api/admin/auth \[cite: 4\]</td>
</tr>
<tr>
<td>/admin/dashboard</td>
<td>Protected (Admin)</td>
<td>MetricCard, SidebarNavigation</td>
<td>revenueStats, occupancyRates</td>
<td>GET /api/admin/metrics \[cite: 5\]</td>
</tr>
<tr>
<td>/admin/rooms</td>
<td>Protected (Admin)</td>
<td>RoomList, ImageUploader, CalendarWidget</td>
<td>roomsList, uploadBuffers</td>
<td>POST /api/admin/rooms \[cite: 15\]</td>
</tr>
<tr>
<td>/admin/bookings</td>
<td>Protected (Admin)</td>
<td>BookingTable, StatusSelector</td>
<td>bookingsList, filterStatus</td>
<td>PUT /api/admin/bookings/:id \[cite: 7\]</td>
</tr>
</table>
### **Frontend Page Architectures**
#### **Landing Page (/)**
The landing page serves as the entry point, featuring a responsive search bar (SearchBar) that collects check-in/check-out dates, destination, and guest counts1. Directly below this, the SmartStay Recommender uses AI to suggest personalized hotel choices to returning users25.
#### **Search Results Page (/search-results)**
This view presents available listings in a card grid (HotelCardGrid) alongside filtering controls (FilterSidebar)1. Users can filter hotels by location, price range, room type, and amenities26. Each card displays an optimized image, listing name, average rating, price per night, and a "Book Now" action button that forwards the user to the booking step1.
#### **Hotel Detail Page (/hotel/:id)**
This page displays information about the selected hotel, including a high-definition image gallery (Gallery), detailed room specs, and a listed check of amenities26. An interactive checking widget (AvailabilityWidget) validates check-in and check-out dates7. If availability is confirmed, the widget calculates the total stay pricing and activates a "Book Room" button to initiate the checkout flow.
#### **Booking Page (/booking/:hotelId)**
This interface renders a guest form (GuestForm) to collect names, email addresses, and phone numbers. A structural side-panel (CostBreakdown) calculates invoice totals:  
!\[\]\[image1\]  
Once inputs are validated, clicking "Pay Now" redirects the user to the payment gateway.
#### **Payment Page (/payment)**
This secure route loads Stripe Elements or Razorpay scripts27. It displays credit card inputs and UPI options, disabling action buttons during payment execution to prevent duplicate transactions16. Successful authorization redirects the user to /booking/confirmation, while failures redirect them to a dynamic error page with context-specific recovery steps17.
#### **Booking Confirmation Page (/booking/confirmation)**
This receipt view summarizes the successful reservation, displaying the unique Booking ID, total amount paid, check-in/check-out dates, and room allocation details. It also alerts the user that a confirmation email has been dispatched to their verified address28.
## **High-Concurrency Database Design and Double-Booking Prevention**
Maintaining accurate real-time inventory under high concurrent load is a critical requirement of the system7. If two users attempt to book the last room simultaneously, a naive implementation can result in overbooking7.
### **Persistence Modeling Structures**
The platform supports both non-relational (MongoDB) and relational (MySQL) persistence paradigms, using optimized schemas to track availability:
MongoDB Document Model (Resources collection)  
┌────────────────────────────────────────────────────────┐  
│ _id: ObjectId("65f8c3d2")                              │  
│ type: "Deluxe"                                         │  
│ pricePerNight: 150                                     │  
│ bookedSlots: \[                                         │  
│   \{                                                    │  
│     bookingId: ObjectId("65f8c401"),                   │  
│     start: ISODate("2026-04-01T14:00:00Z"),            │  
│     end: ISODate("2026-04-05T10:00:00Z")               │  
│   \}                                                    │  
│ \]                                                      │  
└────────────────────────────────────────────────────────┘
MySQL Relational Schema (Room daily availability)  
┌──────────────────┬─────────────────┬──────────┬────────┐  
│   room_type_id   │      date       │ capacity │ booked │  
├──────────────────┼─────────────────┼──────────┼────────┤  
│ deluxe_001       │ 2026-04-01      │    10    │    3   │  
│ deluxe_001       │ 2026-04-02      │    10    │    3   │  
│ deluxe_001       │ 2026-04-03      │    10    │    4   │  
└──────────────────┴─────────────────┴──────────┴────────┘
In MongoDB, hotel rooms are modeled inside a Resources collection7. To avoid complex multi-collection joins during availability checks, each room document contains a nested array of booked intervals (bookedSlots)7. Compound database indexes are built on the resource status and date ranges to ensure that queries execute in !\[\]\[image2\] time7.  
In MySQL, rooms are represented using a normalized daily inventory table20. This table pre-populates individual rows for every combination of room type and calendar date, allowing the system to verify availability using index-optimized queries20.
### **Overlapping Reservation Logic**
To determine if a room is available for a requested stay with check-in date !\[\]\[image3\] and check-out date !\[\]\[image4\], the database must check that the requested range does not overlap with any existing bookings !\[\]\[image5\]7. Two date ranges overlap if and only if the requested start date occurs before an existing booking's end date, and the requested end date occurs after that booking's start date7:  
!\[\]\[image6\]  
In MongoDB, this overlap check is processed atomically using query operators7. The query uses the \$not and \$elemMatch operators to locate room documents where no array element in bookedSlots matches the overlap inequality7:
JavaScript  
const checkAvailability = async (db, roomId, checkIn, checkOut) =\> \{  
	const start = new Date(checkIn);  
	const end = new Date(checkOut);
	// Search for the room while ensuring no overlapping bookings exist  
	const room = await db.collection('rooms').findOne(\{  
		_id: roomId,  
		isActive: true,  
		bookedSlots: \{  
			\$not: \{  
				\$elemMatch: \{  
					start: \{ \$lt: end \},  
					end: \{ \$gt: start \}  
				\}  
			\}  
		\}  
	\});
	return room !== null;  
\};
### **Concurrency Isolation Control Strategy**
When multiple transactions attempt to write to the same document simultaneously, the system prevents conflicts using specific concurrency strategies9:
OPTIMISTIC LOCKING (OCC)  
Read Document ───\> Modify State ───\> Write & Check Version Key (__v)  
	├── Matches: Commit and increment version  
	└── Mismatch: Reject and trigger client retry
PESSIMISTIC LOCKING (PCC)  
Acquire Distributed Lock ───\> Read Document ───\> Modify State ───\> Write ───\> Release Lock \[cite: 8\]  
	(Blocks and queues all concurrent requests on the same resource)
Under Optimistic Concurrency Control (OCC), the application permits multiple concurrent reads without blocking9. When saving changes, Mongoose uses the version key (__v) to ensure the document has not been updated since it was read31. If a version conflict is detected, the transaction fails, preventing the database from overwriting concurrent changes31.  
Pessimistic Concurrency Control (PCC) is used for high-demand bookings9. Before reading the document, the application acquires an exclusive distributed lock (via Redis) for that specific room ID8. This locks out concurrent transactions, serializing writes to prevent conflicts9.  
Once the booking is confirmed and committed, the lock is released, allowing queued requests to process safely without data corruption8.
## **AI Personalized Recommendation Modeling: SmartStay Recommender**
To improve user engagement and retention, the landing page includes the SmartStay Recommender system25. This engine utilizes content-based filtering to dynamically analyze hotel attributes and generate personalized recommendations25.
### **Algorithmic Architecture**
The system profiles both hotels and users to generate matching recommendations25:
	Hotel Attributes (Description, Tags, Amenities)   
		│  
		▼  
		\[TF-IDF Vectorization Engine\] ───\> Hotel Attribute Vectors \[H\]  
			│  
			▼  
		\[Cosine Similarity Calculator\] \<─── User Preference Vector \[U\]  
			│  
			▼  
		Ordered Hotel Recommendations Array
Hotels are represented by high-dimensional vectors computed using Term Frequency-Inverse Document Frequency (TF-IDF)32. This mapping converts descriptions, location traits, and amenities into mathematical weights that reflect their relative importance32.  
User preferences are modeled as dynamic vectors that update based on their interaction history, including previous searches, viewed hotel profiles, and confirmed bookings25.
### **Mathematical Foundations**
Term Frequency (TF) calculates the density of term !\[\]\[image7\] in a hotel's descriptive profile !\[\]\[image8\]32:  
!\[\]\[image9\]  
where !\[\]\[image10\] is the frequency of term !\[\]\[image7\] within document !\[\]\[image8\]32.  
Inverse Document Frequency (IDF) measures the specificity of term !\[\]\[image7\] across the entire catalog of hotels !\[\]\[image11\]32:  
!\[\]\[image12\]  
The final weight of term !\[\]\[image7\] in document !\[\]\[image8\] is:  
!\[\]\[image13\]  
To match a user's preference vector !\[\]\[image14\] with a hotel vector !\[\]\[image15\], the recommender calculates the cosine similarity of the two vectors32:  
!\[\]\[image16\]  
This returns a score between !\[\]\[image17\] and !\[\]\[image18\]32. The platform filters out recommendations below a minimum threshold (!\[\]\[image19\]) and ranks the remaining matches to display the top results in the user's feed32.
## **Secure Payment Pipelines and Webhook Verification**
Handling financial transactions securely requires a system design that prevents duplicate charges and ensures accurate order completion8.
### **The Payment Intent Lifecycle**
To handle card transactions securely, [StayWise.ai](http://StayWise.ai) uses a Payment Intent workflow to track and manage each payment attempt:
┌──────────────┐              ┌────────────────┐              ┌────────────┐  
│React Frontend│              │Node/Express API│              │ Stripe API │  
└──────┬───────┘              └───────┬────────┘              └─────┬──────┘  
	│                              │                             │  
	│ 1. Initiate checkout click   │                             │  
	├─────────────────────────────\>│                             │  
	│                              │ 2. Create PaymentIntent     │  
	│                              ├────────────────────────────\>│  
	│                              │    (Amount, Metadata)       │  
	│                              │                             │  
	│                              │ 3. Return client_secret     │  
	│                              │\<────────────────────────────┤  
	│ 4. Mount secure Elements Card│                             │  
	│\<─────────────────────────────┤                             │  
	│                              │                             │  
	│ 5. Submit card details       │                             │  
	├──────────────────────────────┼────────────────────────────\>│  
	│                              │                             │  
	│ 6. Process auth / 3D Secure  │                             │  
	│\<─────────────────────────────┼─────────────────────────────┤  
	│                              │                             │  
	│ 7. Payment success callback  │                             │  
	│\<─────────────────────────────┼─────────────────────────────┤  
	│                              │                             │  
	│                              │ 8. Send payment.succeeded   │  
	│                              │\<────────────────────────────┤  
	│                              │    (Asynchronous Webhook)   │
This workflow ensures that raw card data is securely sent directly to Stripe, reducing the server's compliance overhead16.
### **Asynchronous Webhook Processing**
Relying solely on frontend redirection callbacks to confirm bookings is a common point of failure in e-commerce integrations13. If a user closes the browser or loses connection immediately after authorizing a payment, the callback may never run, leaving the booking marked as "unpaid" despite a successful charge13.  
To prevent this, the backend uses secure, asynchronous webhooks (/api/payment/webhook) as the single source of truth for payment confirmations13.
JavaScript  
const express = require('express');  
const crypto = require('crypto');  
const router = express.Router();
// Define express.raw middleware to verify Stripe signatures using the raw payload  
[router.post](http://router.post)('/webhook/stripe', express.raw(\{ type: 'application/json' \}), (req, res) =\> \{  
	const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);  
	const signature = req.headers\['stripe-signature'\];  
	let event;
	try \{  
		// Validate signature authenticity and prevent tampering  
		event = stripe.webhooks.constructEvent(  
			req.body,  
			signature,  
			process.env.STRIPE_WEBHOOK_SECRET  
		);  
	\} catch (err) \{  
		console.error(\`Webhook signature validation failed: \$\{err.message\}\`);  
		return res.status(400).send(\`Signature verification error: \$\{err.message\}\`);  
	\}
	// Handle successful payments  
	if (event.type === 'payment_intent.succeeded') \{  
		const paymentIntent = [event.data](http://event.data).object;  
		// Update internal bookings record to 'Confirmed'  
		const bookingId = paymentIntent.metadata.bookingId;  
		confirmBooking(bookingId, [paymentIntent.id](http://paymentIntent.id));  
	\}
	res.status(200).json(\{ received: true \});  
\});
[router.post](http://router.post)('/webhook/razorpay', express.raw(\{ type: 'application/json' \}), (req, res) =\> \{  
	const secret = process.env.RAZORPAY_WEBHOOK_SECRET;  
	const signature = req.headers\['x-razorpay-signature'\];
	// Calculate HMAC-SHA256 hash using secret  
	const hash = crypto  
		.createHmac('sha256', secret)  
		.update(req.body)  
		.digest('hex');
	if (hash !== signature) \{  
		return res.status(400).send('Invalid Razorpay webhook signature');  
	\}
	const payload = JSON.parse(req.body);  
	if (payload.event === 'order.paid') \{  
		const orderId = [payload.payload.order.entity.id](http://payload.payload.order.entity.id);  
		// Complete booking workflow  
	\}
	res.status(200).send(\{ status: 'ok' \});  
\});
Using express.raw() instead of standard global JSON parsing is required for signature verification13. Modifying raw spaces, keys, or carriage return characters before hashing will invalidate the calculated signature, causing valid requests to fail13.
### **Replay Attacks and Idempotency**
To prevent replay attacks, where an attacker intercepts and resubmits a valid transaction event, Stripe signatures include an encrypted timestamp header36. The backend SDK compares this timestamp against the server's NTP clock and rejects any payloads with a time skew exceeding five minutes36.  
The system prevents duplicate transaction executions by recording processed event IDs in a Redis cache with a 24-hour expiration window8. Incoming webhooks check this cache first; if the event ID is already present, the backend returns a 200 OK response immediately, skipping further database updates36.
## **Stateless Cloud Media Processing Pipelines**
To ensure the application remains horizontally scalable, administrative endpoints like /admin/rooms must avoid saving file uploads to local disk storage6. Writing media files to local storage makes server instances stateful, preventing multi-instance scaling on cloud platforms like AWS or Render6. [StayWise.ai](http://StayWise.ai) uses a stateless processing pipeline that handles image uploads completely in memory6.
### **Memory-Buffered File Handling**
\[Client Form Post (multipart/form-data)\]  
	│  
	▼  
	\[Multer Middleware Engine\]  
		│  
Memory buffer initialization (no local disk utilization) \[cite: 6\]  
	│  
	▼  
	\[Streamifier Converter\]  
		│  
	Binary buffer to readable network stream pipe \[cite: 39\]  
		│  
		▼  
		\[Cloudinary CDN Uploader\]  
			(Returns public URL)
The system uses Multer's memoryStorage engine, which holds uploaded image data in memory as buffers rather than writing them to disk6. The upload configuration includes strict limits on file sizes and types to prevent excessive resource consumption14:
JavaScript  
const multer = require('multer');
const memoryStorage = multer.memoryStorage();
const imageFilter = (req, file, cb) =\> \{  
	const allowedTypes = \['image/jpeg', 'image/png', 'image/webp'\];  
	if (allowedTypes.includes(file.mimetype)) \{  
		cb(null, true);  
	\} else \{  
		cb(new Error('Payload upload error: Only JPEG, PNG, and WEBP image uploads are supported'), false);  
	\}  
\};
const parser = multer(\{  
	storage: memoryStorage,  
	limits: \{ fileSize: 4 \* 1024 \* 1024 \}, // Limit file size to 4MB \[cite: 42\]  
	fileFilter: imageFilter  
\});
### **The In-Memory Streaming Pipeline**
To upload memory buffers directly to Cloudinary without using Base64 encoding—which can bloat payloads and block the CPU—the system uses streamifier to convert buffers into readable streams6. These streams are piped directly to Cloudinary's upload API using the Node.js stream API6:
JavaScript  
const streamifier = require('streamifier');  
const cloudinary = require('cloudinary').v2;
const uploadStreamToCloudinary = (fileBuffer) =\> \{  
	return new Promise((resolve, reject) =\> \{  
		const uploadStream = cloudinary.uploader.upload_stream(  
			\{  
				folder: 'staywise_listings',  
				transformation: \[  
					\{ width: 800, height: 600, crop: 'fill', gravity: 'auto' \}, // Standardize dimensions  
					\{ quality: 'auto', fetch_format: 'auto' \} // Apply automatic optimization  
				\]  
			\},  
			(error, result) =\> \{  
				if (error) \{  
					reject(error);  
				\} else \{  
					resolve([result.secure](http://result.secure)_url); // Extract CDN hosting URL  
				\}  
			\}  
		);
		// Convert memory buffer to readable stream and pipe to Cloudinary  
		streamifier.createReadStream(fileBuffer).pipe(uploadStream);  
	\});  
\};
This streaming architecture allows the Express application servers to remain completely stateless6. Uploaded images are streamed directly to Cloudinary, and the resulting CDN hosting URLs are stored in MongoDB6.
## **State Management and Client-Side Re-render Optimization**
Maintaining state consistency is essential when multiple views must reflect real-time updates, such as date selections or changes in cart totals10.
### **Context API vs. Redux Toolkit**
REACT CONTEXT API  
┌──────────────────────────┐  
│   Global Context Store   │  
└────────────┬─────────────┘  
	│  
┌─────────────────┴─────────────────┐  
▼                                   ▼  
┌──────────────┐                    ┌──────────────┐  
│ Search View  │                    │ Card Display │  
│ (Re-renders) │                    │ (Re-renders) │  
└──────────────┘                    └──────────────┘  
(Any state change forces ALL consumers to re-render)
	REDUX TOOLKIT  
	┌──────────────────────────┐  
	│   Centralized Slices     │  
	└────────────┬─────────────┘  
		│  
	┌─────────────────┴─────────────────┐  
	▼ (Dynamic Selector Hooks)          ▼  
┌──────────────────────┐            ┌──────────────────────┐  
│    useSelector()     │            │    useSelector()     │  
│ (Triggers render on  │            │ (Triggers render on  │  
│ specific key change) │            │ specific key change) │  
└──────────────────────┘            └──────────────────────┘  
(Finer subscription filters limit unnecessary rendering updates) \[cite: 43\]
To optimize the frontend, [StayWise.ai](http://StayWise.ai) uses a hybrid state architecture:
<table>
<tr>
<td>State Management Option</td>
<td>React Context API</td>
<td>Redux Toolkit</td>
</tr>
<tr>
<td>:----</td>
<td>:----</td>
<td>:----</td>
</tr>
<tr>
<td>**Boilerplate Requirements**</td>
<td>Minimal setup, uses standard functional hooks44.</td>
<td>Moderate setup, requiring actions, slices, and store wiring10.</td>
</tr>
<tr>
<td>**Render Behavior**</td>
<td>Any change to a context value triggers re-renders across all consumer components10.</td>
<td>Components subscribe to specific slices; re-renders only trigger if those values change43.</td>
</tr>
<tr>
<td>**Best Use Case**</td>
<td>Semi-static values like UI themes, language selections, or basic auth checks10.</td>
<td>High-frequency dynamic states, such as hotel search results and transactional forms10.</td>
</tr>
<tr>
<td>**Debugging Tools**</td>
<td>Limited native diagnostic options for tracing state histories10.</td>
<td>Advanced tracking via Redux DevTools, supporting features like time-travel debugging10.</td>
</tr>
</table>
For high-frequency state updates—such as search lists or booking inputs—the application uses Redux Toolkit to prevent rendering bottlenecks10. Using optimized selectors ensures that child components only re-render when their specific data slices are modified43.
## **Endpoint Protection and Server-Side Security Configurations**
[StayWise.ai](http://StayWise.ai) secures its endpoints by applying several defense-in-depth measures to defend the backend against common web vulnerabilities22.
### **Security Middleware Layers**
The backend uses a layered middleware configuration to implement basic API protections22:
	Incoming Client HTTP Payload  
		│  
		▼  
	\[Rate Limiter (express-rate-limit)\] ──\> Limit DDoS attacks  
		│  
		▼  
		\[Helmet (Security Headers)\] ────\> CSP & XSS protections \[cite: 47\]  
			│  
			▼  
		\[CORS (Cross-Origin Resource Sharing)\] ─\> Whitelist origins  
			│  
			▼  
			Express Controller Methods
To limit abuse, endpoints are protected by rate-limiting rules using express-rate-limit22. This restricts each client IP to a maximum of 100 requests per 15-minute window, returning a 429 Too Many Requests error if this limit is exceeded22.  
To secure outgoing HTTP responses, the application configures helmet to apply standard security headers22:
JavaScript  
const helmet = require('helmet');
app.use(helmet(\{  
	contentSecurityPolicy: \{  
		directives: \{  
			defaultSrc: \["'self'"\],  
			scriptSrc: \["'self'", "[https://js.stripe.com](https://js.stripe.com)", "[https://checkout.razorpay.com](https://checkout.razorpay.com)"\],  
			frameSrc: \["'self'", "[https://js.stripe.com](https://js.stripe.com)", "[https://api.razorpay.com](https://api.razorpay.com)"\],  
			imgSrc: \["'self'", "data:", "[https://res.cloudinary.com](https://res.cloudinary.com)"\],  
			styleSrc: \["'self'", "'unsafe-inline'", "[https://fonts.googleapis.com](https://fonts.googleapis.com)"\]  
		\}  
	\},  
	crossOriginOpenerPolicy: \{ policy: 'same-origin' \}, // Help mitigate Spectre-style attacks \[cite: 47\]  
	strictTransportSecurity: \{  
		maxAge: 31536000, // Enforce SSL connection behavior for one year \[cite: 47\]  
		includeSubDomains: true,  
		preload: true  
	\}  
\}));
Cross-Origin Resource Sharing (CORS) is restricted to whitelisted frontend domains to prevent unauthorized cross-origin requests48:
JavaScript  
const cors = require('cors');
const whitelistedOrigins = \['[https://staywise.ai](https://staywise.ai)', '[https://admin.staywise.ai](https://admin.staywise.ai)'\];
const corsConfiguration = \{  
	origin: (origin, callback) =\> \{  
		if (!origin \|\| whitelistedOrigins.includes(origin)) \{  
			callback(null, true);  
		\} else \{  
			callback(new Error('Rejected: Cross-Origin request not allowed by CORS rules'), false);  
		\}  
	\},  
	methods: \['GET', 'POST', 'PUT', 'DELETE'\],  
	allowedHeaders: \['Content-Type', 'Authorization'\],  
	credentials: true, // Allow cookies to pass across domains  
	optionsSuccessStatus: 200 // Prevent legacy client bottlenecks on OPTIONS pre-flight \[cite: 49\]  
\};
app.use(cors(corsConfiguration));
This configuration blocks unauthorized external web apps from interacting with the backend, protecting system endpoints from unauthorized data access or modification48.
## **Infrastructure Topography and Deployment Blueprints**
Deploying [StayWise.ai](http://StayWise.ai) in production requires a highly available, stateless infrastructure configuration to support continuous, dynamic updates1.
┌──────────────┐       ┌────────────────────┐       ┌────────────────────────┐  
│Vercel Engine │ ────\> │ Render/AWS Web App │ ────\> │ MongoDB Atlas Database │  
└──────────────┘       └────────────────────┘       └────────────────────────┘  
	(Host Client)          (Host Stateless App)         (Global Cloud Cluster)  
		▲  
		│ Media Uploads  
		▼  
		┌──────────────┐  
		│Cloudinary CDN│  
		└──────────────┘
The presentation layer is deployed to a globally distributed static hosting provider (e.g., Vercel)1. Vercel caches static assets across edge servers close to users, reducing page load times and ensuring fast initial paint times for customers6.  
The application layer is deployed in stateless Docker containers on container engines like Render Web Services or AWS ECS1. This stateless runtime model allows the containers to scale horizontally based on demand metrics like CPU utilization or incoming request rates1.  
The data tier is deployed using a fully managed MongoDB Atlas cluster17. The cluster is configured with three-node replica sets distributed across availability zones, ensuring automated recovery and uninterrupted service during hardware failures50.  
To protect sensitive keys and configurations, values such as Stripe keys, database strings, and Cloudinary secrets are kept out of raw code6. Instead, these parameters are injected as environment variables directly at container initialization6:
# Production Environment Variables Profile (.env)
NODE_ENV=production  
MONGO_URI=mongodb+srv://admin_pool:[secure_string@staywise-cluster.mongodb.net](mailto:secure_string@staywise-cluster.mongodb.net)/staywise?retryWrites=true&w=majority  
STRIPE_SECRET_KEY=sk_prod_51Op...  
STRIPE_WEBHOOK_SECRET=whsec_A8d...  
CLOUDINARY_API_SECRET=cld_sec_9dF...  
JWT_PRIVATE_SECRET=crypto_signed_token_payload...
## **Architectural Synthesis and System Blueprint**
To deliver a scalable, production-ready system, the structural relationships between the client-side routes, backend security measures, and database management must be aligned into a cohesive design.
### **Structural Flow Mapping**
The application coordinates frontend views, API endpoints, backend operations, and databases through a tightly coupled flow, mapping every user interaction to a secured clean-architecture layer:
\[React Frontend Client Routes\]  
	├── / (Landing Page: Search Bar & Recommender AI) ──\> Fetch AI suggestions  
	├── /search-results (Hotel listings, Filters) ──────\> Read-replica optimized query  
	├── /hotel/:id (Details & Live Availability Check) ─\> Atomic overlapping slot lookup  
	├── /booking/:hotelId (Checkout & Details Form) ────\> Create internal order DB record  
	├── /payment (Secure Elements Framework) ───────────\> Acquire Client Secret  
	├── /booking/confirmation (Receipt Generation) ─────\> Asynchronous email execution  
	│  
\[Backend API Controller Layer\]  
	├── Rate Limiting & Helmet Security Scans ──────────\> Block DoS and brute-force  
	├── RBAC Authorization Verification ────────────────\> Validate Guest vs. Admin roles  
	├── In-Memory Multer Processing ────────────────────\> Convert photo buffer to stream  
	│  
\[Database Concurrency & Locking Layer\]  
	├── Write Filter OCC (version key) ─────────────────\> Safe commit under low conflict  
	├── Redis Distributed Lock (pessimistic lock) ──────\> Safe commit under peak reservation  
	└── BookedSlots Array Isolation (\$elemMatch) ──────\> Strict reservation isolation
## **Technical Recommendations and System Implementations**
This technical review highlights key system integrations to ensure the platform remains secure, consistent, and performant as it scales:
- **Enforce Clean-Architecture Layouts**: Maintain clear boundaries between client views, orchestration classes, and data models to simplify future database or payment gateway migrations3.  
- **Implement Secure Multi-Mode Locking Policies**: Use Optimistic Concurrency Control (OCC) for typical metadata or profile updates to maximize throughput9. Switch to distributed pessimistic locks for high-demand rooms or peak booking dates to eliminate double-booking risks8.  
- **Use Asynchronous Webhooks for Transaction Verification**: Never rely solely on client-side success callbacks for payment completion13. Treat secure webhooks as the single source of truth for payment status, and enforce signature validation to block unauthorized payloads13.  
- **Deploy Stateless Image-Streaming Pipelines**: Configure file handlers to use in-memory buffers instead of writing to local disk, streaming media directly to CDN networks like Cloudinary using non-blocking stream interfaces14.  
- **Optimize React Rendering Behavior**: Use React Context API for relatively static settings like layout themes, and use Redux Toolkit's subscription selectors for high-frequency search and checkout states to prevent unnecessary re-renders10.
#### **Works cited**
1. MERN Stack Architecture Explained for Beginners - Scoop Labs, [https://scooplabs.in/blog/mern-stack-architecture-explained-for-beginners](https://scooplabs.in/blog/mern-stack-architecture-explained-for-beginners)  
2. MERN Stack Explained - MongoDB, [https://www.mongodb.com/resources/languages/mern-stack](https://www.mongodb.com/resources/languages/mern-stack)  
3. Understanding Clean Architecture in Large MEAN and MERN Codebases, [https://embarkingonvoyage.com/blog/understanding-clean-architecture-in-large-mean-and-mern-codebases/](https://embarkingonvoyage.com/blog/understanding-clean-architecture-in-large-mean-and-mern-codebases/)  
4. Clean Architecture in MERN Stack: Structuring Apps That Scale \| by Ashish Kumar Vaish, [https://medium.com/@ashishkumarvaish/clean-architecture-in-mern-stack-structuring-apps-that-scale-499cbf2e0ad5](https://medium.com/@ashishkumarvaish/clean-architecture-in-mern-stack-structuring-apps-that-scale-499cbf2e0ad5)  
5. Understanding Modular Architecture in MERN - GeeksforGeeks, [https://www.geeksforgeeks.org/mern/understanding-modular-architecture-in-mern/](https://www.geeksforgeeks.org/mern/understanding-modular-architecture-in-mern/)  
6. Handling File Uploads in Node.js with Multer and Cloudinary. \| by Amobeda Charles, [https://medium.com/@amobedac/handling-file-uploads-in-node-js-with-multer-and-cloudinary-1c15c793d58f](https://medium.com/@amobedac/handling-file-uploads-in-node-js-with-multer-and-cloudinary-1c15c793d58f)  
7. How to Build a Booking and Reservation System with MongoDB - OneUptime, [https://oneuptime.com/blog/post/2026-03-31-mongodb-build-booking-reservation-system/view](https://oneuptime.com/blog/post/2026-03-31-mongodb-build-booking-reservation-system/view)  
8. Race Condition Vulnerabilities in Financial Transaction Processing Systems - Sourcery AI, [https://www.sourcery.ai/vulnerabilities/race-condition-financial-transactions](https://www.sourcery.ai/vulnerabilities/race-condition-financial-transactions)  
9. Compare-and-Swap and Optimistic Locking: How Every Database Implements It, [https://abstractalgorithms.dev/compare-and-swap-optimistic-locking](https://abstractalgorithms.dev/compare-and-swap-optimistic-locking)  
10. Using Context API vs Redux for State Management - NamasteDev Blogs, [https://namastedev.com/blog/using-context-api-vs-redux-for-state-management/](https://namastedev.com/blog/using-context-api-vs-redux-for-state-management/)  
11. Redux vs Context API: A Practical Guide for Real Projects - NareshIT, [https://nareshit.com/blogs/redux-vs-context-api-practical-guide](https://nareshit.com/blogs/redux-vs-context-api-practical-guide)  
12. Hotel Booking System using Node.js and MongoDB - GeeksforGeeks, [https://www.geeksforgeeks.org/node-js/hotel-booking-system-using-node-js-and-mongodb/](https://www.geeksforgeeks.org/node-js/hotel-booking-system-using-node-js-and-mongodb/)  
13. Razorpay Webhooks in MERN Stack - DEV Community, [https://dev.to/vjygour/razorpay-webhooks-in-mern-stack-2d2b](https://dev.to/vjygour/razorpay-webhooks-in-mern-stack-2d2b)  
14. Handling File Uploads in Express.js with Multer: The Complete Guide (2026 Edition), [https://dev.to/bhupeshchandrajoshi/handling-file-uploads-in-expressjs-with-multer-the-complete-guide-2026-edition-3ff7](https://dev.to/bhupeshchandrajoshi/handling-file-uploads-in-expressjs-with-multer-the-complete-guide-2026-edition-3ff7)  
15. Node.js File Upload Guide: Multer, Cloudinary & Express - Mantra Ideas, [https://mantraideas.com/node-js-file-upload/](https://mantraideas.com/node-js-file-upload/)  
16. Build an advanced integration with Node.js - Stripe Documentation, [https://docs.stripe.com/payments/quickstart?lang=node](https://docs.stripe.com/payments/quickstart?lang=node)  
17. Razorpay Integration with MERN Stack (Complete Developer Guide) - DEV Community, [https://dev.to/vjygour/razorpay-integration-with-mern-stack-complete-developer-guide-4ghf](https://dev.to/vjygour/razorpay-integration-with-mern-stack-complete-developer-guide-4ghf)  
18. Web Enabled Smart Ration Distribution Platform with MongoDB - IJIRT, [https://ijirt.org/publishedpaper/IJIRT199984_PAPER.pdf](https://ijirt.org/publishedpaper/IJIRT199984_PAPER.pdf)  
19. How to design my schema for returning rooms and hotels not booked in - MongoDB, [https://www.mongodb.com/community/forums/t/how-to-design-my-schema-for-returning-rooms-and-hotels-not-booked-in/133797](https://www.mongodb.com/community/forums/t/how-to-design-my-schema-for-returning-rooms-and-hotels-not-booked-in/133797)  
20. Hotel Booking: Schema Design Comparison - DEV Community, [https://dev.to/sumedhbala/hotel-booking-schema-design-comparison-g3h](https://dev.to/sumedhbala/hotel-booking-schema-design-comparison-g3h)  
21. Production Best Practices: Security - Express.js, [https://expressjs.com/en/advanced/best-practice-security/](https://expressjs.com/en/advanced/best-practice-security/)  
22. NodeJS Security Best Practices - DEV Community, [https://dev.to/mohammadfaisal/nodejs-security-best-practices-34ck](https://dev.to/mohammadfaisal/nodejs-security-best-practices-34ck)  
23. Mastering Clean Architecture in Node.js: A Practical Guide for Express and MongoDB, [https://dev.to/bateyjosue/mastering-clean-architecture-in-nodejs-a-practical-guide-for-express-and-mongodb-4ajl](https://dev.to/bateyjosue/mastering-clean-architecture-in-nodejs-a-practical-guide-for-express-and-mongodb-4ajl)  
24. Getting errors while uploading (Buffer) image file to Cloudinary in Node JS - Stack Overflow, [https://stackoverflow.com/questions/78095568/getting-errors-while-uploading-buffer-image-file-to-cloudinary-in-node-js](https://stackoverflow.com/questions/78095568/getting-errors-while-uploading-buffer-image-file-to-cloudinary-in-node-js)  
25. What is a Recommendation Engine? - MongoDB, [https://www.mongodb.com/resources/basics/artificial-intelligence/recommendation-engines](https://www.mongodb.com/resources/basics/artificial-intelligence/recommendation-engines)  
26. What should be my MongoDB schema for room booking? - Stack Overflow, [https://stackoverflow.com/questions/70082808/what-should-be-my-mongodb-schema-for-room-booking](https://stackoverflow.com/questions/70082808/what-should-be-my-mongodb-schema-for-room-booking)  
27. Build a checkout page with Payment Intents API - Stripe Documentation, [https://docs.stripe.com/payments/quickstart?client=react&lang=node&locale=en-GB](https://docs.stripe.com/payments/quickstart?client=react&lang=node&locale=en-GB)  
28. How to Integrate Payment Gateways in MERN Stack E-Commerce Sites - Organic Opz, [https://www.organicopz.com/merndevelopment/integrate-payment-gateways-mern-stack-ecommerce](https://www.organicopz.com/merndevelopment/integrate-payment-gateways-mern-stack-ecommerce)  
29. Integrating RazorPay Payment Gateway in a MERN Project \| by Adarsha A - Medium, [https://adarshahelvar.medium.com/integrating-razorpay-payment-gateway-in-a-mern-project-2fbc3369eae1](https://adarshahelvar.medium.com/integrating-razorpay-payment-gateway-in-a-mern-project-2fbc3369eae1)  
30. Collect payment details before creating an Intent - Stripe Documentation, [https://docs.stripe.com/payments/accept-a-payment-deferred](https://docs.stripe.com/payments/accept-a-payment-deferred)  
31. Handling Race Conditions and Concurrent Resource Updates in Node and MongoDB by Performing Optimistic Updates \| by Abdul Saleem Mohamed Faheem \| Medium, [https://medium.com/@codersauthority/handling-race-conditions-and-concurrent-resource-updates-in-node-and-mongodb-by-performing-f54140da8bc5](https://medium.com/@codersauthority/handling-race-conditions-and-concurrent-resource-updates-in-node-and-mongodb-by-performing-f54140da8bc5)  
32. Build a Content-based recommendation engine in JS - DEV Community, [https://dev.to/jimatjibba/build-a-content-based-recommendation-engine-in-js-2lpi](https://dev.to/jimatjibba/build-a-content-based-recommendation-engine-in-js-2lpi)  
33. A simple content-based recommender implemented in javascript - GitHub, [https://github.com/stanleyfok/content-based-recommender](https://github.com/stanleyfok/content-based-recommender)  
34. About Webhooks \| Razorpay Docs, [https://razorpay.com/docs/webhooks/](https://razorpay.com/docs/webhooks/)  
35. Razorpay + MERN = way more painful than it has any right to be - Reddit, [https://www.reddit.com/r/node/comments/1rxmyrg/razorpay_mern_way_more_painful_than_it_has_any/](https://www.reddit.com/r/node/comments/1rxmyrg/razorpay_mern_way_more_painful_than_it_has_any/)  
36. Receive Stripe events in your webhook endpoint - Stripe Documentation, [https://docs.stripe.com/webhooks](https://docs.stripe.com/webhooks)  
37. Razorpay Webhooks with Node.js - Sreyas IT Solutions, [https://sreyas.com/blog/razorpay-webhooks-with-node-js/](https://sreyas.com/blog/razorpay-webhooks-with-node-js/)  
38. Set up and deploy a webhook - Stripe Documentation, [https://docs.stripe.com/webhooks/quickstart?lang=node](https://docs.stripe.com/webhooks/quickstart?lang=node)  
39. Node.js File Upload to a Local Server Or to the Cloud - Cloudinary, [https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud](https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud)  
40. Day 45 of #100DaysOfCode — File Upload with Multer and Cloudinary - DEV Community, [https://dev.to/m_saad_ahmad/day-45-of-100daysofcode-file-upload-with-multer-and-cloudinary-1345](https://dev.to/m_saad_ahmad/day-45-of-100daysofcode-file-upload-with-multer-and-cloudinary-1345)  
41. Generative AI Outfits in React: Cloudinary Generative Replace, Background Replace, and Node Upload, [https://cloudinary.com/blog/fashion-app-genai-react-node-js](https://cloudinary.com/blog/fashion-app-genai-react-node-js)  
42. How to upload buffer image to cloudinary? - node.js - Stack Overflow, [https://stackoverflow.com/questions/62626872/how-to-upload-buffer-image-to-cloudinary](https://stackoverflow.com/questions/62626872/how-to-upload-buffer-image-to-cloudinary)  
43. Redux vs Context API — Same Energy, Different Power Level - DEV Community, [https://dev.to/usama_dev/redux-vs-context-api-same-energy-different-power-level-2jjj](https://dev.to/usama_dev/redux-vs-context-api-same-energy-different-power-level-2jjj)  
44. Context API Vs. Redux - GeeksforGeeks, [https://www.geeksforgeeks.org/blogs/context-api-vs-redux-api/](https://www.geeksforgeeks.org/blogs/context-api-vs-redux-api/)  
45. Advanced State Management in React: Context API, Redux Toolkit, and Recoil - Techdots, [https://www.techdots.dev/blog/advanced-state-management-in-react-context-api-redux-toolkit-and-recoil](https://www.techdots.dev/blog/advanced-state-management-in-react-context-api-redux-toolkit-and-recoil)  
46. Using Helmet in Node.js to secure your application - LogRocket Blog, [https://blog.logrocket.com/using-helmet-node-js-secure-application/](https://blog.logrocket.com/using-helmet-node-js-secure-application/)  
47. How to Use Helmet for Security in Express.js - OneUptime, [https://oneuptime.com/blog/post/2026-01-25-helmet-security-expressjs/view](https://oneuptime.com/blog/post/2026-01-25-helmet-security-expressjs/view)  
48. Secure Configuration of CORS in Express \| CodeSignal Learn, [https://codesignal.com/learn/courses/software-and-data-integrity-in-express/lessons/secure-configuration-of-cors-in-express](https://codesignal.com/learn/courses/software-and-data-integrity-in-express/lessons/secure-configuration-of-cors-in-express)  
49. cors middleware - Express.js, [https://expressjs.com/en/resources/middleware/cors/](https://expressjs.com/en/resources/middleware/cors/)  
50. Advanced Backend in NodeJS Course, [https://courses.algocamp.io/learn/Lambda5](https://courses.algocamp.io/learn/Lambda5)  
51. Stripe React Native: A Practical Guide to Mobile Payments - RapidNative, [https://www.rapidnative.com/blogs/stripe-react-native](https://www.rapidnative.com/blogs/stripe-react-native)