import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { fetchVehicleById, CarapisError } from "@/lib/carapis";
import { formatPrice, formatMileage, arLabel } from "@/lib/format";
import { proxiedImage } from "@/lib/proxiedImage";
import CarGallery from "@/app/components/CarGallery";

const WHATSAPP_NUMBER = "9665XXXXXXXX";

export const dynamic = "force-dynamic";

type CurrencyCode = "SAR" | "USD" | "AED" | "EGP";

type ValuationAnalysis = {
  price_status: string;
  is_undervalued: boolean;
  percentile_rank: number;
  market_delta_pct: number;
  estimated_price?: number;
  price_low?: number;
  price_high?: number;
  confidence?: number;
  actual_price?: number;
  price_difference?: number;
  price_difference_pct?: number;
  comparable_count?: number;
  cohort_min_price?: number;
  cohort_max_price?: number;
  cohort_median_price?: number;
  breakdown?: {
    base_price?: string;
    year_impact?: string;
    mileage_impact?: string;
    options_impact?: string;
  };
  analysis_updated_at?: string;
};

async function getCurrency(): Promise<CurrencyCode> {
  const cookieStore = await cookies();
  const value = cookieStore.get("currency")?.value;
  if (value === "USD" || value === "AED" || value === "EGP" || value === "SAR") {
    return value;
  }
  return "SAR";
}

