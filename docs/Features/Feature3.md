# Feature 3: Dynamic Listings, Vendor System & Feedback Review Engine

> **Status:** ✅ Implemented & Live  
> **Parent Page:** `PRD.md` → Vendor & Guest Core Flows  
> **Design System:** `DESIGN.md` → Elevated Brutalism ("Architectural Premium")  
> **Last Updated:** 2026-07-11

---

## 1. Strategic Purpose

Feature 3 establishes the full vendor-guest data loop:
- Vendors can publish, manage, and configure real architectural stays (no hardcoded content).
- Guests discover live listings with geolocation proximity sorting.
- The rating system reflects verified guest reviews — not synthetic defaults.
- Auth flows split cleanly into guest and vendor pathways from a single entry point.

---

## 2. What Was Implemented

### 2.1 Authentication — Dual Role Login (`AuthPage.jsx`)
A single `/auth` route serves both vendor and guest registration/login. The form captures a `role` field (`guest` | `vendor`). On successful vendor registration, the user is redirected to `/vendor/setup` for geolocation onboarding. Guests land on `/explore`. JWT is stored in an `HttpOnly` + `Secure` cookie (no localStorage exposure).

### 2.2 Vendor Setup Page (`VendorSetupPage.jsx`)
A dedicated onboarding step before the vendor dashboard is accessible:
- Uses **HTML5 Geolocation API** (`navigator.geolocation.getCurrentPosition`) to acquire the vendor's lat/lng.
- Falls back to a manual address input with **OpenStreetMap Nominatim** autocomplete.
- Coordinates are stored in `User.vendorLocation` as a GeoJSON `Point` with 6-decimal precision.
- Saved coordinates are used as the base origin for proximity-sorted room queries.

### 2.3 Vendor Dashboard — Room CRUD (`VendorDashboardPage.jsx`)
Full Create/Read/Update/Delete flow for vendor-owned listings:
- `GET /api/rooms?vendor=<id>` — fetches only the authenticated vendor's rooms.
- `POST /api/rooms` (multipart/form-data) — creates a new listing with Cloudinary image upload.
- `PUT /api/rooms/:id` — updates listing details or status.
- `DELETE /api/rooms/:id` — requires typing exact property title to confirm (danger confirmation modal).
- Status toggle: `active` ↔ `paused` — paused listings are greyscaled and marked UNAVAILABLE on the explore page.

### 2.4 Explore Page — Live Dynamic Listings (`ExplorePage.jsx`)
- All displayed rooms are fetched live from MongoDB via `GET /api/rooms`.
- Supports filter params: `location`, `minPrice`, `maxPrice`, `latitude`/`longitude` (GPS proximity).
- Client-side sort by `price_asc`, `price_desc`, `rating`.
- "Find Nearest Stays" button triggers browser GPS and re-queries with coordinates.
- No hardcoded hotel cards.

### 2.5 Room Details & Reviews (`RoomDetailsPage.jsx`)
- Dynamic room fetch by `slug` via `GET /api/rooms/:slug`.
- Reviews fetched from `GET /api/reviews/room/:id` and displayed as verified guest cards.
- Authenticated users can submit a star rating (1–5) + text comment via `POST /api/reviews`.
- On review submit, the backend recalculates `room.rating` (average) and `room.reviewsCount` atomically.

### 2.6 Backend: Room Controller & Schema (`server/`)
- `Room.js` schema: `rating` default set to `0`, `min: 0`, `max: 5.0`. No fake pre-loaded rating.
- `reviewsCount` defaults to `0`. Both fields update on each new review via aggregate.
- 2dsphere index on `locationCoordinates` for geospatial queries.
- Text index on `location`, `title`, `architecturalStyle` for fast keyword search.

---

## 3. Rating System — Truthful by Design

| State | `reviewsCount` | What Displays |
|---|---|---|
| Newly added listing | `0` | `✦ NEWLY ADDED` amber pulse badge (Explore), `✦ NEWLY LISTED — NO REVIEWS YET` (Details), `✦ NEWLY LISTED` terracotta badge (Vendor Dashboard) |
| Has guest reviews | `> 0` | Real `★ X.XX (N)` rating from verified reviews |

**Rule:** The `rating` field in `Room.js` defaults to `0`. The frontend guards all rating displays behind `reviewsCount === 0`. No synthetic 4.95 default is used anywhere.

---

## 4. Component & File Map

| Component / File | Role |
|---|---|
| `client/src/pages/AuthPage.jsx` | Dual-role auth with vendor/guest toggle |
| `client/src/pages/VendorSetupPage.jsx` | Geolocation onboarding (HTML5 GPS + Nominatim) |
| `client/src/pages/VendorDashboardPage.jsx` | Full vendor CRUD dashboard |
| `client/src/pages/ExplorePage.jsx` | Live dynamic listing grid with GPS filter |
| `client/src/pages/RoomDetailsPage.jsx` | Room detail + review submission + rating display |
| `server/models/Room.js` | Room schema (rating=0 default, 2dsphere index) |
| `server/models/Review.js` | Review schema (rating, comment, user ref) |
| `server/controllers/roomController.js` | Room CRUD + Cloudinary upload pipeline |
| `server/controllers/reviewController.js` | Review creation + rating aggregate recalculation |
| `server/routes/roomRoutes.js` | `/api/rooms` CRUD routes |
| `server/routes/reviewRoutes.js` | `/api/reviews` routes |

---

## 5. Acceptance Criteria

- [x] No hardcoded hotel content — all listings come from MongoDB.
- [x] Vendor setup captures real GPS coordinates via HTML5 API.
- [x] Vendor CRUD: create, edit, pause, delete listings from dashboard.
- [x] Guest explore page queries live rooms with proximity + price + keyword filters.
- [x] Reviews submitted by guests update `room.rating` and `room.reviewsCount` atomically.
- [x] Newly added listings (0 reviews) show a "Newly Added" tag — no fake rating displayed.
- [x] Deleted listing requires exact title confirmation to prevent accidental loss.
- [x] Paused listings appear greyscaled with UNAVAILABLE badge on Explore.

---

## 6. Design System Compliance

All components strictly follow `DESIGN.md` Elevated Brutalism tokens:
- Colors: `#F1EDEA` (Raw Cream), `#212121` (Deep Charcoal), `#C84B31` (Terracotta)
- Newly Added badge: amber `#F59E0B` family — intentionally distinct from the terracotta conversion palette to signal informational state, not action.
- Hard shadows: `shadow-[4px_4px_0px_#212121]` on cards, `shadow-[3px_3px_0px_#212121]` on form panels.
- No `rounded-full`, no `backdrop-blur`, no soft gradients.

---

*Document updated: 2026-07-11 — reflects full production implementation.*
