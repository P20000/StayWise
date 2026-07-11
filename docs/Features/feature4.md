# Feature 4: Advanced Vendor Dashboard — Geolocation, Grid Constructor & Booking Management

> **Status:** ✅ Implemented & Live  
> **Parent Page:** `PRD.md` → Vendor Portal  
> **Design System:** `DESIGN.md` → Elevated Brutalism ("Architectural Premium")  
> **Last Updated:** 2026-07-11

---

## 1. Strategic Purpose

Feature 4 transforms the vendor dashboard from a simple listing manager into a full self-service architectural property studio. Vendors can:
- Pinpoint their property on a live Leaflet map with drag-and-drop marker precision.
- Configure room tiers via a 4×4 interactive grid constructor.
- Attach granular per-tier services with pricing models.
- Manage bookings, availability windows, listing status, and support — all from one tabbed portal.

---

## 2. Dashboard Architecture

The dashboard (`VendorDashboardPage.jsx`) operates as a **two-mode UI**:

| Mode | Trigger | Purpose |
|---|---|---|
| **Tab View** | Default on load | Bookings, Listings, Help tabs |
| **Creation/Edit Flow** | "Publish New Stay" or "Edit" click | Multi-step Geolocation → Grid constructor |

State transitions between modes use GSAP `fromTo` animations (`opacity: 0, y: 30` → `opacity: 1, y: 0`).

---

## 3. Tab System

The active tab is synced with the URL query param `?tab=` (bookings | listings | help) so deep links and browser navigation work correctly.

### 3.1 Bookings Tab
- Fetches vendor-specific bookings via `GET /api/bookings/vendor-bookings` (JWT-authenticated, vendor-scoped).
- Each booking card shows: order ID, guest name, guest email, check-in/check-out dates, total revenue, booking status badge.
- Empty state and skeleton loading states are powered by a count cached in `localStorage` (key: `booking_count_<userId>`) so the skeleton renders the correct number of placeholders across refreshes.

### 3.2 Listings Tab
- Fetches vendor rooms via `GET /api/rooms?vendor=<userId>`.
- Renders a 2-column card grid. Each card contains:
  - **MiniMap** — a fully interactive Leaflet map (disabled controls) showing the pinned property location.
  - Property title, location, description snippet.
  - Tier count + rating/newly-listed indicator.
  - Base price from lowest tier.
  - Action buttons: Pause/Activate, Manage Availability, Edit, Delete.
- Skeleton count cached in `localStorage` (`stay_count_<userId>`).

### 3.3 Help Tab
- Accordion FAQ with 5 categories: Getting Started, Managing Bookings, Pricing & Services, Geo-location Setup, Account & Billing.
- Each `<details>` element expands with a `ChevronDown` 180° rotation transition.
- Contact support form: pre-fills vendor name and email from Redux auth state, submits a support ticket (mocked success toast for 5s).
- Live chat widget: togglable bottom-right panel with scripted agent responses for common keywords (`map`, `location`, `price`, `tier`).

---

## 4. Multi-Step Creation / Edit Flow

### Step 1 — Geolocation & Property Info

**Map Component:** Leaflet.js map initialized in a `useRef` container. Features:
- `draggable: true` marker using a custom brutalist diamond icon (`brutalIcon`): `16×16px` terracotta square, rotated 45°, hard shadow.
- Click-to-place: clicking any map point moves the marker to those coordinates.
- Drag-to-fine-tune: `dragend` event updates `lat`/`lng` state with 6-decimal precision.
- **Geocoding Search**: vendor types a location → Nominatim `search` API resolves to coordinates → map pans and marker repositions.
- **"Save Location" button**: reverse-geocodes current `lat`/`lng` via Nominatim `reverse` API, populates the `address` field, and sets `isLocationSaved = true`.
- `isLocationSaved` is a gate: Step 2 is only accessible after location is confirmed.
- Map instance cleanup: `mapInstance.current.remove()` on unmount prevents Leaflet container reuse errors.

**Form Fields captured in Step 1:**
| Field | State Variable | Notes |
|---|---|---|
| Title | `title` | Required |
| Description | `desc` | Required |
| Resolved Address | `address` | Auto-filled from Nominatim reverse |
| Coordinates | `lat`, `lng` | 6 decimal places |
| Architectural Style | `archStyle` | Dropdown, default: Board-Formed Concrete |
| Acoustic Level | `acousticLevel` | Dropdown |
| Workspace Profile | `workspaceProfile` | Dropdown |
| Amenities | `amenitiesInput` | Comma-separated string, split to array on save |
| Images | `imagesFiles` | File[] from `<input type="file" multiple>` |

### Step 2 — Room Tier Grid Constructor

A **4×4 interactive grid** (16 cells). Each cell is:
- **Empty** — clickable to place a new tier.
- **Occupied** — shows tier name and price; double-click opens the Tier Editor modal.

**Tier data structure:**
```js
{
  id: "temp-<timestamp>",
  tierName: "Room Tier N",
  basePrice: 150,
  coverImage: "<url>",
  gridPosition: { row, col },
  numberOfRooms: 1,
  availabilityDates: { start: "", end: "" },
  services: [ /* 11 service objects */ ]
}
```

