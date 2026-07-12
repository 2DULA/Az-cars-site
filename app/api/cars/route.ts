import { NextRequest, NextResponse } from "next/server";
import { fetchVehicles, CarapisError } from "@/lib/carapis";
import type { VehicleFilters } from "@/lib/types";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const filters: VehicleFilters = {
    search: sp.get("search") || undefined,
    brand: sp.get("brand") || undefined,
    model: sp.get("model") || undefined,
    body_type: sp.get("body_type") || undefined,
    fuel_type: sp.get("fuel_type") || undefined,
    transmission: sp.get("transmission") || undefined,
    color: sp.get("color") || undefined,
    min_price: sp.get("min_price") ? Number(sp.get("min_price")) : undefined,
    max_price: sp.get("max_price") ? Number(sp.get("max_price")) : undefined,
    min_year: sp.get("min_year") ? Number(sp.get("min_year")) : undefined,
    max_year: sp.get("max_year") ? Number(sp.get("max_year")) : undefined,
    min_mileage: sp.get("min_mileage")
      ? Number(sp.get("min_mileage"))
      : undefined,
    max_mileage: sp.get("max_mileage")
      ? Number(sp.get("max_mileage"))
      : undefined,
    has_accident: sp.has("has_accident")
      ? sp.get("has_accident") === "true"
      : undefined,
    inspection_passed: sp.has("inspection_passed")
      ? sp.get("inspection_passed") === "true"
      : undefined,
    is_new_vehicle: sp.has("is_new_vehicle")
      ? sp.get("is_new_vehicle") === "true"
      : undefined,
    is_undervalued: sp.has("is_undervalued")
      ? sp.get("is_undervalued") === "true"
      : undefined,
    available_only: sp.has("available_only")
      ? sp.get("available_only") === "true"
      : undefined,
    ordering: sp.get("ordering") || undefined,
    page: sp.get("page") ? Number(sp.get("page")) : undefined,
    page_size: sp.get("page_size") ? Number(sp.get("page_size")) : undefined,
  };

  try {
    const data = await fetchVehicles(filters);
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof CarapisError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
