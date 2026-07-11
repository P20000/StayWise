# Feature 5: Truthful Rating System — "Newly Added" Listing State

> **Status:** ✅ Implemented & Live  
> **Parent Page:** `PRD.md` → Trust & Transparency Layer  
> **Design System:** `DESIGN.md` → Elevated Brutalism ("Architectural Premium")  
> **Last Updated:** 2026-07-11

---

## 1. Problem Statement

Before this feature, every newly published listing auto-received a hardcoded `4.95` rating via the Mongoose schema default (`Room.js`, line 62). This caused three trust violations:

1. **Explore Page (`ExplorePage.jsx`):** New listings showed `★ 4.95 (0)` — a fabricated perfect score with zero reviews, misleading guests.
2. **Room Detail Page (`RoomDetailsPage.jsx`):** The property header displayed `★ 4.95 (0 verified stays)` — falsely implying guest history.
3. **Vendor Dashboard (`VendorDashboardPage.jsx`):** The vendor's own listing card showed `[ Feedback: 4.95 ★ ]` on a freshly created listing — a nonsensical metric for the property owner.

---

## 2. Root Cause

```js
// server/models/Room.js — BEFORE (incorrect)
rating: {
  type: Number,
  default: 4.95,  // ← synthetic rating injected at creation
  min: 1.0,
  max: 5.0,
}
```

The schema assigned a fake rating before any guest had ever stayed. Combined with `reviewsCount: { default: 0 }`, this created an impossible state: a "perfect" score with no reviews.

---

## 3. Fix Architecture

### 3.1 Backend — `server/models/Room.js`

```js
// AFTER (correct)
rating: {
  type: Number,
  default: 0,      // truthful: no rating until reviews exist
  min: 0,
  max: 5.0,
}
```

`min` changed from `1.0` → `0` to allow the truthful zero state. The review aggregation in `reviewController.js` already correctly computes real averages from submitted reviews — this fix simply removes the false starting point.

### 3.2 Detection Logic (Frontend)

A newly added listing is identified by a single condition:

```js
const isNewlyAdded = !room.reviewsCount || room.reviewsCount === 0;
```

This is evaluated inline at the render site in all three affected pages. No new utility function or prop was introduced — the check is intentionally co-located with the display logic for clarity.

---

## 4. UI Implementation Per Surface

### 4.1 Explore Page (`ExplorePage.jsx`) — Image Card Badge

**Before:** `★ 4.95 (0)` white pill badge (bottom-right of listing image)

**After:**
```jsx
{(!suite.reviewsCount || suite.reviewsCount === 0) ? (
  <div className="absolute bottom-3 right-3 flex items-center gap-1 font-mono text-[10px] font-bold
    bg-amber-50 border border-amber-400 text-amber-700 px-2 py-0.5
    shadow-[2px_2px_0px_rgba(0,0,0,0.15)] animate-pulse">
    <span>✦</span>
    <span>NEWLY ADDED</span>
  </div>
) : (
  <div className="... bg-white border border-[#212121] ...">
    <Star size={12} className="text-[#C84B31] fill-[#C84B31]" />
    <span>{suite.rating}</span>
    <span className="text-[#212121]/50">({suite.reviewsCount})</span>
  </div>
)}
```

Design decision: amber palette (`amber-50` / `amber-400` / `amber-700`) is intentionally distinct from the terracotta CTAs (`#C84B31`) to signal "informational / new" vs. "conversion action". The `animate-pulse` draws attention without being distracting.

### 4.2 Room Detail Page (`RoomDetailsPage.jsx`) — Property Header

**Before:** `★ 4.95 (0 verified stays)` inline with location

**After:**
```jsx
{(!room.reviewsCount || room.reviewsCount === 0) ? (
  <span className="flex items-center gap-1.5 text-amber-600 font-bold text-xs font-mono
    border border-amber-400 bg-amber-50 px-2 py-0.5">
    <span className="animate-pulse">✦</span>
    <span>NEWLY LISTED — NO REVIEWS YET</span>
  </span>
) : (
  <span className="flex items-center gap-1">
    <Star size={16} className="text-[#C84B31] fill-[#C84B31]" />
    {room.rating.toFixed(2)} ({room.reviewsCount} verified stays)
  </span>
)}
```

