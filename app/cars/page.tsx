import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { fetchVehicles, CarapisError } from "@/lib/carapis";
import type { VehicleFilters, VehicleSummary } from "@/lib/types";
import { dictionary } from "@/lib/i18n/dictionary";
import CarCard from "@/app/components/CarCard";
import Filters from "@/app/components/Filters";
import type { Metadata } from "next";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "السيارات المتوفرة للتصدير | معرض العز",
  description:
    "تصفح قوائم السيارات الكورية الموثقة المتوفرة للتصدير — سجل فحص كامل، تحليل السعر، وشحن مباشر.",
};

type SearchParams = { [key: string]: string | undefined };

function parseFilters(sp: SearchParams): VehicleFilters {
  return {
    search: sp.search,
    brand: sp.brand,
    model: sp.model,
    body_type: sp.body_type,
    fuel_type: sp.fuel_type,
    transmission: sp.transmission,
    color: sp.color,
    min_price: sp.min_price ? Number(sp.min_price) : undefined,
    max_price: sp.max_price ? Number(sp.max_price) : undefined,
    min_year: sp.min_year ? Number(sp.min_year) : undefined,
    max_year: sp.max_year ? Number(sp.max_year) : undefined,
    min_mileage: sp.min_mileage ? Number(sp.min_mileage) : undefined,
    max_mileage: sp.max_mileage ? Number(sp.max_mileage) : undefined,
    has_accident:
      sp.has_accident === "true"
        ? true
        : sp.has_accident === "false"
          ? false
          : undefined,
    inspection_passed: sp.inspection_passed === "true" ? true : undefined,
    is_new_vehicle: sp.is_new_vehicle === "true" ? true : undefined,
    is_undervalued: sp.is_undervalued === "true" ? true : undefined,
    ordering: sp.ordering,
    page: sp.page ? Number(sp.page) : 1,
    page_size: 12,
  };
}

async function getManualCars(): Promise<any[]> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "data", "manual-cars.json"),
      "utf-8"
    );
    const cars = JSON.parse(raw);
    return cars.map((c: any) => ({
      id: c.id,
      brand_name: c.make,
      model_name: c.model,
      trim: null,
      year: c.year,
      price_usd: c.price,
      mileage: c.mileage,
      source_code: "متوفرة محلياً",
      is_verified: false,
      has_accident: false,
      analysis: null,
      thumb: c.images?.[0] ? { url: c.images[0] } : null,
      _manual: c,
    }));
  } catch {
    return [];
  }
}

function matchesFilters(car: any, filters: VehicleFilters): boolean {
  if (
    filters.search &&
    !`${car.make} ${car.model}`
      .toLowerCase()
      .includes(filters.search.toLowerCase())
  )
    return false;
  if (filters.brand && car.make?.toLowerCase() !== filters.brand.toLowerCase())
    return false;
  if (filters.model && car.model?.toLowerCase() !== filters.model.toLowerCase())
    return false;
  if (filters.min_price && car.price < filters.min_price) return false;
  if (filters.max_price && car.price > filters.max_price) return false;
  if (filters.min_year && car.year < filters.min_year) return false;
  if (filters.max_year && car.year > filters.max_year) return false;
  if (filters.min_mileage && car.mileage < filters.min_mileage) return false;
  if (filters.max_mileage && car.mileage > filters.max_mileage) return false;
  if (
    filters.fuel_type &&
    car.specs?.fuel?.toLowerCase() !== filters.fuel_type.toLowerCase()
  )
    return false;
  if (
    filters.transmission &&
    car.specs?.transmission?.toLowerCase() !==
    filters.transmission.toLowerCase()
  )
    return false;
  return true;
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const activeTab = sp.tab === "manual" ? "manual" : "carapis";

  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value === "en" ? "en" : "ar") as
    | "ar"
    | "en";
  const t = dictionary[lang].carsPage;
  const isRtl = lang === "ar";

  let data;
  let errorMessage: string | null = null;

  if (activeTab === "carapis") {
    try {
      data = await fetchVehicles(filters);
    } catch (err) {
      errorMessage =
        err instanceof CarapisError
          ? err.message
          : isRtl
            ? "حدث خطأ أثناء تحميل السيارات."
            : "Something went wrong loading listings.";
    }
  } else {
    // Manual tab — paginate locally
    const manualCarsRaw = await getManualCars();
    const filtered = manualCarsRaw.filter((c) => matchesFilters(c, filters));
    const page = filters.page || 1;
    const pageSize = 12;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    data = {
      results: paged as any,
      count: total,
      page,
      pages: totalPages,
      has_previous: page > 1,
      has_next: page < totalPages,
      page_size: pageSize,
    } as any;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-8 flex items-end justify-between border-b border-line pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-steel">
            {t.inventoryLabel}
          </p>
          <h1 className="font-display text-3xl font-bold">{t.title}</h1>
        </div>
        {data && (
          <p className="font-mono text-sm text-ink/60">
            {data.count} {t.countSuffix}
          </p>
        )}
      </div>

      <div className="mb-6 flex items-center gap-2">
        <a
          href={buildTabUrl(sp, "carapis")}
          className={`rounded-full px-5 py-2 font-mono text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === "carapis"
              ? "bg-steel text-white"
              : "border border-ink/10 text-ink/60 hover:text-steel"
          }`}
        >
          {t.tabCarapis}
        </a>
        <a
          href={buildTabUrl(sp, "manual")}
          className={`rounded-full px-5 py-2 font-mono text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === "manual"
              ? "bg-steel text-white"
              : "border border-ink/10 text-ink/60 hover:text-steel"
          }`}
        >
          {t.tabManual}
        </a>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <Filters />

        <section className="flex-1">
          {errorMessage && (
            <div className="border border-ink bg-paper p-6">
              <p className="font-mono text-sm text-ink">
                {t.errorPrefix} {errorMessage}
              </p>
              <p className="mt-2 text-base text-ink/60">
                {t.errorHint}{" "}
                <code className="font-mono">CARAPIS_API_KEY</code>{" "}
                {t.errorHintEnd}{" "}
                <code className="font-mono">.env.local</code>.
              </p>
            </div>
          )}

          {data && data.results.length === 0 && (
            <div className="border border-line bg-paper p-10 text-center">
              <p className="font-display text-lg font-semibold">
                {t.noResultsTitle}
              </p>
              <p className="mt-1 text-sm text-ink/60">{t.noResultsBody}</p>
            </div>
          )}

          {data && data.results.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.results.map((car: VehicleSummary) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                {data.has_previous && (
                  <PageLink sp={sp} page={data.page - 1} label={t.previous} />
                )}
                <span className="font-mono text-sm text-ink/60">
                  {t.pageLabel} {data.page} {t.ofLabel} {data.pages}
                </span>
                {data.has_next && (
                  <PageLink sp={sp} page={data.page + 1} label={t.next} />
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function buildTabUrl(sp: SearchParams, tab: string): string {
  const params = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v !== undefined) as [
      string,
      string
    ][]
  );
  params.set("tab", tab);
  params.delete("page");
  return `/cars?${params.toString()}`;
}

function PageLink({
  sp,
  page,
  label,
}: {
  sp: SearchParams;
  page: number;
  label: string;
}) {
  const params = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v !== undefined) as [
      string,
      string
    ][]
  );
  params.set("page", String(page));
  if (sp.tab) params.set("tab", sp.tab);
  return (
    <Link
      href={`/cars?${params.toString()}`}
      className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-wide hover:bg-ink hover:text-paper"
    >
      {label}
    </Link>
  );
}