async function getManualCar(id: string) {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "data", "manual-cars.json"),
      "utf-8"
    );
    const cars = JSON.parse(raw);
    return cars.find((c: any) => c.id === id) || null;
  } catch {
    return null;
  }
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currency = await getCurrency();

  if (id.startsWith("manual-")) {
    const car = await getManualCar(id);
    if (!car) notFound();
    return <ManualCarDetail car={car} currency={currency} />;
  }

  let car;
  try {
    car = await fetchVehicleById(id);
  } catch (err) {
    if (err instanceof CarapisError && err.status === 404) notFound();
    throw err;
  }

  const photos = car.photos?.length ? car.photos : [];
  const mainPhoto =
    photos.find((p) => p.is_main)?.url || photos[0]?.url;

  return (
    <MainLayout
      title={`${car.brand_name} ${car.model_name}`}
      subtitle={[car.trim, car.generation].filter(Boolean).join(" · ")}
      badge={`${car.year} · ${car.source_code}${car.is_verified ? " · موثّقة" : ""}`}
      mainPhoto={mainPhoto ? proxiedImage(mainPhoto) : null}
      thumbs={photos.slice(0, 12).map((p) => proxiedImage(p.thumb_url || p.url))}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-display text-xl font-bold border-r-4 border-steel pr-3 mb-6 text-ink">
              نظرة عامة
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoTile label="سنة الصنع" value={String(car.year)} />
              <InfoTile label="عداد المسافات" value={formatMileage(car.mileage)} />
              <InfoTile label="ناقل الحركة" value={arLabel(car.transmission)} />
              <InfoTile
                label="الحالة"
                value={car.is_available ? "متوفرة" : "غير متوفرة"}
              />
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold border-r-4 border-steel pr-3 mb-6 text-ink">
              تفاصيل السيارة
            </h2>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 bg-paper border border-line rounded-lg p-4">
              <SpecRow label="الشركة المصنعة" value={car.brand_name} />
              <SpecRow label="الموديل" value={car.model_name} />
              {car.trim && <SpecRow label="الفئة" value={car.trim} />}
              {car.generation && <SpecRow label="الجيل" value={car.generation} />}
              <SpecRow label="نوع الوقود" value={arLabel(car.fuel_type)} />
              <SpecRow label="نوع الهيكل" value={arLabel(car.body_type)} />
              <SpecRow label="اللون" value={arLabel(car.color)} />
              <SpecRow label="نظام الدفع" value={arLabel(car.drive_type)} />
              {car.engine_cc ? (
                <SpecRow label="سعة المحرك" value={`${car.engine_cc} سم³`} />
              ) : null}
              {car.seat_count != null && (
                <SpecRow label="عدد المقاعد" value={String(car.seat_count)} />
              )}
              {car.owner_count != null && (
                <SpecRow label="عدد الملاك" value={String(car.owner_count)} />
              )}
              <SpecRow
                label="نوع السيارة"
                value={car.is_new_vehicle ? "جديدة" : "مستعملة"}
              />
              {car.warranty_type && (
                <SpecRow label="نوع الضمان" value={car.warranty_type} />
              )}
              {car.vin && <SpecRow label="رقم الهيكل (VIN)" value={car.vin} mono />}
              {car.vehicle_no && (
                <SpecRow label="رقم المركبة" value={car.vehicle_no} mono />
              )}
              {car.listing_id && (
                <SpecRow label="رقم الإعلان" value={car.listing_id} mono />
              )}
              <SpecRow label="المصدر" value={car.source_code} />
              {car.first_seen_at && (
                <SpecRow
                  label="أُدرجت في"
                  value={new Date(car.first_seen_at).toLocaleDateString("ar-SA")}
                />
              )}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold border-r-4 border-steel pr-3 mb-6 text-ink">
              الحالة والضمانات
            </h2>
            <div className="flex flex-wrap gap-2">
              <ConditionBadge
                ok={!car.has_accident}
                okLabel="لا يوجد حادث مسجل"
                badLabel="يوجد حادث مسجل"
              />
              <ConditionBadge
                ok={!car.has_simple_repair}
                okLabel="لا يوجد إصلاح بسيط"
                badLabel="يوجد إصلاح بسيط مسجل"
              />
              <ConditionBadge
                ok={car.inspection_passed}
                okLabel="اجتازت الفحص"
                badLabel="الفحص غير متوفر"
              />
              <ConditionBadge
                ok={!car.has_recall || car.recall_fulfilled}
                okLabel="لا يوجد استدعاء مفتوح"
                badLabel="يوجد استدعاء مفتوح"
              />
            </div>
          </section>

          {car.features?.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-bold border-r-4 border-steel pr-3 mb-6 text-ink">
                المزايا
              </h2>
              <div className="flex flex-wrap gap-2">
                {car.features.map((f, i) => (
                  <span
                    key={i}
                    className="border border-line bg-paper px-3 py-1 font-mono text-xs rounded text-ink"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </section>
          )}

        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="bg-ink rounded-2xl p-6 text-paper text-center">
              <p className="opacity-70 text-sm mb-2">السعر</p>
              <p className="font-display text-3xl font-bold" suppressHydrationWarning>
                {formatPrice(car.price_usd, currency)}
              </p>
              {car.price_original && car.price_original_currency && (
                <p className="mt-1 font-mono text-xs opacity-60">
                  السعر الأصلي: {car.price_original} {car.price_original_currency}
                </p>
              )}
            </div>

            <div className="bg-paper border border-line rounded-2xl p-6">
              {car.has_valuation && car.analysis && (
                <ValuationCard analysis={car.analysis} currency={currency} />
              )}
              <a
                href={buildWhatsAppLink({
                  brand: car.brand_name,
                  model: car.model_name,
                  year: car.year,
                  price: formatPrice(car.price_usd, currency),
                  listingId: car.listing_id,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl mt-4 mb-3 text-center transition-colors"
              >
                طلب عرض سعر للتصدير
              </a>

              {car.listing_url && (
                <a
                  href={car.listing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center font-mono text-xs text-steel underline"
                >
                  عرض الإعلان الأصلي
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout >
  );
}

// ---------------------------------------------------------------------

function MainLayout({
  title,
  subtitle,
  badge,
  mainPhoto,
  thumbs,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  mainPhoto: string | null;
  thumbs: string[];
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" className="bg-paper min-h-screen text-ink">
      <CarGallery
        title={title}
        badge={badge}
        subtitle={subtitle}
        mainPhoto={mainPhoto}
        thumbs={thumbs}
      />

      <div className="mx-auto max-w-6xl px-4 lg:px-8 py-10">
        <Link
          href="/cars"
          className="mb-6 inline-block font-mono text-xs uppercase tracking-wide text-steel hover:underline"
        >
          → العودة إلى السيارات
        </Link>
        {children}
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper border border-line rounded-lg p-3 text-center">
      <p className="text-steel text-xs mb-1">{label}</p>
      <p className="font-bold text-sm text-ink">{value}</p>
    </div>
  );
}

function SpecRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-line py-3 last:border-0">
      <span className="text-sm text-ink/60">{label}</span>
      <span className={`text-sm font-semibold text-ink ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function ConditionBadge({
  ok,
  okLabel,
  badLabel,
}: {
  ok: boolean;
  okLabel: string;
  badLabel: string;
}) {
  return (
    <span
      className={`border px-3 py-1.5 font-mono text-xs rounded-full ${ok
        ? "border-steel bg-steel/10 text-steel"
        : "border-ink/20 bg-ink/5 text-ink/80"
        }`}
    >
      {ok ? okLabel : badLabel}
    </span>
  );
}

function ValuationCard({
  analysis,
  currency,
}: {
  analysis: ValuationAnalysis;
  currency: CurrencyCode;
}) {
  return (
    <div className="border-b border-line pb-4 mb-4">
      <p className="font-mono text-[11px] uppercase tracking-wide text-steel">
        تحليل سعر السوق
      </p>
      <p className="mt-1 font-display text-base font-semibold text-ink">
        {analysis.is_undervalued
          ? "السعر أقل من متوسط السوق"
          : arLabel(analysis.price_status || "سعر مطابق للسوق")}
      </p>
      {typeof analysis.market_delta_pct === "number" && (
        <p className="mt-1 text-sm text-ink/70">
          أقل بنسبة تقارب {Math.abs(analysis.market_delta_pct)}٪ من الإعلانات
          المشابهة
          {analysis.comparable_count
            ? ` (مقارنةً بـ ${analysis.comparable_count} إعلان)`
            : ""}
          .
        </p>
      )}
      {analysis.price_low != null && analysis.price_high != null && (
        <p className="mt-1 font-mono text-xs text-ink/50" suppressHydrationWarning>
          النطاق العادل المقدَّر: {formatPrice(analysis.price_low, currency)} –{" "}
          {formatPrice(analysis.price_high, currency)}
        </p>
      )}
    </div>
  );
}
function buildWhatsAppLink({
  brand,
  model,
  year,
  price,
  listingId,
}: {
  brand: string;
  model: string;
  year: number;
  price: string;
  listingId?: string;
}): string {
  const lines = [
    "طلب عرض سعر للتصدير:",
    `السيارة: ${brand} ${model} (${year})`,
    `السعر: ${price}`,
    listingId ? `رقم الإعلان: ${listingId}` : null,
  ].filter(Boolean);
  const message = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

function ManualCarDetail({
  car,
  currency,
}: {
  car: any;
  currency: CurrencyCode;
}) {
  return (
    <MainLayout
      title={`${car.make} ${car.model}`}
      subtitle={String(car.year)}
      mainPhoto={car.images?.[0] || null}
      thumbs={car.images?.slice(0, 12) || []}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-display text-xl font-bold border-r-4 border-steel pr-3 mb-6 text-ink">
              تفاصيل السيارة
            </h2>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 bg-paper border border-line rounded-lg p-4">
              <SpecRow label="عداد المسافات" value={formatMileage(car.mileage)} />
              {car.specs?.fuel && <SpecRow label="نوع الوقود" value={car.specs.fuel} />}
              {car.specs?.transmission && (
                <SpecRow label="ناقل الحركة" value={car.specs.transmission} />
              )}
              {car.specs?.engine && (
                <SpecRow label="المحرك" value={car.specs.engine} />
              )}
            </div>
          </section>

          {car.description && (
            <section>
              <h2 className="font-display text-xl font-bold border-r-4 border-steel pr-3 mb-6 text-ink">
                ملاحظات البائع
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80 bg-paper border border-line rounded-lg p-4">
                {car.description}
              </p>
            </section>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <div className="bg-ink rounded-2xl p-6 text-paper text-center mb-4">
              <p className="opacity-70 text-sm mb-2">السعر</p>
              <p className="font-display text-3xl font-bold" suppressHydrationWarning>
                {formatPrice(car.price, currency)}
              </p>
            </div>
            <a

              href={buildWhatsAppLink({
                brand: car.make,
                model: car.model,
                year: car.year,
                price: formatPrice(car.price, currency),
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl text-center transition-colors"
            >
            طلب سعر عرض للتصدير
             </a>
          </div>
        </div>
      </div>
    </MainLayout >
  );
}