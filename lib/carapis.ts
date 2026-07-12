import type { PaginatedVehicles, VehicleDetail, VehicleFilters } from "./types";

const BASE_URL = process.env.CARAPIS_BASE_URL || "https://carapis.com";
const API_KEY = process.env.CARAPIS_API_KEY;

// NOTE: this file only ever runs on the server (Next.js API routes / server
// components). The API key is read from an environment variable and is
// never sent to the browser. Do not import this file from a "use client"
// component.

class CarapisError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function buildQueryString(filters: VehicleFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  return params.toString();
}

async function carapisFetchOnce<T>(
  path: string,
  cacheSeconds: number
): Promise<T> {
  if (!API_KEY) {
    throw new CarapisError(
      "CARAPIS_API_KEY is not set. Add it to .env.local (see .env.local.example).",
      500
    );
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    ...(cacheSeconds > 0
      ? { next: { revalidate: cacheSeconds } }
      : { cache: "no-store" as const }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new CarapisError(
      `Carapis API request failed (${res.status}): ${body.slice(0, 300)}`,
      res.status
    );
  }

  return res.json() as Promise<T>;
}

// Retries once on any non-404 failure (network blip, rate limit, 5xx).
// A genuine 404 is never retried or cached, so it can't get "stuck".
async function carapisFetch<T>(path: string, cacheSeconds = 0): Promise<T> {
  try {
    return await carapisFetchOnce<T>(path, cacheSeconds);
  } catch (err) {
    if (err instanceof CarapisError && err.status === 404) throw err;
    await new Promise((r) => setTimeout(r, 500));
    return carapisFetchOnce<T>(path, cacheSeconds);
  }
}

// Listings: cached for 60s (fast repeated loads, low risk of stale 404s
// since it's a list, not a single lookup).
export async function fetchVehicles(
  filters: VehicleFilters
): Promise<PaginatedVehicles> {
  const qs = buildQueryString(filters);
  return carapisFetch<PaginatedVehicles>(
    `/apix/catalog_api/vehicles/?${qs}`,
    60
  );
}

// Single vehicle: never cached, so a genuine 404 or a fixed transient
// error is always reflected immediately and correctly.
export async function fetchVehicleById(id: string): Promise<VehicleDetail> {
  return carapisFetch<VehicleDetail>(`/apix/catalog_api/vehicles/${id}/`, 0);
}

export { CarapisError };