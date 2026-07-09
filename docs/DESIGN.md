- **Border & Shadow**: `1px solid rgba(255, 255, 255, 0.4)` (`#E2E8F0` fallback) with a heavy drop shadow (`0 20px 25px -5px rgba(15, 23, 42, 0.1)`).
- **Border Radius**: `9999px` (Fully rounded / Pill shape).
- **4-Column Interactive Layout** (Separated by subtle vertical dividers `#CBD5E1`):
1. **Destination (****`LocationInput`****)**: Autocomplete field with glowing map-pin icon (`#0EA5E9`). Shows popular city suggestions instantly on focus.
2. **Dates (****`DateRangePicker`****)**: Check-In and Check-Out calendar trigger displaying formatted ISO date intervals (`"Apr 12 — Apr 16"`).
3. **Guests & Allocation (****`GuestSelector`****)**: Counter dropdown (`"2 Adults • 1 Child • 1 Room"`).
4. **Action Trigger (****`CTAButton`****)**: High-impact gradient button (`#0EA5E9` to `#0284C7`), text `#FFFFFF`, weight 600, `padding: 14px 32px`, `border-radius: 9999px`.
- **Interactive Feedback**: On focus, the active input column elevates slightly (`bg-white dark:bg-slate-800 shadow-md`) and highlights with a `2px solid #0EA5E9` border.
### High-Attention Hotel Listing Card (`HotelCardGrid`)
- **Container**: `bg-white dark:bg-slate-800`, `border-radius: 16px` (`rounded-2xl`), `border: 1px solid #F1F5F9` (Light) / `1px solid #334155` (Dark).
- **Image Carousel Header**: Top `240px` container featuring high-definition Cloudinary image with `object-cover`.
- **Top-Left AI Tag**: SmartStay Recommender Badge (`bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider`).
- **Top-Right Favorite**: Circular floating heart toggle (`bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-transform`).
- **Content Area Padding**: `20px`.
- **Title & Rating Row**: Property Name (Outfit, 18px, weight 600) + Star Rating badge (`#F59E0B` star icon + `4.89 (124)`).
- **Location Subtitle**: Map pin + neighborhood / city name (Inter, 13px, `#64748B`).
- **Transparent Concession Price Ledger**:
- **Base Rate (Strikethrough)**: `₹4,500/night` (`#94A3B8`, 13px, strikethrough).
- **Concession Rate (Highlighted)**: `₹3,899` / night (Outfit, 22px, weight 700, `#0F172A` / `#FFFFFF`).
- **Taxes/Fees Caption**: `"+ ₹468 taxes & fees"` (`#64748B`, 11px).
- **Conversion Micro-Animation**: On card hover, smooth elevation shift via `transform: translateY(-6px)` and `box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.12)`, while the image scales slightly (`scale-105` over `300ms ease-out`).
### Sticky Room Selection & Concession Breakdown (`AvailabilityWidget` & `CostBreakdown`)
- **Placement**: Sticky right-hand sidebar (`top: 100px`) on `/hotel/:id` and `/booking/:hotelId` routes.
- **Container**: `bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xl`.
- **Header**: Dynamic pricing summary + Concession transparency info icon.
- **Real-Time Concurrency Locking Indicator**:
- During date verification against MongoDB `bookedSlots` / MySQL tables, display a glowing pulse badge (`bg-sky-500 text-white animate-pulse`) with text `"Checking live inventory..."`.
- Once reserved via **Optimistic/Pessimistic Concurrency Control (OCC/PCC)**, switch to **Emerald Status**: `bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-lg p-3 text-xs font-semibold flex items-center gap-2` (`"🔒 Room Locked for you for 10:00 mins"`).
- **Itemized Concession Ledger Table**:
- Room Base Price (`3 nights × ₹4,000`): `₹12,000`
- StayWise Platform Concession Cut (`8%`): `₹960`
- GST / Hospitality Tax (`18%`): `₹2,332`
- **Total Payable Amount**: **`₹15,292`** (Outfit, 26px, weight 700, `#0EA5E9`).
- **Primary Conversion CTA**: Full-width gradient button (`"Proceed to Payment →"`), height `52px`, `border-radius: 12px`, with click-debounce protection to prevent double-booking submissions.
### Executive Vendor & Admin Dashboard Cards (`/admin/dashboard` & `/admin/rooms`)
- **Metric Summary Card (****`MetricCard`****)**:
- **Surface**: `bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm`.
- **Layout**: Flex row between Metric Title (`#64748B`, 14px) and Trend Icon (`+14.2% this month` in `#10B981`).
- **Value**: Large bold KPI (Outfit, 32px, weight 700 e.g., `₹4,82,500 Total Revenue`).
- **Stateless Image Uploader (****`ImageUploader`****)**:
- **Dashed Drop Zone**: `2px dashed #0EA5E9`, `border-radius: 16px`, `padding: 40px`, centered cloud upload icon (`bg-sky-500/10 text-sky-500 p-4 rounded-full inline-block mb-3`).
- **Feedback State**: Displays immediate memory-buffer preview (`URL.createObjectURL(file)`) along with a live progress bar representing the `streamifier` buffer pipe to Cloudinary CDN (`"Transforming & Uploading to CDN... 84%"`).
---
## 5. Spacing, Depth & Responsive Grid Layouts
### Spacing Scale (4px Base Unit)
- **Micro Spacing (****`4px, 8px, 12px`****)**: Inside status badges, form input padding, icon-to-label separation, and table cell padding.
- **Component Spacing (****`16px, 20px, 24px`****)**: Internal card padding, form group vertical gaps, sidebar links, and modal padding.
- **Section Gaps (****`32px, 48px, 64px`****)**: Spacing between major page sections (`FeaturedRooms` vs. `RecommenderCarousel`).
- **Page Header Gaps (****`80px, 100px`****)**: Top-level hero margins and footer separations on desktop screens.
### Elevation Hierarchy & Shadows
<table>
<tr>
<td>Elevation Level</td>
<td>Shadow Specification</td>
<td>Primary Application</td>
</tr>
<tr>
<td>:---</td>
<td>:---</td>
<td>:---</td>
</tr>
<tr>
<td>**Ground (0)**</td>
<td>No shadow, crisp `1px border`</td>
<td>Background body, standard tabular data, base layout</td>
</tr>
<tr>
<td>**Raised (+1)**</td>
<td>`0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)`</td>
<td>Inactive hotel listing cards, secondary buttons, form inputs</td>
</tr>
<tr>
<td>**Hover / Active (+2)**</td>
<td>`0 20px 25px -5px rgba(14,165,233,0.12), 0 10px 10px -5px rgba(0,0,0,0.04)`</td>
<td>Hotel listing cards on hover, active dropdown selectors</td>
</tr>
<tr>
<td>**Floating Glass (+3)**</td>
<td>`0 25px 50px -12px rgba(0,0,0,0.25)`  • `backdrop-blur-md`</td>
<td>Sticky `SearchBar`, `/booking/confirmation` receipt overlays</td>
</tr>
<tr>
<td>**Suspended Modal (+4)**</td>
<td>`0 35px 60px -15px rgba(15,23,42,0.4)`  • Dark backdrop</td>
<td>Stripe 3D-Secure payment iframe, Admin Room CRUD modals</td>
</tr>
</table>
### Mobile-First Responsive Folding Strategy
- **Mobile Devices (****`< 768px`****)**:
- The hero `SearchBar` collapses into a compact single-line trigger (`"🔍 Where to? • Any Date • Add Guests"`) that opens a full-screen slide-up bottom sheet for date/room selection.
- Hotel listing grids stack to `grid-cols-1` with `gap: 20px`.
- Asymmetric detail page layouts (`70% / 30%`) collapse into a single vertical stream. The `AvailabilityWidget` docks as a persistent, floating action bar at the bottom of the viewport (`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shadow-2xl flex items-center justify-between`), allowing users to tap `"Reserve Room"` instantly without scrolling back up.
- Touch targets strictly enforced to a minimum of `48px × 48px`.
- **Tablet Devices (****`768px – 1024px`****)**:
- Search grid adapts to `grid-cols-2`.
- Filter sidebar (`FilterSidebar`) shifts into an off-canvas drawer toggleable via a `"⚙️ Filters (4)"` action button.
- **Desktop (****`> 1024px`****)**:
- Full multi-column search bar active.
- Hotel Detail `Gallery` displays an immersive 5-image bento grid (`1 large main photo on left, 2×2 grid of room/amenity photos on right`).
---
## 6. Do's and Don'ts for Conversion & Aesthetics
### Do
- **Do** use `Outfit` font for all numeric pricing and headings to ensure a crisp, modern, and high-trust feel.
- **Do** clearly display both the strikethrough base vendor rate and the StayWise Concession rate so customers see clear pricing transparency and value.
- **Do** implement smooth hover animations (`scale-105` on images, `-translate-y-1.5` on cards) to create a dynamic marketplace feel that invites interaction.
- **Do** display real-time inventory locking badges (`"🔒 Room Locked for 10:00 mins"`) when Optimistic/Pessimistic Concurrency checks (`__v` / Redis locks) are active.
- **Do** keep all image upload pipelines stateless (`Multer` memory storage + `streamifier` pipe to Cloudinary CDN) and show live progress bars.
### Don't
- **Don't** use generic plain red, blue, or green colors. Always utilize our curated HSL/HEX palette (`#0EA5E9` Ocean Blue, `#F59E0B` Amber Gold, `#10B981` Emerald).
- **Don't** use sharp `0px` corners on primary buttons or hotel cards. Modern luxury hospitality demands approachable, smooth radii (`12px` to `20px`).
- **Don't** hide taxes or platform concession markup fees until the final Stripe/Razorpay payment page. Always itemize clearly inside `CostBreakdown` to prevent cart abandonment.
- **Don't** write uploaded property photos to local disk (`/uploads`) in any UI demo or backend code. Keep all media pipelines stateless for cloud scaling.
- **Don't** let long hotel descriptions overflow without clean truncation (`line-clamp-2` or `line-clamp-3`) on search listing cards.
---
## 7. Ready-to-Use Tailwind CSS Component Tokens
When implementing React components (`client/src/components/...`), use the following exact Tailwind CSS token combinations:
### Primary Conversion CTA Button
```html
<button class="bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-semibold py-3.5 px-7 rounded-xl shadow-lg shadow-sky-500/25 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2">
  <span>Explore Luxury Stays</span>
  <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
</button>
```
### Hotel Listing Card Container
```html
<div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer">
  <!-- Card Header & Image Carousel goes here -->
</div>
```
### SmartStay AI Recommender Badge
```html
<span class="inline-flex items-center gap-1.5 bg-sky-500/15 dark:bg-sky-400/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
  <span>✨</span>
  <span>94% AI Match</span>
</span>
```
### Glassmorphic Floating Search Pill
```html
<div class="bg-white/88 dark:bg-slate-900/88 backdrop-blur-md border border-white/50 dark:border-slate-700/60 rounded-full p-2.5 shadow-2xl shadow-slate-900/15 flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
  <!-- Location, Date Range, Guest Selector & Search Trigger -->
</div>
```
### Itemized Concession Price Ledger Row
```html
<div class="flex items-center justify-between py-2.5 text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700/60 last:border-0 font-medium">
  <span>StayWise Platform Concession Cut (8%)</span>
  <span class="font-mono text-slate-900 dark:text-white font-semibold">₹960</span>
</div>
```
# StayWise.ai Design System — Elevated Brutalism ("Architectural Premium")
## 1. Visual Theme & Atmosphere
[StayWise.ai](http://StayWise.ai) adopts an **Elevated Brutalism ("Architectural Premium")** aesthetic. This design language steps boldly away from sheer glassmorphism, soft gradients, and delicate floating pills, choosing instead to celebrate **physical materials, structural honesty, and high-impact compartmentalization** while injecting the opulence and refinement expected in modern luxury hospitality.
As a **Vendor-to-Consumer (B2B2C) Concession Model Booking Platform**, this structural approach grounds the site’s integrity. Every interactive touchpoint—from multi-destination search bars to itemized concession billing ledgers—is housed within clearly defined geometric compartments bounded by **bold charcoal strokes (****`#212121`****) and hard, unblurred drop shadows**. The visual interplay between raw unbleached bone backgrounds, weathered concrete tones, warm brass hardware accents, and energetic **Terracotta Red conversion triggers** guides users through the reservation funnel with architectural authority, high contrast, and zero ambiguity.
**Key Characteristics:**
- **Architectural Materiality:** Mimics tactile structure—raw unbleached bone surfaces, concrete slate contrasts, and polished brass micro-elements.
- **Compartmentalized UI:** Every functional unit (search inputs, date pickers, room selectors, amenity tags, and price rows) is encapsulated within its own clearly delineated box with bold black/charcoal strokes.
- **High-Contrast Structural Shadows:** Hard, sharp-edged shadows (`4px 4px 0px #212121` or `6px 6px 0px #212121`) replace soft blurs to convey solidity, permanence, and high-tech stability.
- **Intentional Conversion Focus:** Vibrant **Terracotta Red / Burnt Orange** is reserved **exclusively** for primary `"Book Now"` and checkout conversion buttons, leading the viewer's eye directly to critical action points.
---
## 2. The "Architectural Premium" Color Palette
Our color system is anchored by exact material hex codes designed to reduce eye strain, establish structural boundaries, and drive high-conversion hospitality transactions.
### Architectural Foundation
- **Raw Cream / Bone (****`#F1EDEA`****)**: **Primary Application Background.** Replaces stark clinical white with a warm, "unbleached" architectural stone/bone tone. Reduces eye strain during extended discovery sessions while maintaining a spacious, gallery-like cleanliness.
- **Deep Charcoal (****`#212121`****)**: **Structural Grid & Type.** Used for heavy borders (`2px solid #212121` or `3px solid #212121`), hard structural outlines around buttons and cards, grid dividers, and bold, simplified headings. Grounds the platform's visual weight.
- **Concrete Grey / Industrial Slate (****`#494440`****)**: **Secondary Contrast.** Provides a softer contrast for secondary body text, sub-labels, weathered card dividers, and secondary container backgrounds (`#E6E1DC`). Mimics exposed architectural concrete.
### Signature Accents & Luxury Hardware
- **Signature Terracotta Red (****`#C84B31`**** / ****`#D9534F`****)**: **Exclusive Conversion Trigger.** A bold, energetic, earth-baked hue that creates a striking interplay against cool concrete and bone tones. **Rule of Restraint:** Used **exclusively** for `"Book Now"`, `"Search Stays"`, and `"Pay Securely"` conversion buttons to direct user attention immediately to conversion points.
- **Luxury Warm Brass / Copper (****`#C5A059`**** / ****`#B8860B`****)**: **Sophisticated Hardware Accent.** Adds a touch of opulence and executive refinement. Used for small interactive elements, star ratings (`★ 4.9`), real-time inventory locking badges (`"🔒 Room Locked"`), VIP guest callouts, and active navigation indicators.
- **Structural White (****`#FFFFFF`****)**: Used for the internal surface of compartmentalized input boxes, hotel listing cards, and billing tables to ensure crisp readability against the `Raw Cream (#F1EDEA)` body.
---
## 3. Bold Typography & Hierarchy
To convey architectural strength and stability, StayWise.ai utilizes large, simplified, geometric sans-serif fonts combined with technical monospaced ledgers.
### Font Selection
- **Primary Display & Headings**: **Montserrat** or **Lexend Mega** (fallback: `Plus Jakarta Sans, system-ui, sans-serif`). Ultra-clean, bold, geometric sans-serifs that command attention on hero banners, property titles, and nightly pricing displays (`₹3,899/night`).
- **Body & Structural UI**: **Montserrat** or **Inter** (fallback: `Roboto, sans-serif`). Used for clear, compartmentalized amenity tags (`[WIFI] [INFINITY POOL] [SPA]`), guest policies, and customer reviews.
- **Technical Ledger Code**: **JetBrains Mono** (fallback: `'Fira Code', monospace`). Used specifically for exact Booking Confirmation IDs (`SW-8892-XT`), itemized concession breakdowns, Stripe/Razorpay transaction hashes, and OTP inputs.
### Typography Hierarchy & Scale
<table>
<tr>
<td>Role</td>
<td>Font Family</td>
<td>Size (Desktop / Mobile)</td>
<td>Weight</td>
<td>Line Height</td>
<td>Letter Spacing</td>
<td>Core Application</td>
</tr>
<tr>
<td>:---</td>
<td>:---</td>
<td>:---</td>
<td>:---</td>
<td>:---</td>
<td>:---</td>
<td>:---</td>
</tr>
<tr>
<td>**Hero Title / H1**</td>
<td>Lexend Mega / Montserrat</td>
<td>`56px` / `38px`</td>
<td>`800`</td>
<td>`1.1`</td>
<td>`-0.03em`</td>
<td>Main landing page structural headline (`"ARCHITECTURAL STAYS."`)</td>
</tr>
<tr>
<td>**Section Heading / H2**</td>
<td>Lexend Mega / Montserrat</td>
<td>`36px` / `28px`</td>
<td>`700`</td>
<td>`1.2`</td>
<td>`-0.02em`</td>
<td>`"FEATURED CONCESSION PROPERTIES"`, `"SMARTSTAY AI INDEX"`</td>
</tr>
<tr>
<td>**Card Title / H3**</td>
<td>Montserrat</td>
<td>`22px` / `20px`</td>
<td>`700`</td>
<td>`1.3`</td>
<td>`0px`</td>
<td>Hotel name on brutalist cards, room tier headings</td>
</tr>
<tr>
<td>**Subheading / H4**</td>
<td>Montserrat</td>
<td>`16px` / `15px`</td>
<td>`600`</td>
<td>`1.4`</td>
<td>`0.02em`</td>
<td>Compartment header labels (`[DESTINATION]`, `[DATES]`)</td>
</tr>
<tr>
<td>**Lead Body / Intro**</td>
<td>Montserrat / Inter</td>
<td>`16px` / `15px`</td>
<td>`500`</td>
<td>`1.6`</td>
<td>`0px`</td>
<td>Property overview copy, cancellation policy notes</td>
</tr>
<tr>
<td>**Standard Body**</td>
<td>Montserrat / Inter</td>
<td>`14px`</td>
<td>`400 / 500`</td>
<td>`1.5`</td>
<td>`0px`</td>
<td>Amenity checklists, navigation links, review commentary</td>
</tr>
<tr>
<td>**Brutalist Tag / Badge**</td>
<td>JetBrains Mono</td>
<td>`12px`</td>
<td>`700`</td>
<td>`1.3`</td>
<td>`0.05em`</td>
<td>AI Match scores (`[✨ 94% MATCH]`), status boxes (Uppercase)</td>
</tr>
<tr>
<td>**Numeric Ledger**</td>
<td>JetBrains Mono</td>
<td>`15px` / `14px`</td>
<td>`600`</td>
<td>`1.4`</td>
<td>`0px`</td>
<td>Booking IDs, itemized concession pricing, tax calculation totals</td>
</tr>
</table>
---
## 4. Compartmentalized UI Component Specifications
### 1. The Compartmentalized Search Bar (`SearchBar`)
- **Container Structure**: A solid, architectural grid bar replacing floating rounded pills.
- **Surface & Border**: `bg-white border-3 border-[#212121] shadow-[6px_6px_0px_#212121] rounded-lg` (or `rounded-none` for pure brutalist framing).
- **Internal Compartment Grid**: 4 distinct, boxed sections separated by heavy `2px solid #212121` vertical strokes (`divide-x-2 divide-[#212121]`):
1. **Destination Compartment (****`LocationInput`****)**: Top label `[DESTINATION]` in `JetBrains Mono 11px uppercase #494440`. Autocomplete input with hard-edged map pin.
2. **Dates Compartment (****`DateRangePicker`****)**: Top label `[CHECK-IN / CHECK-OUT]`. Interactive calendar trigger displaying boxed ISO date intervals (`"2026-04-12 → 2026-04-16"`).
3. **Allocation Compartment (****`GuestSelector`****)**: Top label `[GUESTS & ROOMS]`. Dropdown selector box (`"2 ADULTS • 1 ROOM"`).
4. **Conversion Compartment (****`CTAButton`****)**: Housed in the rightmost block.
- **Button Style**: Exclusively **Signature Terracotta (****`#C84B31`****)** with `2px solid #212121` border, `color: #FFFFFF`, `font-family: Lexend Mega / Montserrat`, weight 700, uppercase text (`"EXPLORE STAYS →"`).
- **Hardware Micro-Interaction**: On hover, button shifts physically (`-translate-x-1 -translate-y-1 shadow-[4px_4px_0px_#212121]`). On active click/press, it snaps down flat (`translate-x-0 translate-y-0 shadow-none`).
### 2. High-Contrast Brutalist Hotel Listing Card (`HotelCardGrid`)
- **Card Container**: `bg-white border-2 border-[#212121] shadow-[6px_6px_0px_#212121] rounded-lg overflow-hidden flex flex-col justify-between`.
- **Image Section**: High-contrast `240px` photo container with a heavy `2px solid #212121` bottom structural stroke separating media from text.
- **Top-Left Boxed AI Tag**: SmartStay Recommender Badge (`bg-[#F1EDEA] text-[#212121] border-2 border-[#212121] shadow-[2px_2px_0px_#212121] px-2.5 py-1 text-xs font-mono font-bold uppercase`).
- **Top-Right Hardware Favorite**: Square or sharp-cornered button (`bg-white border-2 border-[#212121] p-2 shadow-[2px_2px_0px_#212121] hover:bg-[#F1EDEA]`).
- **Content Compartment (****`p-5`****)**:
- **Title & Rating Row**: Property Name (Montserrat, 20px, weight 700, `#212121`) + Boxed Star Rating (`bg-[#212121] text-[#C5A059] px-2 py-0.5 rounded-sm font-mono text-xs font-bold` e.g., `★ 4.89`).
- **Location Subtitle**: `[LOCATION: INDIRANAGAR, BANGALORE]` (`#494440`, 12px font-mono).
- **Concession Price Box (Top-border ****`2px solid #212121 pt-3 mt-3`****)**:
- **Base Rate (Strikethrough)**: `BASE: ₹4,500/NIGHT` (`#494440`, 12px, font-mono, strikethrough).
- **StayWise Concession Rate**: `₹3,899` / night (Lexend Mega / Montserrat, 24px, weight 800, `#212121`).
- **Taxes/Fees Caption**: `"+ ₹468 GST & PLATFORM FEES"` (`#494440`, 11px font-mono).
- **Card Hover Elevation**: On card hover, structural lift `-translate-x-1.5 -translate-y-1.5 shadow-[10px_10px_0px_#212121]` (`200ms ease-out`).
### 3. Sticky Room Selection & Itemized Concession Ledger (`AvailabilityWidget` & `CostBreakdown`)
- **Container Structure**: Sticky right-hand sidebar (`top: 100px`) housed in a heavy architectural box: `bg-white border-3 border-[#212121] shadow-[8px_8px_0px_#212121] rounded-lg p-6`.
- **Compartmentalized Header**: `[LIVE AVAILABILITY & CONCESSION LEDGER]` (`JetBrains Mono 13px font-bold uppercase #212121 border-b-2 border-[#212121] pb-3 mb-4`).
- **Real-Time Concurrency & Hardware Verification Badge**:
- **Checking State**: Boxed pulse indicator `bg-[#E6E1DC] text-[#212121] border-2 border-[#212121] p-2.5 font-mono text-xs font-bold` (`"⏳ VERIFYING OCC/PCC INVENTORY..."`).
- **Locked/Confirmed State (Warm Brass Hardware)**: `bg-[#C5A059]/20 text-[#212121] border-2 border-[#212121] shadow-[3px_3px_0px_#212121] p-3 text-xs font-mono font-bold flex items-center justify-between` (`"🔒 ROOM LOCKED: 10:00 MINS"`).
- **Itemized Concession Ledger Table (Compartmentalized Rows)**:
- Each row separated by solid charcoal grid lines (`border-b-2 border-[#212121] py-2.5 flex justify-between font-mono text-sm`):
- `[BASE ROOM RATE: 3 NIGHTS]` → `₹12,000`
- `[STAYWISE CONCESSION CUT (8%)]` → `₹960`
- `[HOSPITALITY GST (18%)]` → `₹2,332`
- **Total Payable Box (****`bg-[#F1EDEA] border-2 border-[#212121] p-3 mt-3 flex justify-between items-center font-bold`****)**:
- Label: `TOTAL PAYABLE:`
- Figure: `₹15,292` (`Lexend Mega / Montserrat 24px #212121`).
- **Signature Terracotta Conversion Trigger (****`CTAButton`****)**:
- Full-width brutalist button: `bg-[#C84B31] hover:bg-[#B63D25] text-white font-mono font-bold text-base py-4 px-6 border-3 border-[#212121] shadow-[5px_5px_0px_#212121] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#212121] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase block text-center w-full mt-5`.
### 4. Executive Admin & Vendor Dashboard Cards (`/admin/dashboard` & `/admin/rooms`)
- **Brutalist Metric Card (****`MetricCard`****)**:
- **Surface**: `bg-white border-2 border-[#212121] shadow-[5px_5px_0px_#212121] p-5 rounded-md flex flex-col justify-between`.
- **Top Bar**: Header `[REVENUE INDEX]` (`font-mono text-xs #494440`) + Trend Badge `[+14.2% ↑]` (`bg-[#C5A059] text-[#212121] border border-[#212121] px-1.5 font-mono text-xs font-bold`).
- **Figure**: `₹4,82,500` (`Lexend Mega / Montserrat 30px font-extrabold #212121 mt-2`).
- **Stateless Image Uploader (****`ImageUploader`****)**:
- **Architectural Drop Compartment**: `bg-[#F1EDEA] border-3 border-dashed border-[#212121] rounded-lg p-8 text-center`.
- **Feedback & Pipe State**: Boxed status showing immediate `Multer` memory buffer preview (`URL.createObjectURL(file)`) and a brutalist progress bar (`border-2 border-[#212121] bg-white h-6 mt-3 overflow-hidden`) with a fill bar in **Signature Terracotta (****`#C84B31`****)** (`[STREAMING TO CLOUDINARY CDN: 84%]`).
---
## 5. Spacing, Depth & Architectural Elevation
### Spacing & Grid System (4px Mathematical Base)
- **Micro Compartments (****`4px, 8px, 12px`****)**: Inside brutalist tags, table cell padding, and internal box labels.
- **Component Grid (****`16px, 20px, 24px`****)**: Card internal padding, form input heights (`52px` standard), and grid gaps (`24px`).
- **Section Structural Separators (****`40px, 64px, 80px`****)**: Spacing between major page blocks, often separated by full-width `2px solid #212121` horizontal divider lines.
### Elevated Brutalism Shadow Hierarchy
<table>
<tr>
<td>Elevation Level</td>
<td>Hard Shadow Specification (`#212121`)</td>
<td>Primary Application</td>
</tr>
<tr>
<td>:---</td>
<td>:---</td>
<td>:---</td>
</tr>
<tr>
<td>**Ground Box (0)**</td>
<td>`border-2 border-[#212121] shadow-none`</td>
<td>Static internal table cells, secondary input boxes</td>
</tr>
<tr>
<td>**Standard Compartment (+1)**</td>
<td>`border-2 border-[#212121] shadow-[4px_4px_0px_#212121]`</td>
<td>Hotel listing cards, secondary form buttons, tags</td>
</tr>
<tr>
<td>**Hover / Featured Box (+2)**</td>
<td>`border-3 border-[#212121] shadow-[8px_8px_0px_#212121]`</td>
<td>Hotel listing cards on hover, active dropdown panels</td>
</tr>
<tr>
<td>**Structural Header (+3)**</td>
<td>`border-3 border-[#212121] shadow-[10px_10px_0px_#212121]`</td>
<td>Sticky `SearchBar`, `/booking/confirmation` receipt box</td>
</tr>
<tr>
<td>**Suspended Modal (+4)**</td>
<td>`border-4 border-[#212121] shadow-[14px_14px_0px_#212121]`</td>
<td>Stripe 3D-Secure iframe, Admin Room CRUD drawer</td>
</tr>
</table>
### Mobile-First Compartmentalized Folding
- **Mobile (****`< 768px`****)**:
- The 4-column `SearchBar` folds into a high-contrast stacked brutalist box (`border-3 border-[#212121] shadow-[6px_6px_0px_#212121] p-4 bg-white`) or a compact single-button trigger (`[🔍 SEARCH / DATES / GUESTS]`) that opens an architectural full-screen drawer.
- Hotel listing grids stack cleanly to `grid-cols-1` with `gap: 24px`.
- Asymmetric 2-column detail layouts (`70% / 30%`) collapse vertically. The `AvailabilityWidget` docks as a heavy structural action bar at the bottom (`fixed bottom-0 left-0 right-0 z-50 bg-white border-t-3 border-[#212121] p-4 shadow-[0px_-4px_0px_#212121] flex items-center justify-between`), keeping the **Signature Terracotta ****`"BOOK NOW"`** button reachable by thumb at all times.
- Touch targets strictly enforced to `48px × 48px` minimum with hard `2px solid #212121` outlines.
---
## 6. Do's and Don'ts for Elevated Brutalism
### Do
- **Do** use `Raw Cream / Bone (#F1EDEA)` as the primary application background to give the platform a warm, refined architectural presence while reducing eye strain.
- **Do** enclose every functional UI element inside clear, compartmentalized boxes bordered with `2px solid #212121` or `3px solid #212121`.
- **Do** reserve **Signature Terracotta Red (****`#C84B31`****) EXCLUSIVELY** for primary conversion actions (`"Book Now"`, `"Explore Stays"`, `"Pay Securely"`).
- **Do** use **Warm Brass / Copper (****`#C5A059`****)** for star ratings (`★ 4.9`), real-time locking indicators (`"🔒 Room Locked"`), and opulence micro-accents.
- **Do** use hard, unblurred drop shadows (`4px 4px 0px #212121` or `6px 6px 0px #212121`) to maintain physical material consistency.
### Don't
- **Don't** use sheer glassmorphism (`backdrop-blur-md`), soft pastel blurs, or gradient shadows. They contradict the architectural integrity of Elevated Brutalism.
- **Don't** use pill-shaped `9999px` fully rounded borders on search bars or cards. Keep corners sharp (`rounded-none`) or slightly eased (`rounded-md` / `rounded-lg`).
- **Don't** use Terracotta Red on decorative backgrounds, standard links, or secondary buttons; diluting the signature accent ruins its conversion superpower.
- **Don't** hide taxes or platform concession cuts until the payment gateway. Always compartmentalize them clearly inside the `CostBreakdown` ledger box.
---
## 7. Ready-to-Use Tailwind CSS Component Tokens
When implementing React components (`client/src/components/...`), use the following exact Tailwind CSS token combinations for Elevated Brutalism:
### 1. Signature Terracotta Conversion Button ("Book Now")
```html
<button class="bg-[#C84B31] hover:bg-[#B63D25] text-white font-mono font-bold text-base py-3.5 px-7 border-3 border-[#212121] shadow-[5px_5px_0px_#212121] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#212121] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase flex items-center justify-center gap-3.5 cursor-pointer">
  <span>RESERVE THIS ROOM →</span>
</button>
```
### 2. Compartmentalized Brutalist Hotel Listing Card
```html
<div class="bg-white border-2 border-[#212121] shadow-[6px_6px_0px_#212121] rounded-lg overflow-hidden flex flex-col justify-between hover:-translate-x-1.5 hover:-translate-y-1.5 hover:shadow-[10px_10px_0px_#212121] transition-all duration-200 cursor-pointer">
  <!-- Image Box with 2px bottom border & Top-Left Boxed Badge -->
  <div class="relative h-60 border-b-2 border-[#212121] overflow-hidden">
    <img src="/sample-hotel.jpg" alt="Hotel" class="w-full h-full object-cover" />
    <div class="absolute top-3 left-3 bg-[#F1EDEA] text-[#212121] border-2 border-[#212121] shadow-[2px_2px_0px_#212121] px-2.5 py-1 text-xs font-mono font-bold uppercase">
      [✨ 94% AI MATCH]
    </div>
  </div>
  <!-- Compartmentalized Text Content -->
  <div class="p-5 flex flex-col gap-3">
    <div class="flex justify-between items-start">
      <h3 class="font-sans font-bold text-xl text-[#212121] leading-tight">THE PALMS RESORT & SPA</h3>
      <span class="bg-[#212121] text-[#C5A059] px-2 py-0.5 rounded-sm font-mono text-xs font-bold shrink-0 ml-2">★ 4.89</span>
    </div>
    <p class="font-mono text-xs text-[#494440]">[INDIRANAGAR, BANGALORE]</p>
    <div class="border-t-2 border-[#212121] pt-3 flex justify-between items-baseline mt-1">
      <div>
        <p class="font-mono text-xs text-[#494440] line-through">BASE: ₹4,500/NIGHT</p>
        <p class="font-sans font-extrabold text-2xl text-[#212121]">₹3,899 <span class="font-mono text-xs font-normal text-[#494440]">/NIGHT</span></p>
      </div>
      <span class="font-mono text-[11px] text-[#494440]">+ ₹468 TAXES</span>
    </div>
  </div>
</div>
```
### 3. Compartmentalized Search Bar (`SearchBar`)
```html
<div class="bg-white border-3 border-[#212121] shadow-[8px_8px_0px_#212121] rounded-lg p-2 flex flex-col md:flex-row items-stretch divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#212121] max-w-5xl mx-auto">
  <!-- Destination Compartment -->
  <div class="p-3 flex-1">
    <label class="block font-mono text-[11px] font-bold text-[#494440] uppercase">[DESTINATION]</label>
    <input type="text" placeholder="e.g., Goa, Mumbai, Bangalore..." class="w-full bg-transparent font-sans font-bold text-base text-[#212121] focus:outline-none mt-1" />
  </div>
  <!-- Date Range Compartment -->
  <div class="p-3 flex-1">
    <label class="block font-mono text-[11px] font-bold text-[#494440] uppercase">[CHECK-IN / CHECK-OUT]</label>
    <div class="font-mono font-bold text-sm text-[#212121] mt-1.5 flex items-center gap-2 cursor-pointer">
      <span>2026-04-12</span>
      <span>→</span>
      <span>2026-04-16</span>
    </div>
  </div>
  <!-- Allocation Compartment -->
  <div class="p-3 flex-1">
    <label class="block font-mono text-[11px] font-bold text-[#494440] uppercase">[GUESTS & ROOMS]</label>
    <div class="font-mono font-bold text-sm text-[#212121] mt-1.5 cursor-pointer">
      2 ADULTS • 1 ROOM
    </div>
  </div>
  <!-- Conversion Button Compartment -->
  <div class="p-2 flex items-center">
    <button class="w-full md:w-auto bg-[#C84B31] hover:bg-[#B63D25] text-white font-mono font-bold px-6 py-3.5 border-2 border-[#212121] shadow-[3px_3px_0px_#212121] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase">
      EXPLORE STAYS →
    </button>
  </div>
</div>
```
### 4. Warm Brass Hardware Inventory Lock Badge
```html
<div class="bg-[#C5A059]/20 text-[#212121] border-2 border-[#212121] shadow-[3px_3px_0px_#212121] p-3 rounded-md font-mono text-xs font-bold flex items-center justify-between">
  <span class="flex items-center gap-2">
    <span class="text-base">🔒</span>
    <span>ROOM LOCKED BY OCC/PCC INVENTORY</span>
  </span>
  <span class="bg-[#212121] text-[#C5A059] px-2 py-0.5">10:00 MINS</span>
</div>
```