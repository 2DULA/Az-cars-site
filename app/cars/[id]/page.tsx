import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchVehicleById, CarapisError } from "@/lib/carapis";
import { formatSAR, formatMileage, arLabel } from "@/lib/format";
import { proxiedImage } from "@/lib/proxiedImage";

export const dynamic = "force-dynamic";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let car;
  try {
    car = await fetchVehicleById(id);
  } catch (err) {
    if (err instanceof CarapisError && err.status === 404) notFound();
    throw err;
  }

  const mainPhoto =
    car.photos.find((p) => p.is_main)?.url || car.photos[0]?.url;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <Link
        href="/cars"
        className="mb-6 inline-block font-mono text-xs uppercase tracking-wide text-steel hover:underline"
      >
        → العودة إلى السيارات
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* الصور */}
        <div className="lg:col-span-3">
          <div className="aspect-[4/3] w-full overflow-hidden border border-line bg-line">
            {mainPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={proxiedImage(mainPhoto)}
                alt={`${car.brand_name} ${car.model_name}`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-sm text-ink/40">
                لا توجد صور متاحة
              </div>
            )}
          </div>
          {car.photos.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {car.photos.slice(0, 5).map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={proxiedImage(p.thumb_url || p.url)}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="aspect-square w-full border border-line object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* الملخص وزر الطلب */}
        <div className="lg:col-span-2">
          <p className="font-mono text-xs uppercase tracking-wide text-steel">
            {car.year} · {car.source_code} {car.is_verified && "· موثّقة"}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight">
            {car.brand_name} {car.model_name}
          </h1>
          <p className="mt-1 text-ink/60">
            {car.trim} {car.generation && `· ${car.generation}`}
          </p>

          <p className="mt-5 font-display text-4xl font-bold" suppressHydrationWarning>
            {formatSAR(car.price_usd)}
          </p>
          {car.price_original && car.price_original_currency && (
            <p className="mt-1 font-mono text-sm text-ink/50">
              السعر الأصلي في الإعلان: {car.price_original}{" "}
              {car.price_original_currency}
            </p>
          )}

          {car.has_valuation && car.analysis && (
            <ValuationCard analysis={car.analysis} />
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-6">
            <Spec label="عداد المسافات" value={formatMileage(car.mileage)} />
            <Spec label="نوع الوقود" value={arLabel(car.fuel_type)} />
            <Spec label="ناقل الحركة" value={arLabel(car.transmission)} />
            <Spec label="نوع الهيكل" value={arLabel(car.body_type)} />
            <Spec label="نظام الدفع" value={arLabel(car.drive_type)} />
            <Spec label="اللون" value={arLabel(car.color)} />
            {car.owner_count != null && (
              <Spec label="عدد الملاك" value={String(car.owner_count)} />
            )}
            {car.engine_cc ? (
              <Spec label="سعة المحرك" value={`${car.engine_cc} سم³`} />
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-6">
            <ConditionBadge
              ok={!car.has_accident}
              okLabel="لا يوجد حادث مسجل"
              badLabel="يوجد حادث مسجل"
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

          <button className="mt-8 w-full bg-ink py-3 font-mono text-sm uppercase tracking-wide text-paper hover:bg-steel">
            طلب عرض سعر للتصدير
          </button>

          {car.listing_url && (
            <a
              href={car.listing_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center font-mono text-xs text-steel underline"
            >
              عرض الإعلان الأصلي
            </a>
          )}
        </div>
      </div>

      {car.description && (
        <div className="mt-10 max-w-3xl border-t border-line pt-6">
          <h2 className="font-display text-lg font-semibold">
            ملاحظات البائع
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/80">
            {car.description}
          </p>
        </div>
      )}

      {car.features?.length > 0 && (
        <div className="mt-10 border-t border-line pt-6">
          <h2 className="font-display text-lg font-semibold">المزايا</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {car.features.map((f, i) => (
              <span
                key={i}
                className="border border-line bg-white px-3 py-1 font-mono text-xs"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wide text-ink/50">
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
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
      className={`border px-3 py-1.5 font-mono text-xs ${ok
        ? "border-steel bg-steel/10 text-steel"
        : "border-ink/40 bg-ink/5 text-ink/70"
        }`}
    >
      {ok ? okLabel : badLabel}
    </span>
  );
}

function ValuationCard({
  analysis,
}: {
  analysis: NonNullable<
    Awaited<ReturnType<typeof fetchVehicleById>>["analysis"]
  >;
}) {
  return (
    <div className="mt-4 border border-line bg-white p-4">
      <p className="font-mono text-[11px] uppercase tracking-wide text-steel">
        تحليل سعر السوق
      </p>
      <p className="mt-1 font-display text-base font-semibold">
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
          النطاق العادل المقدَّر: {formatSAR(analysis.price_low)} –{" "}
          {formatSAR(analysis.price_high)}
        </p>
      )}
    </div>
  );
}