**11 configurable services per tier:**
Room Cleaning, Laundry, Meal Plans (Breakfast), Spa & Massage Sessions, Airport Pickup & Drop, Extra Bed / Crib Add-On, Mini-Bar Restock, Wi-Fi Tier Upgrades, Parking Slot Booking, Pool & Gym Access Passes, Conference / Banquet Room Reservation.

Each service has: `name`, `enabled` (bool toggle), `price` (number), `priceType` (`per-night` | `one-time`), `description`.

**HTML5 Drag & Drop:**
- `draggable` attribute on occupied cells.
- `dragstart` stores dragging tier index.
- `dragover` prevents default to allow drop.
- `drop` checks for swap (occupied target) or move (empty target) and updates `roomTiers` state.
- Visual lift effect via CSS `opacity: 0.5` on dragged card and `border-dashed` highlight on valid drop targets.

**Tier Editor Modal:**
- Opened on double-click of occupied cell.
- Editable: tier name, base nightly rate, cover image URL, number of rooms.
- Service toggles with per-service price and price-type dropdowns.
- Save updates `roomTiers` array in state.
- Remove button with `window.confirm` guard.

---

## 5. Availability Calendar

A custom `CalendarRangePicker` component (no external date library):
- Renders current month grid, navigable via Prev/Next month buttons.
- Click to set start date; second click sets end date (enforces start ≤ end).
- Range is highlighted with `bg-[#C84B31]/20`.
- Selected dates shown with full `bg-[#C84B31] text-[#F1EDEA]`.

The **Availability Modal** allows vendors to pick a specific room tier and set its availability window:
- Tier selector dropdown populated from `room.roomTiers`.
- On save: `PUT /api/rooms/:id` with updated `roomTiers` array containing new `availabilityDates`.

---

## 6. Submission & Validation

On "Save Setup" (Step 2):
1. Validates at least 1 tier exists.
2. Validates all tier base prices > 0.
3. Validates enabled services have price ≥ 0.
4. Validates coordinates are non-zero and address is resolved.
5. Builds `FormData` with all fields including `roomTiers` as JSON string.
6. `basePrice` on the listing = `Math.min(...roomTiers.map(t => t.basePrice))`.
7. `POST /api/rooms` (create) or `PUT /api/rooms/:id` (edit).
8. On success: dismisses editor, refreshes dashboard data, shows success toast.

---

## 7. Dashboard Metrics Bar

Three metric cards at the top of the dashboard:
| Metric | Source |
|---|---|
| Portfolio Properties | `rooms.length` |
| Overall Rating Feedback | Average of `room.rating` across all rooms (only meaningful when reviews exist) |
| Total Bookings Invoices | `bookings.length` |

---

## 8. MiniMap Component

A lightweight Leaflet map embedded inside each listing card in the Listings tab:
- `dragging`, `zoomControl`, `scrollWheelZoom`, `doubleClickZoom`, `boxZoom`, `touchZoom` all disabled.
- Renders at `h-36` (144px) within the card.
- `mapRef.current.invalidateSize()` called after 200ms delay to handle CSS layout resolution.
- Map instance destroyed on unmount to prevent Leaflet container conflicts.

---

## 9. Deletion Safety Pattern

Deleting a listing requires the vendor to type the **exact property title** in a `window.prompt`. A mismatch aborts deletion with an "Abort — Title mismatch" alert. This prevents accidental destruction of live listings.

---

## 10. File Map

| File | Role |
|---|---|
| `client/src/pages/VendorDashboardPage.jsx` | Entire vendor portal (tabs + creation flow) |
| `server/controllers/roomController.js` | Room CRUD + Cloudinary upload |
| `server/controllers/bookingController.js` | Vendor-scoped booking fetch |
| `server/models/Room.js` | Schema with roomTiers, 2dsphere index, rating=0 default |
| `server/routes/roomRoutes.js` | `/api/rooms` routes |
| `server/routes/bookingRoutes.js` | `/api/bookings/vendor-bookings` route |

---

## 11. Design System Compliance

- All map containers: `border-2 border-[#212121]`.
- Grid cells: `border-2 border-dashed border-[#212121]/30` (empty), `border-2 border-[#212121] shadow-[3px_3px_0px_#212121]` (occupied).
- Brutalist marker icon: terracotta `#C84B31`, 45° rotation, 2px `#212121` border.
- GSAP transitions: `duration: 0.4`, no easing override (default GSAP power1).
- Calendar: all interactive elements use `border-[#212121]` compartmentalization.
- No `rounded-full`, no `backdrop-blur`, no soft shadows anywhere in the dashboard.

---

## 12. Acceptance Criteria

- [x] Leaflet map supports click-to-place, drag-to-fine-tune, and geocoding search.
- [x] "Save Location" reverse-geocodes and gates Step 2 progression.
- [x] 4×4 grid allows cell click (add), double-click (edit), HTML5 drag-and-drop (reposition/swap).
- [x] 11 services per tier with toggle, price, price-type, and description.
- [x] Availability calendar sets date ranges per room tier.
- [x] Deletion requires exact title confirmation.
- [x] Pausing a listing sets `status: "paused"` and greys the card.
- [x] Dashboard metrics update after every CRUD action.
- [x] Tab state synced to `?tab=` URL param.

---

*Document updated: 2026-07-11 — reflects full production implementation.*
