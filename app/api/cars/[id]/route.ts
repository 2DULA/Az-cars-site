import { NextRequest, NextResponse } from "next/server";
import { fetchVehicleById, CarapisError } from "@/lib/carapis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const data = await fetchVehicleById(id);
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof CarapisError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