### 4.3 Room Detail Page — Reviews Empty State

**Before:** Plain grey text: "No reviews yet. Be the first to leave one!"

**After:** A dashed amber callout card:
```jsx
<div className="border-2 border-dashed border-amber-300 bg-amber-50/50 p-6
  flex flex-col items-center text-center gap-2">
  <span className="text-2xl animate-pulse">✦</span>
  <p className="font-mono text-xs font-bold text-amber-700 uppercase tracking-wider">
    Be the first to review this stay
  </p>
  <p className="font-sans text-[11px] text-[#212121]/50 max-w-xs">
    This listing has no guest reviews yet. Share your experience
    and help future travelers discover it.
  </p>
</div>
```

This replaces the dismissive bare text with an active invitation — increasing the likelihood of first-review submission from guests.

### 4.4 Vendor Dashboard (`VendorDashboardPage.jsx`) — Listing Card Meta Row

**Before:** `[ Feedback: 4.95 ★ ]` text in the card's info row regardless of review count

**After:**
```jsx
{(!room.reviewsCount || room.reviewsCount === 0) ? (
  <span className="flex items-center gap-1 text-[#C84B31] border border-[#C84B31]
    bg-[#C84B31]/5 px-1.5 py-0.5 text-[9px] animate-pulse">
    ✦ NEWLY LISTED
  </span>
) : (
  <span>[ Feedback: {room.rating} ★ ]</span>
)}
```

Terracotta is used here (not amber) because the vendor context is internal — the pulse badge serves as a reminder to the vendor that this listing has no reviews yet and may need promotion. It does not mislead guests.

---

## 5. Behavior Matrix

| Surface | `reviewsCount === 0` | `reviewsCount > 0` |
|---|---|---|
| **Explore card** | Amber `✦ NEWLY ADDED` pulse badge | `★ X.X (N)` white star badge |
| **Detail page header** | Amber `✦ NEWLY LISTED — NO REVIEWS YET` label | `★ X.XX (N verified stays)` |
| **Detail page reviews section** | Amber dashed callout "Be the first to review" | Real review cards list |
| **Vendor dashboard card** | Terracotta `✦ NEWLY LISTED` pulse label | `[ Feedback: X.X ★ ]` |

---

## 6. Files Changed

| File | Change |
|---|---|
| `server/models/Room.js` | `rating.default` 4.95 → 0; `rating.min` 1.0 → 0 |
| `client/src/pages/ExplorePage.jsx` | Conditional rating/newly-added badge on image card |
| `client/src/pages/RoomDetailsPage.jsx` | Conditional header label + upgraded empty reviews state |
| `client/src/pages/VendorDashboardPage.jsx` | Conditional `✦ NEWLY LISTED` vs real rating in listing card meta row |

---

## 7. Acceptance Criteria

- [x] Newly published listing shows zero rating in DB (`rating: 0`, `reviewsCount: 0`).
- [x] Explore page shows amber `✦ NEWLY ADDED` badge on zero-review listings.
- [x] Room detail page header shows `✦ NEWLY LISTED — NO REVIEWS YET` on zero-review listings — no star icon.
- [x] Room detail reviews section shows callout "Be the first to review" instead of bare text.
- [x] Vendor dashboard listing card shows `✦ NEWLY LISTED` — no fake rating displayed to the property owner.
- [x] Listings with ≥ 1 review render the real computed average rating on all three surfaces.
- [x] No regression on existing listings that already have reviews.

---

## 8. Design Rationale

| Decision | Rationale |
|---|---|
| Amber palette for guest-facing "Newly Added" | Amber is neutral/informational — not a conversion color. Does not use terracotta, which is reserved for booking CTAs (`AGENT.md` Rule 8). |
| Terracotta for vendor-facing "Newly Listed" | The vendor dashboard is an internal surface. Terracotta pulse signals action-needed to the owner without conflicting with guest-facing CTA semantics. |
| `animate-pulse` | Draws attention to the "new" state without being aggressive. Stops naturally when the listing receives its first review and re-renders. |
| Dashed border on reviews empty state | Consistent with the project's empty-state pattern (used on empty listings, empty bookings). Signals "space to be filled" vs. solid borders on data. |

---

*Document created: 2026-07-11 — new feature fully implemented in this session.*
