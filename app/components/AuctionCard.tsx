"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, krwToUsd, formatMileage } from "@/lib/format";
import { useCurrency } from "@/lib/currency/CurrencyContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Gauge, Fuel, Clock, Gavel } from "lucide-react";
import type { AuctionListing } from "@/app/auctions/page";

const STRINGS = {
    ar: {
        noImage: "لا توجد صورة",
        auction: "مزاد",
        ended: "انتهى",
        price: "السعر",
    },
    en: {
        noImage: "No image",
        auction: "Auction",
        ended: "Ended",
        price: "Price",
    },
};

function useCountdown(target: string | null, endedLabel: string) {
    const [remaining, setRemaining] = useState(0);
    useEffect(() => {
        if (!target) return;
        const t = new Date(target).getTime();
        const tick = () => setRemaining(Math.max(0, t - Date.now()));
        tick();
        const i = setInterval(tick, 1000);
        return () => clearInterval(i);
    }, [target]);
    const s = Math.floor(remaining / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return remaining > 0 ? `${h}:${m}:${sec}` : endedLabel;
}

export default function AuctionCard({
    car,
    url,
}: {
    car: AuctionListing;
    url: string;
}) {
    const { currency } = useCurrency();
    const { lang } = useLanguage();
    const t = STRINGS[lang];
    // start_amt is stored as raw "man-won" units (x10,000 KRW) straight
    // from the auction API -- multiply back to real KRW, then convert
    // to USD before handing off to formatPrice.
    const usdEquivalent = car.start_amt ? krwToUsd(car.start_amt * 10000) : 0;
    const countdown = useCountdown(car.auction_start_at, t.ended);
    const mileageDisplay = car.mileage_km !== null ? formatMileage(car.mileage_km, lang) : null;

    return (
        <Link
            href={url}
            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-steel hover:shadow-md"
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper">
                {car.image_url ? (
                    <img
                        src={`/api/image-proxy?url=${encodeURIComponent(car.image_url)}`}
                        alt={`${car.brand} ${car.model}`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center font-mono text-sm text-ink/40">
                        {t.noImage}
                    </div>
                )}

                <div className="absolute start-3 top-3 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                        <Gavel size={14} />
                        {t.auction}
                    </span>
                </div>

                {car.auction_start_at && (
                    <div
                        className="absolute bottom-3 start-3 flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1.5 font-mono text-xs text-white"
                        suppressHydrationWarning
                    >
                        <Clock size={12} />
                        {countdown}
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center justify-between">
                    <p className="font-mono text-xs uppercase tracking-wide text-steel">
                        {car.brand}
                    </p>
                    {car.fuel && (
                        <span className="shrink-0 rounded-md bg-line/30 px-2 py-1 font-mono text-xs font-semibold text-steel">
                            {car.fuel}
                        </span>
                    )}
                </div>

                <h3 className="font-display text-xl font-bold leading-tight text-ink line-clamp-1">
                    {car.model_display || car.model}
                </h3>
                {car.year && (
                    <p className="mt-1 text-sm text-ink/60 line-clamp-1">{car.year}</p>
                )}

                <div className="my-4 flex items-center gap-4 border-y border-line py-3 text-sm text-ink/75">
                    {mileageDisplay && (
                        <div className="flex items-center gap-1.5">
                            <Gauge size={16} className="text-steel" />
                            <span className="font-mono">{mileageDisplay}</span>
                        </div>
                    )}
                    {car.transmission && (
                        <div className="flex items-center gap-1.5">
                            <Fuel size={16} className="text-steel" />
                            <span className="font-mono">{car.transmission}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto flex items-end justify-between">
                    <p className="text-sm font-medium text-ink/60">{t.price}</p>
                    <span
                        className="font-display text-2xl font-bold text-ink"
                        suppressHydrationWarning
                    >
                        {formatPrice(usdEquivalent, currency, lang)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
