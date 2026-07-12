# Korea Export Cars

A Next.js site for browsing verified Korean vehicle listings sourced from the
Carapis API (Encar and others), built for export buyers.

## How the API key stays safe

The Carapis API key is **never sent to the browser**. It's read from an
environment variable (`CARAPIS_API_KEY`) only inside server code:

- `lib/carapis.ts` — the only file that calls Carapis directly. Runs on the
  server only.
- `app/api/cars/route.ts` and `app/api/cars/[id]/route.ts` — API proxy
  routes, in case you need to call Carapis from client components later.
- `app/cars/page.tsx` and `app/cars/[id]/page.tsx` — these are React Server
  Components, so they call `lib/carapis.ts` directly on the server without
  needing to go through the proxy routes at all.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example env file and add your real key:
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` and set `CARAPIS_API_KEY` to the key the client
   gave you. **Never commit `.env.local`** — it's already in `.gitignore`.

3. Run the dev server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

## Project structure

```
app/
  page.tsx                → homepage
  cars/page.tsx            → listings page (filters + grid)
  cars/[id]/page.tsx       → single vehicle detail page
  api/cars/route.ts        → proxy: GET /api/cars (listings)
  api/cars/[id]/route.ts   → proxy: GET /api/cars/:id (detail)
  components/
    CarCard.tsx             → listing card
    Filters.tsx             → filter sidebar (client component)
lib/
  carapis.ts               → server-only Carapis client (holds the API key)
  types.ts                  → TypeScript types matching the Carapis schema
  format.ts                 → price/mileage formatting helpers
```

## Things to double check against the live API

The endpoint paths and auth header in `lib/carapis.ts` are based on the
Carapis API docs at the time this was built:

```
GET /apix/catalog/api/vehicles/       (listings)
GET /apix/catalog/api/vehicles/{id}/  (detail)
Authorization: Api-Key YOUR_KEY
```

Confirm these against the live playground at `my.carapis.com/apidocs`
once you have your API key active — some API providers change the auth
header format between free and paid tiers.

## Deployment

1. Push this repo to GitHub (keep it **private** — it's a client project).
2. Import it into Vercel (free tier is fine for a prototype).
3. In Vercel's project settings -> Environment Variables, add
   `CARAPIS_API_KEY` with the real key. Never put it in code.
4. Deploy. You'll get a free `*.vercel.app` URL to share with the client.
5. Once approved, buy a domain and connect it in Vercel's Domains tab -
   no redeploy needed.

## Not yet built

- Inquiry/contact form submission handling (currently a static button)
- Brand/model dropdown data (needs the Carapis catalog/brands endpoint)
- Pagination page-size controls, sort-order UI
