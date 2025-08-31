# MicroRoadmap — Demo App Specification (Next.js 15.5 / React 19)

A minimal, instructive full‑stack demo that showcases modern Next.js 15.5 and React 19 features
without becoming a full product. The scope is intentionally lean and fast to implement.

---

## Purpose & Goals

Showcase a compact set of platform capabilities in a single repo:

- Server Actions for CRUD + publish flow
- React Server Components (RSC) data fetching and caching
- Data partitioning: **Draft (private, uncached)** vs **Published (public, cached)** with tag‑based
  revalidation
- SVG rendering for a time ruler + feature blocks
- Optimistic UI for block edits (create/move/resize/delete)
- Server validation of edits (range, overlap rules)
- Server‑Sent Events (SSE) for live activity pings
- Streaming UI with Suspense (slow analytics panel)
- Route Handler for OG tag fetching (with fetch caching, image fallback, and rate limiting)
- RSC streaming boundaries around independently resolving panels

---

## Concept Summary

A tiny **roadmap timeline** for a product. Users create “features,” assign them to quarters, and
publish a read‑only roadmap page. The draft workspace is private and always fresh; the public
roadmap is cached and revalidated by tags.

---

## Minimum Viable Scope

Keep it small and obvious:

- One user role (assume a single demo user; no auth hardening)
- One roadmap (single workspace)
- Quarters only (e.g., Q1–Q4 of current and next year)
- Basic feature fields; simple overlap rules per **lane** (category)
- Single public page for the published view
- Minimal analytics (counts, simple aggregates) with artificial delay to demonstrate streaming

Non‑goals: multi‑tenant auth, complex permissions, real‑time multi‑cursor, mobile perfection,
exhaustive settings, accessibility beyond basic landmarks/labels.

---

## User POV Requirements

As a demo user, I can:

1. See a **Draft Roadmap** page with an SVG time ruler and feature blocks laid out by quarter and
   lane.
2. Create a new feature, edit its title, choose a lane, set start/end quarter, and optionally attach
   a reference link.
3. Drag or resize a feature block along the grid. The UI updates **optimistically**; if invalid, it
   snaps back with an error message.
4. Delete a feature.
5. Click **Publish** to freeze the current draft into a **Published Roadmap**. The public page
   updates after publish via **tag‑based revalidation**.
6. Open the public roadmap URL that renders quickly from cache.
7. See **live activity pings** (SSE) in the draft view (e.g., small ticker showing simulated
   “activity” or “viewers online”).
8. Paste a link into a feature; a small card shows OG title/description. If unfurl fails or no OG
   image, a generated **SVG fallback** is used.
9. Observe **streaming** content: an “Analytics” side panel (counts per lane/quarter) resolves under
   **Suspense** and streams when ready.
10. See clear empty states and errors (no features yet, publish complete, unfurl failed, rate
    limited, etc.).

---

## Data Model (MVP)

- Feature: id, title, lane, startQuarter, endQuarter, status ("draft" | "published"), linkUrl?,
  color?
- Lane: id, name (e.g., “Platform”, “UX”, “Growth”) — seed 3 lanes
- Activity (ephemeral): server‑generated items for SSE (no persistence required)

Notes:

- Keep dependency logic out of MVP; prioritize overlap rules per lane.
- Use quarters as discrete integer indices (e.g., 2025Q1 → 2025\*4+1) for simpler validation.

---

## Pages & Routes (WHAT to implement)

App routes (names are indicative; adjust as needed):

- Draft Workspace: root page showing SVG grid, features list, controls, analytics (with Suspense),
  and an activity ticker.
- Public Roadmap: `/public` page that renders the published snapshot (server‑cached,
  tag‑revalidated).
- OG Unfurl API: `/api/unfurl` route handler that fetches and parses OG tags with caching + rate
  limiting; returns minimal JSON.
- SVG Fallback OG: `/og` route that returns an SVG image response for missing OG images.
- SSE Stream: `/api/activity` route that keeps an SSE connection open and periodically emits small
  JSON events.

Server Actions (names indicative):

- `createFeature`
- `updateFeature` (position/size/title/lane/link)
- `deleteFeature`
- `publishRoadmap` (copy or flip draft → published; then revalidate tags)

---

## RSC Data Partitioning & Caching

- Draft data: fetched with **no caching** (private, fresh).
- Published data: fetched **with cache** and **tagged**. Revalidate on publish.
- Tag plan (example):
  - `roadmap:published`
  - `roadmap:draft`
  - (optionally) `feature:{id}` for granular invalidation if needed

Acceptance criteria:

- Draft edits never require a page reload to become visible.
- Publishing triggers an immediate tag revalidation and the public page reflects changes after the
  next request.

---

## SVG Time Ruler & Blocks

- Render a horizontal SVG time ruler with quarter ticks and labels.
- Render lanes as horizontal bands with labels at left.
- Render features as rectangles positioned by lane and quarter span.
- Provide handles for resize and drag; interactivity can be a small client component controlling the
  SVG via props and callbacks.

