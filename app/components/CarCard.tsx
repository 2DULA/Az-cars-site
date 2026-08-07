"use client";

import Link from "next/link";
import type { VehicleSummary } from "@/lib/types";
import { formatPrice, formatMileage } from "@/lib/format";
import { proxiedImage } from "@/lib/proxiedImage";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCurrency } from "@/lib/currency/CurrencyContext";
import { CheckCircle2, AlertTriangle, Gauge, ShieldAlert } from "lucide-react";

const STRINGS = {
  ar: {
    verified: "موثّقة",
    belowMarket: "أقل من سعر السوق",
    hasAccident: "بها حادث",
    price: "السعر",
    noPhoto: "لا توجد صورة",
  },
  en: {
    verified: "Verified",
    belowMarket: "Below market",
    hasAccident: "Accident",
    price: "Price",
    noPhoto: "No photo",
  },
};

export default function CarCard({ car }: { car: VehicleSummary }) {
  const { lang } = useLanguage();
  const { currency } = useCurrency();
  const s = STRINGS[lang];
  const badge = car.analysis?.is_undervalued ? s.belowMarket : null;

  return (
    <Link
      href={`/cars/${car.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-steel hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper">
        {car.thumb?.url ? (
          <>
            <img
              src={
                car.thumb.url.startsWith("/uploads/")
                  ? car.thumb.url
                  : proxiedImage(car.thumb.url)
              }
              alt={`${car.brand_name} ${car.model_name}`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <div className="hidden h-full w-full items-center justify-center font-mono text-sm text-ink/40">
              {s.noPhoto}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-sm text-ink/40">
            {s.noPhoto}
          </div>
        )}

        <div className="absolute start-3 top-3 flex flex-wrap gap-2">
          {car.is_verified && (
            <span className="flex items-center gap-1 rounded-full bg-green-500/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
              <CheckCircle2 size={14} />
              {s.verified}
            </span>
          )}
          {badge && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
              <AlertTriangle size={14} />
              {badge}
            </span>
          )}
        </div>

        {car.has_accident && (
          <span className="absolute end-3 top-3 flex items-center gap-1 rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
            <ShieldAlert size={14} />
            {s.hasAccident}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-wide text-steel">
            {car.source_code}
          </p>
          <span className="shrink-0 rounded-md bg-line/30 px-2 py-1 font-mono text-xs font-semibold text-steel">
            {car.year}
          </span>
        </div>

        <h3 className="font-display text-xl font-bold leading-tight text-ink line-clamp-1">
          {car.brand_name} {car.model_name}
        </h3>
        {car.trim && <p className="mt-1 text-sm text-ink/60 line-clamp-1">{car.trim}</p>}

        <div className="my-4 flex items-center gap-4 border-y border-line py-3 text-sm text-ink/75">
          <div className="flex items-center gap-1.5">
            <Gauge size={16} className="text-steel" />
            <span className="font-mono">{formatMileage(car.mileage, lang)}</span>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <p className="text-sm font-medium text-ink/60">{s.price}</p>
          <span className="font-display text-2xl font-bold text-ink" suppressHydrationWarning>
            {formatPrice(car.price_usd, currency, lang)}
          </span>
        </div>
      </div>
    </Link>
  );
}
