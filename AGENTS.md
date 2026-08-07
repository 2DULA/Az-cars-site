# AGENTS.md

## Commands

```bash
npm run dev      # Next.js dev server at localhost:3000
npm run build    # production build (includes type-checking)
npm run lint     # ESLint (next/core-web-vitals + next/typescript)
npm run start    # production server
```

No separate typecheck script — Next.js `tsconfig.json` has `"noEmit": true` and type errors surface during `next build`.

## RTL-first, bilingual

Default layout is `lang="ar" dir="rtl"`. All UI strings live in `lib/i18n/dictionary.ts` (ar + en). LanguageContext stores preference in a `lang` cookie. **Any new visible text must be added to `dictionary.ts`**, never hardcoded.

## Data sources (3 distinct flows)

### 1. Carapis API (primary listings)
- `lib/carapis.ts` — server-only client. **Never import this in a `"use client"` component** — it reads `CARAPIS_API_KEY` from env.
- Auth header uses `Authorization: Bearer <key>`. Some API tiers use `Api-Key` instead — confirm via `my.carapis.com/apidocs` when provisioning a new key.
- Listings cached 60s; single-vehicle detail never cached (avoids stale 404s). Retries once on non-404 failures.
- Endpoint paths: `/apix/catalog_api/vehicles/` and `/apix/catalog_api/vehicles/{id}/`
- Server Components call `lib/carapis.ts` directly (no proxy needed). API routes at `/api/cars` are available for client components.
- Carapis images must be routed through the image proxy: use `proxiedImage()` from `lib/proxiedImage.ts`.

### 2. Auction data (scraper)
- Python scraper: `scraper/scrape_auctions.py` → outputs `scraper/auctions.json`. Run manually to refresh auction listings, scraping `general-cars.com`.
- Auction detail pages use the Node.js route `/api/scrape-details?targetUrl=...` to scrape individual car pages at `general-cars.com`/`lotteautoauction.net`.
- `axios` + `cheerio` deps in `package.json` exist for the scrape-details route.

### 3. Manual cars (admin panel)
- Stored as `data/manual-cars.json`. CRUD via `/api/admin/cars` route.
- Admin uploads go to `public/uploads/cars/`.
- Auth gated by `lib/adminAuth.ts` — checks Supabase session + hardcoded admin email list.

## Auth & Supabase

- Supabase SSR with `@supabase/ssr`. Middleware (`middleware.ts`) refreshes the session cookie on every request.
- Three Supabase clients:
  - `lib/supabase/server.ts` — for RSC/route handlers (uses `cookies()`)
  - `lib/supabase/client.ts` — for browser/client components
  - `lib/supabase/admin.ts` — service-role client for bypassing RLS on server. **Never import in client code.** Requires `SUPABASE_SERVICE_ROLE_KEY` env var (no `NEXT_PUBLIC_` prefix).
- Admin emails are hardcoded in `lib/adminAuth.ts`. To add an admin, edit the `ADMIN_EMAILS` array.
- Ahsellcar API auth (`lib/ahsellcar/auth.ts`) stores tokens in a Supabase `scraper_auth` table. Requires a one-time manual login before use — otherwise throws "No scraper_auth row found."

## Environment variables

Required in `.env.local`:
- `CARAPIS_API_KEY` — Carapis API key
- `CARAPIS_BASE_URL` — defaults to `https://carapis.com`
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (safe for client)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only, **never** prefix with `NEXT_PUBLIC_`)

## Tech stack notes

- **Next.js 16** with React 19, App Router
- **Tailwind CSS v4** via `@tailwindcss/postcss` (not the old Tailwind v3 PostCSS plugin)
- Custom CSS variables (`--ink`, `--steel`, `--paper`, `--amber`, `--line`) mapped to Tailwind tokens via `@theme inline` in `globals.css`
- `framer-motion` for animations, `lucide-react` for icons
- `@/*` path alias maps to project root (configured in `tsconfig.json`)