Acceptance criteria:

- Snappy interaction at small data sizes (≤ 20 features).
- Text labels truncate gracefully; titles show full text on focus/hover via tooltip or aria‑label.

---

## Optimistic UI & Server Validation

Optimistic edits:

- Local state updates immediately on create/move/resize/delete.
- Pending indicators for each edited block.

Server validation rules (fail fast):

- startQuarter ≤ endQuarter
- startQuarter and endQuarter within supported range
- No overlapping features in the same lane for the same quarter span

Failure handling:

- On validation failure, revert the optimistic change and display a terse error.

---

## Server‑Sent Events (SSE)

- `/api/activity` sends a small event every few seconds: { type: "heartbeat" | "viewers" | "hint",
  value }.
- Draft workspace subscribes via EventSource and updates a tiny ticker component.
- Keep the implementation minimal; simulated data is fine.

Acceptance criteria:

- SSE endpoint stays connected and emits at least one event every ~5–10 seconds.
- Client unsubscribes cleanly on unmount.

---

## Streaming UI with Suspense

- “Analytics” panel (counts by lane, total features, active quarters) deliberately waits (artificial
  delay) before resolving to demonstrate streaming.
- Wrap with a Suspense boundary so the main grid renders immediately and the panel streams in later.

Acceptance criteria:

- Without JavaScript errors, the grid and controls render immediately; analytics content pops in
  after a delay.

---

## Route Handler: OG Unfurl + Caching + Fallback + Rate Limit

- `/api/unfurl?url=…`:
  - Validate input (URL).
  - Apply simple token‑bucket **rate limit** per IP (e.g., 30 requests / 10 minutes). On exceed,
    return 429 with a small JSON error.
  - Fetch with cache semantics (longish TTL appropriate for demo).
  - Parse minimal OG fields (title, description, image). No extra libraries required.
  - Return JSON that the RSC card can use; do not proxy remote images.
- `/og` route: generate an SVG card with title/domain used as a fallback image.

Acceptance criteria:

- When a feature has a link, its card attempts unfurl; card shows data once available.
- If rate limited, the UI shows a succinct message and uses fallback immediately.

---

## Error & Empty States

- Empty roadmap (no features yet): friendly call‑to‑action to create the first feature.
- Publish success: confirm banner; link to public page.
- Unfurl errors: short status and fallback card.
- SSE disconnected: silent retry or subtle badge; do not block core flows.

---

## Technical Suggestions (libraries & runtime)

- Database: SQLite (file‑based) via a lightweight ORM. Prefer Drizzle ORM or Prisma; OK to use
  better‑sqlite3 directly for brevity.
- Validation: Zod for server action inputs.
- Styling: Tailwind CSS; optional icon set (e.g., Lucide) if desired.
- Runtime: Node.js runtime for SSE and DB access; keep everything in the same app for simplicity.
- State: Use React 19 features (useOptimistic) in small client islands.
- Caching: RSC fetch with cache tags; draft paths use no‑store semantics.

Avoid: heavy charting libs, external state managers, complex auth providers.

---

## Accessibility & UX Notes (basic)

- Provide aria‑labels on SVG blocks and handles.
- Keyboard shortcuts not required; ensure focus styles and readable contrast.
- Tooltips or titles to expose full feature names.

---

## Seed Data & Demo Scripts

- Seed three lanes and 6–8 features spanning 2–3 quarters.
- Provide a “Demo Mode” toggle to populate the DB and start SSE pings.
- Add a few features with a link to demonstrate the unfurl/fallback flow.

---

## Acceptance Checklist (tie to goals)

- Draft vs Published: separate data fetch strategies; publish triggers tag revalidation.
- SVG grid renders lanes and quarters; blocks drag/resize with optimistic updates.
- Server actions enforce validation and persist changes; failures revert optimistic UI.
- SSE ticker renders events from `/api/activity`.
- Analytics panel streams under Suspense; main grid shows immediately.
- `/api/unfurl` caches fetches, applies rate limit, and returns OG data; `/og` renders SVG fallback.
- Public page is fast due to server cache and tag‑based invalidation.

---

## Optional Stretch (only if time permits)

- Per‑feature granular tags (`feature:{id}`) and partial revalidation
- Simple share image (Open Graph) for the published roadmap page (server‑generated SVG)
- Basic dependency hints (non‑blocking warnings)

---

## Suggested Project Structure (indicative)

- app/ (draft workspace page, public page)
- app/api/unfurl/route.ts (unfurl + rate limit)
- app/api/activity/route.ts (SSE)
- app/og/route.tsx (SVG fallback image)
- app/actions.ts (server actions)
- components/ (SVG Grid, Block item client island, Analytics panel, Link card)
- lib/db.ts, lib/validation.ts, lib/cache.ts, lib/rateLimit.ts
- prisma/ or drizzle/ (schema + seed)

This is a “WHAT to build” plan. The agent should implement it end‑to‑end with minimal dependencies,
prioritizing clarity and demonstration value over completeness.
