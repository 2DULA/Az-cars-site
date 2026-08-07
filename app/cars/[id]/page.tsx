import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { fetchVehicleById, CarapisError } from "@/lib/carapis";
import { formatPrice, formatMileage, enumLabel } from "@/lib/format";
import { proxiedImage } from "@/lib/proxiedImage";
import CarGallery from "@/app/components/CarGallery";
import { dictionary } from "@/lib/i18n/dictionary";
import ImportCostCalculator from "@/app/components/ImportCostCalculator";

const WHATSAPP_NUMBER = "966502650283";

export const dynamic = "force-dynamic";

type CurrencyCode = "SAR" | "USD" | "AED" | "EGP";
type Lang = "ar" | "en";

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

async function getLang(): Promise<Lang> {
  const cookieStore = await cookies();
  return cookieStore.get("lang")?.value === "en" ? "en" : "ar";
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
  const lang = await getLang();
  const t = dictionary[lang].carDetailPage;

  if (id.startsWith("manual-")) {
    const car = await getManualCar(id);
    if (!car) notFound();
    return <ManualCarDetail car={car} currency={currency} lang={lang} />;
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

  // Auctions-style spec tiles: label/value pairs, filtered to only show
  // populated values, rendered as a grid of small cards instead of rows.
  const specTiles: [string, string | null | undefined][] = [
    [t.brand, car.brand_name],
    [t.model, car.model_name],
    [t.trim, car.trim],
    [t.generation, car.generation],
    [t.fuelType, enumLabel(car.fuel_type, lang)],
    [t.bodyType, enumLabel(car.body_type, lang)],
    [t.color, enumLabel(car.color, lang)],
    [t.driveType, enumLabel(car.drive_type, lang)],
    [t.engineCc, car.engine_cc ? `${car.engine_cc} ${lang === "ar" ? "سم³" : "cc"}` : null],
    [t.seatCount, car.seat_count != null ? String(car.seat_count) : null],
    [t.ownerCount, car.owner_count != null ? String(car.owner_count) : null],
    [t.vehicleType, car.is_new_vehicle ? t.newVehicle : t.usedVehicle],
    [t.warrantyType, car.warranty_type],
    [t.vin, car.vin],
    [t.vehicleNo, car.vehicle_no],
    [t.listingId, car.listing_id],
    [t.source, car.source_code],
    [
      t.firstSeenAt,
      car.first_seen_at
        ? new Date(car.first_seen_at).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")
        : null,
    ],
  ];

  return (
    <MainLayout
      title={`${car.brand_name} ${car.model_name}`}
      subtitle={[car.trim, car.generation].filter(Boolean).join(" · ")}
      badge={`${car.year} · ${car.source_code}${car.is_verified ? ` · ${lang === "ar" ? "موثّقة" : "Verified"}` : ""}`}
      mainPhoto={mainPhoto ? proxiedImage(mainPhoto) : null}
      thumbs={photos.slice(0, 12).map((p) => proxiedImage(p.thumb_url || p.url))}
      lang={lang}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-display text-xl font-bold text-ink border-r-4 border-steel pr-3 mb-6">
              {t.overview}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoTile label={t.year} value={String(car.year)} />
              <InfoTile label={t.mileage} value={formatMileage(car.mileage, lang)} />
              <InfoTile label={t.transmission} value={enumLabel(car.transmission, lang)} />
              <InfoTile
                label={t.status}
                value={car.is_available ? t.available : t.unavailable}
              />
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink border-r-4 border-steel pr-3 mb-6">
              {t.details}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specTiles
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-ink/5 border border-line rounded-lg p-3 text-center"
                  >
                    <p className="text-steel text-xs mb-1">{label}</p>
                    <p className="font-bold text-sm text-ink">{value}</p>
                  </div>
                ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink border-r-4 border-steel pr-3 mb-6">
              {t.conditionAndWarranty}
            </h2>
            <div className="flex flex-wrap gap-2">
              <ConditionBadge
                ok={!car.has_accident}
                okLabel={t.noAccident}
                badLabel={t.hasAccident}
              />
              <ConditionBadge
                ok={!car.has_simple_repair}
                okLabel={t.noSimpleRepair}
                badLabel={t.hasSimpleRepair}
              />
              <ConditionBadge
                ok={car.inspection_passed}
                okLabel={t.inspectionPassed}
                badLabel={t.inspectionUnavailable}
              />
              <ConditionBadge
                ok={!car.has_recall || car.recall_fulfilled}
                okLabel={t.noOpenRecall}
                badLabel={t.hasOpenRecall}
              />
            </div>
          </section>

          {car.features?.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-bold text-ink border-r-4 border-steel pr-3 mb-6">
                {t.features}
              </h2>
              <div className="flex flex-wrap gap-2">
                {car.features.map((f, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-ink/5 border border-line px-3 py-1.5 text-sm text-ink"
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
            <div className="bg-ink dark:bg-steel rounded-2xl p-6 text-paper text-center">
              <p className="opacity-70 text-sm mb-2">{t.price}</p>
              <p className="font-display text-3xl font-bold" suppressHydrationWarning>
                {formatPrice(car.price_usd, currency, lang)}
              </p>
            </div>

            <div className="bg-ink/5 border border-line rounded-2xl p-6">
              {car.has_valuation && car.analysis && (
                <ValuationCard analysis={car.analysis} currency={currency} lang={lang} t={t} />
              )}

              <a
                href={buildWhatsAppLink({
                  brand: car.brand_name,
                  model: car.model_name,
                  year: car.year,
                  price: formatPrice(car.price_usd, currency, lang),
                  listingId: car.listing_id,
                  t,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl mt-4 mb-3 text-center transition-colors"
              >
                {t.requestQuote}
              </a>
              <ImportCostCalculator carPriceUsd={car.price_usd} lang={lang} />

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
  lang,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  mainPhoto: string | null;
  thumbs: string[];
  lang: Lang;
  children: React.ReactNode;
}) {
  const t = dictionary[lang].carDetailPage;
  const isRtl = lang === "ar";
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="bg-paper min-h-screen text-ink">
      <CarGallery
        title={title}
        badge={badge}
        subtitle={subtitle}
        mainPhoto={mainPhoto}
        thumbs={thumbs}
      />

      <div className="mx-auto max-w-6xl px-4 lg:px-8 pt-6">
        {badge && <p className="text-steel text-sm mb-1">{badge}</p>}
        <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="text-ink/60 text-sm mt-1">{subtitle}</p>}
      </div>

      <div className="mx-auto max-w-6xl px-4 lg:px-8 py-6">
        <Link
          href="/cars"
          className="mb-6 inline-block font-mono text-xs uppercase tracking-wide text-steel hover:underline"
        >
          {t.backToCars}
        </Link>
        {children}
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink/5 border border-line rounded-lg p-3 text-center">
      <p className="text-steel text-xs mb-1">{label}</p>
      <p className="font-bold text-sm text-ink">{value}</p>
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
  lang,
  t,
}: {
  analysis: ValuationAnalysis;
  currency: CurrencyCode;
  lang: Lang;
  t: typeof dictionary["ar"]["carDetailPage"] | typeof dictionary["en"]["carDetailPage"];
}) {
  return (
    <div className="border-b border-line pb-4 mb-4">
      <p className="font-mono text-[11px] uppercase tracking-wide text-steel">
        {t.marketAnalysis}
      </p>
      <p className="mt-1 font-display text-base font-semibold text-ink">
        {analysis.is_undervalued
          ? t.belowMarketAverage
          : enumLabel(analysis.price_status, lang) || t.marketMatch}
      </p>
      {typeof analysis.market_delta_pct === "number" && (
        <p className="mt-1 text-sm text-ink/70">
          {t.lowerByApprox} {Math.abs(analysis.market_delta_pct)}٪ {t.comparedToListings}
          {analysis.comparable_count
            ? ` (${t.comparedToCount} ${analysis.comparable_count} ${t.listingWord})`
            : ""}
          .
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
  t,
}: {
  brand: string;
  model: string;
  year: number;
  price: string;
  listingId?: string;
  t: typeof dictionary["ar"]["carDetailPage"] | typeof dictionary["en"]["carDetailPage"];
}): string {
  const lines = [
    t.whatsappQuoteTitle,
    `${t.whatsappVehicle} ${brand} ${model} (${year})`,
    `${t.whatsappPrice} ${price}`,
    listingId ? `${t.whatsappListingId} ${listingId}` : null,
  ].filter(Boolean);
  const message = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

function ManualCarDetail({
  car,
  currency,
  lang,
}: {
  car: any;
  currency: CurrencyCode;
  lang: Lang;
}) {
  const t = dictionary[lang].carDetailPage;

  const specTiles: [string, string | null | undefined][] = [
    [t.mileage, formatMileage(car.mileage, lang)],
    [t.fuelType, car.specs?.fuel],
    [t.transmission, car.specs?.transmission],
    [lang === "ar" ? "المحرك" : "Engine", car.specs?.engine],
  ];

  return (
    <MainLayout
      title={`${car.make} ${car.model}`}
      subtitle={String(car.year)}
      mainPhoto={car.images?.[0] || null}
      thumbs={car.images?.slice(0, 12) || []}
      lang={lang}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-display text-xl font-bold text-ink border-r-4 border-steel pr-3 mb-6">
              {t.details}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specTiles
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-ink/5 border border-line rounded-lg p-3 text-center"
                  >
                    <p className="text-steel text-xs mb-1">{label}</p>
                    <p className="font-bold text-sm text-ink">{value}</p>
                  </div>
                ))}
            </div>
          </section>

          {car.description && (
            <section>
              <h2 className="font-display text-xl font-bold text-ink border-r-4 border-steel pr-3 mb-6">
                {t.sellerNotes}
              </h2>
              <p className="whitespace-pre-line text-sm text-ink/80 bg-ink/5 border border-line rounded-lg p-4">
                {car.description}
              </p>
            </section>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <div className="bg-ink dark:bg-steel rounded-2xl p-6 text-paper text-center mb-4">
              <p className="opacity-70 text-sm mb-2">{t.price}</p>
              <p className="font-display text-3xl font-bold" suppressHydrationWarning>
                {formatPrice(car.price, currency, lang)}
              </p>
            </div>
            <a
              href={buildWhatsAppLink({
                brand: car.make,
                model: car.model,
                year: car.year,
                price: formatPrice(car.price, currency, lang),
                t,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl text-center transition-colors"
            >
              {t.requestQuote}
            </a>
            <ImportCostCalculator carPriceUsd={car.price} lang={lang} />

          </div>
        </div>
      </div>
    </MainLayout >
  );
}