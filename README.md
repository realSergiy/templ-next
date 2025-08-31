# MicroRoadmap Demo App

A minimal, instructive full-stack demo showcasing modern Next.js 15.5 and React 19 features. Build
and visualize product roadmaps with drag-and-drop functionality, real-time updates, and caching.

## Features

- **Next.js 15.5**: Server Actions, RSC streaming, and tag-based revalidation
- **React 19**: useOptimistic for instant UI updates
- **SQLite + Drizzle ORM**: Type-safe database operations
- **Server-Sent Events**: Real-time activity stream
- **Optimistic UI**: Instant feedback with server validation
- **SVG Visualization**: Interactive roadmap timeline grid
- **OG Unfurl API**: Link preview with rate limiting and fallback images
- **Streaming UI**: Suspense boundaries for progressive loading

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (recommended) or npm

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   pnpm approve-builds  # Approve native module builds
   ```

2. Set up the database:

   ```bash
   pnpx drizzle-kit push    # Create database tables
   pnpx tsx src/lib/db/seed.ts  # Seed with demo data
   ```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to access the draft workspace.

### Building for Production

```bash
pnpm build
pnpm start
```

## How to Use the App

### Draft Workspace (`/`)

The main workspace where you create and manage roadmap features:

1. **View the Timeline Grid**
   - Horizontal ruler shows quarters (Q1-Q4 for current and next year)
   - Vertical lanes represent feature categories (Platform, UX, Growth)
   - Feature blocks show title, duration, and optional link icons

2. **Create Features**
   - Click "Add Feature" to open the creation form
   - Fill in title, select lane, choose start/end quarters
   - Add optional link URL and custom color
   - Features are validated to prevent overlaps within lanes

3. **Edit Features**
   - Drag feature blocks to move between lanes or quarters
   - Click the trash icon to delete features
   - Changes update optimistically with server validation

4. **Real-time Activity**
   - Activity ticker shows live connection status and viewer count
   - Updates every 5 seconds via Server-Sent Events

5. **Analytics Panel**
   - Streams in after a 2-second delay (demonstrates Suspense)
   - Shows total features, breakdown by lane, and usage stats

6. **Publish**
   - Click "Publish" to freeze current draft into public view
   - Triggers cache revalidation for the public page

### Public Roadmap (`/public`)

Read-only cached view of the published roadmap:

- Fast loading thanks to server-side caching
- Shows the last published snapshot
- Clean, presentation-ready layout
- Link back to draft workspace

### API Endpoints

- `/api/activity` - Server-Sent Events stream for live updates
- `/api/unfurl?url=...` - OG metadata fetching with rate limiting (30 requests/10min)
- `/og?title=...&domain=...` - SVG fallback images for links

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run TypeScript check and ESLint
- `pnpm fix` - Format with Prettier and fix ESLint issues
- `pnpx tsx src/lib/db/seed.ts` - Re-seed database with demo data

## Project Structure

```folder-structure
src/
├── app/
│   ├── actions.ts          # Server Actions for CRUD operations
│   ├── page.tsx            # Draft workspace (main page)
│   ├── public/page.tsx     # Published roadmap view
│   └── api/
│       ├── activity/       # SSE endpoint for live updates
│       └── unfurl/         # OG metadata API with rate limiting
├── components/
│   ├── roadmap-grid.tsx    # Interactive SVG timeline grid
│   ├── create-feature-form.tsx  # Feature creation form
│   ├── analytics-panel.tsx # Streaming analytics with Suspense
│   ├── activity-ticker.tsx # Real-time activity display
│   ├── publish-button.tsx  # Publish roadmap functionality
│   ├── public-roadmap-view.tsx  # Read-only roadmap display
│   └── link-card.tsx       # OG link preview cards
├── lib/
│   ├── db/                 # Database schema and operations
│   ├── validation.ts       # Zod schemas for input validation
│   ├── utils.ts           # Utility functions
│   └── rate-limit.ts      # Rate limiting logic
└── roadmap.db             # SQLite database file
```

## Technical Highlights

### React 19 Features

- **useOptimistic**: Instant UI updates with automatic rollback on errors
- **useTransition**: Non-blocking state updates during server operations

### Next.js 15.5 Features

- **Server Actions**: Type-safe server functions for CRUD operations
- **RSC Streaming**: Analytics panel streams in progressively
- **Tag-based Revalidation**: Published roadmap cache invalidation
- **Route Handlers**: Custom APIs for SSE and OG unfurling

### Data Architecture

- **Draft vs Published**: Separate data fetch strategies
- **Optimistic Updates**: Client state updates immediately, server validates
- **Cache Strategy**: Draft data never cached, published data cached with tags
- **Overlap Validation**: Server-side feature collision detection

### Real-time Features

- **Server-Sent Events**: Live activity ticker with simulated viewer counts
- **Rate Limiting**: Token bucket algorithm for API protection
- **OG Unfurling**: Automatic link preview generation with SVG fallbacks

## Demo Flow

1. **Start with Seeded Data**: 6 features across 3 lanes (Platform, UX, Growth)
2. **Explore Interactions**: Drag features, create new ones, observe optimistic updates
3. **Watch Streaming**: Analytics panel loads progressively, activity ticker updates
4. **Test Publishing**: Publish draft to see cache revalidation in action
5. **View Public Page**: Fast-loading cached roadmap at `/public`

## Architecture Decisions

- **Single User**: No authentication for demo simplicity
- **Quarter-based Timeline**: Discrete time periods for easier validation
- **Lane-based Organization**: Prevents feature overlaps within categories
- **Optimistic First**: UI responds instantly, server validates asynchronously
- **Cache Tags**: Granular invalidation for published vs draft content
