import Link from "next/link";
import { fetchVehicles, CarapisError } from "@/lib/carapis";
import type { VehicleFilters } from "@/lib/types";
import CarCard from "@/app/components/CarCard";
import Filters from "@/app/components/Filters";

export const dynamic = "force-dynamic";

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

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  let data;
  let errorMessage: string | null = null;

  try {
    data = await fetchVehicles(filters);
  } catch (err) {
    errorMessage =
      err instanceof CarapisError
        ? err.message
        : "حدث خطأ أثناء تحميل السيارات.";
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 flex items-end justify-between border-b border-line pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-steel">
            المخزون
          </p>
          <h1 className="font-display text-3xl font-bold">
            السيارات المتوفرة للتصدير
          </h1>
        </div>
        {data && (
          <p className="font-mono text-sm text-ink/60">
            {data.count} سيارة متوفرة
          </p>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <Filters />

        <section className="flex-1">
          {errorMessage && (
            <div className="border border-ink bg-white p-6">
              <p className="font-mono text-sm text-ink">
                تعذّر تحميل السيارات: {errorMessage}
              </p>
              <p className="mt-2 text-base text-ink/60">
                إذا كنت تشغّل الموقع محليًا، تأكد من ضبط{" "}
                <code className="font-mono">CARAPIS_API_KEY</code> في ملف{" "}
                <code className="font-mono">.env.local</code>.
              </p>
            </div>
          )}

          {data && data.results.length === 0 && (
            <div className="border border-line bg-white p-10 text-center">
              <p className="font-display text-lg font-semibold">
                لا توجد سيارات مطابقة لهذه الفلاتر
              </p>
              <p className="mt-1 text-sm text-ink/60">
                جرّب توسيع نطاق السعر أو إزالة أحد الفلاتر.
              </p>
            </div>
          )}

          {data && data.results.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.results.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                {data.has_previous && (
                  <PageLink sp={sp} page={data.page - 1} label="→ السابق" />
                )}
                <span className="font-mono text-sm text-ink/60">
                  صفحة {data.page} من {data.pages}
                </span>
                {data.has_next && (
                  <PageLink sp={sp} page={data.page + 1} label="التالي ←" />
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
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
  return (
    <Link
      href={`/cars?${params.toString()}`}
      className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-wide hover:bg-ink hover:text-paper"
    >
      {label}
    </Link>
  );
}
