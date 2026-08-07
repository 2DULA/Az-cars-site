"use client";

import { useState } from "react";
import { dictionary } from "@/lib/i18n/dictionary";
import { formatPrice, krwToUsd } from "@/lib/format";
import { useCurrency } from "@/lib/currency/CurrencyContext";
import ImportCostCalculator from "@/app/components/ImportCostCalculator";

const WHATSAPP_NUMBER = "966502650283";

interface CarRow {
    id: string;
    source_id: string;
    brand: string | null;
    model: string | null;
    model_display: string | null;
    vin: string | null;
    color: string | null;
    body_type: string | null;
    fuel: string | null;
    transmission: string | null;
    mileage_km: number | null;
    start_amt: number | null;
    bid_succ_amt: number | null;
    auction_start_at: string | null;
    inspection_grade: string | null;
    accident_tag: string | null;
    accident_descr: string | null;
}

interface CarImage {
    file_url: string | null;
    thumb_url: string | null;
    sort_order: number;
}

interface CarOption {
    ct_dtl_id: string | null;
    name_ko: string | null;
    icon_url: string | null;
}

interface CarElectricPart {
    ct_dtl_id: string | null;
    name_ko: string | null;
    status_ko: string | null;
}

interface CarPerformanceItem {
    category_ct_id: string | null;
    category_name_ko: string | null;
    ct_dtl_id: string | null;
    item_name_ko: string | null;
    status_ko: string | null;
}

interface CarInspectorNote {
    note_type: string | null;
    note_text: string | null;
}

interface CarFrameCriteria {
    car_frame_id: string;
    frame_eval_type: string | null;
    perf_frame_criteria: string | null;
}

interface FrameLayoutPart {
    car_frame_id: string;
    frame_name_ko: string | null;
    frame_name_en: string | null;
    frame_name_ar: string | null;
    diagram_image_url: string | null;
    x_point: number | null;
    y_point: number | null;
    width: number | null;
    height: number | null;
}

interface FrameLegendEntry {
    code: string;
    label_ko: string | null;
    label_en: string | null;
    label_ar: string | null;
}

interface CatalogEntry {
    name_ko: string | null;
    name_en: string | null;
    name_ar: string | null;
}

function useCountdown(target: string | null) {
    const [remaining, setRemaining] = useState<number>(() =>
        target ? Math.max(0, new Date(target).getTime() - Date.now()) : 0
    );

    if (typeof window !== "undefined" && target) {
        setTimeout(() => {
            setRemaining(Math.max(0, new Date(target).getTime() - Date.now()));
        }, 1000);
    }

    const total = Math.floor(remaining / 1000);
    const days = String(Math.floor(total / 86400)).padStart(2, "0");
    const hours = String(Math.floor((total % 86400) / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");

    return { days, hours, minutes, expired: remaining <= 0 };
}

export default function CarDetailsView({
    car,
    images,
    options,
    electricParts,
    performanceItems,
    inspectorNotes,
    frameCriteria,
    frameLayoutParts,
    frameLegend,
    optionCatalog,
    electricPartCatalog,
    performanceItemCatalog,
    performanceCategoryCatalog,
    diagramBaseUrl,
    lang,
    isRtl,
    dynamicTranslations,
}: {
    car: CarRow;
    images: CarImage[];
    options: CarOption[];
    electricParts: CarElectricPart[];
    performanceItems: CarPerformanceItem[];
    inspectorNotes: CarInspectorNote[];
    frameCriteria: CarFrameCriteria[];
    frameLayoutParts: FrameLayoutPart[];
    frameLegend: FrameLegendEntry[];
    optionCatalog: (CatalogEntry & { ct_dtl_id: string })[];
    electricPartCatalog: (CatalogEntry & { ct_dtl_id: string })[];
    performanceItemCatalog: (CatalogEntry & { ct_dtl_id: string })[];
    performanceCategoryCatalog: (CatalogEntry & { ct_id: string })[];
    diagramBaseUrl: string | null;
    lang: "ar" | "en";
    isRtl: boolean;
    dynamicTranslations: Record<string, string>;
}) {
    const t = dictionary[lang].auctionDetailsPage;
    const { currency } = useCurrency();
    const [activeImage, setActiveImage] = useState<string | null>(
        images[0]?.file_url ?? null
    );
    const countdown = useCountdown(car.auction_start_at);

    const legendByCode = Object.fromEntries(frameLegend.map((l) => [l.code, l]));
    const partByFrameId = Object.fromEntries(frameLayoutParts.map((p) => [p.car_frame_id, p]));
    const optionNameById = Object.fromEntries(optionCatalog.map((o) => [o.ct_dtl_id, o]));
    const electricPartNameById = Object.fromEntries(
        electricPartCatalog.map((e) => [e.ct_dtl_id, e])
    );
    const perfItemNameById = Object.fromEntries(
        performanceItemCatalog.map((p) => [p.ct_dtl_id, p])
    );
    const perfCategoryNameById = Object.fromEntries(
        performanceCategoryCatalog.map((c) => [c.ct_id, c])
    );

    function catalogName(entry: CatalogEntry | null | undefined, fallback: string | null) {
        if (!entry) return fallback;
        if (lang === "ar") return entry.name_ar || entry.name_en || fallback;
        return entry.name_en || fallback;
    }

    function legendLabel(legend: FrameLegendEntry | null | undefined, fallback: string | null) {
        if (!legend) return fallback;
        if (lang === "ar") return legend.label_ar || legend.label_en || fallback;
        return legend.label_en || fallback;
    }

    function framePartName(part: FrameLayoutPart | null | undefined, fallback: string) {
        if (!part) return fallback;
        if (lang === "ar") return part.frame_name_ar || part.frame_name_en || fallback;
        return part.frame_name_en || fallback;
    }

    function dynamicText(ko: string | null) {
        if (!ko) return ko;
        return dynamicTranslations[ko] || ko;
    }

    function handleWhatsAppInquiry() {
        const lines = [
            t.whatsappTitle,
            `${t.whatsappModel} ${car.model_display || car.model || "—"}`,
            `${t.whatsappBrand} ${car.brand || "—"}`,
            `${t.whatsappVin} ${car.vin || "—"}`,
            `${t.whatsappPartNumber} ${car.source_id}`,
        ];
        const message = encodeURIComponent(lines.join("\n"));
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    }

    const displayPrice = car.bid_succ_amt ?? car.start_amt;

    return (
        <main dir={isRtl ? "rtl" : "ltr"} className="bg-paper">
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-ink overflow-hidden">
                {activeImage ? (
                    <img
                        src={`/api/image-proxy?url=${encodeURIComponent(activeImage)}`}
                        alt="Car Main View"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-paper/40 font-mono">
                        {t.noImages}
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {images.length > 0 && (
                <div className="mx-auto max-w-6xl px-4 lg:px-8 -mt-8 relative z-10">
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar bg-ink/5 border border-line rounded-xl p-3 shadow-sm">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(img.file_url)}
                                className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img.file_url
                                    ? "border-steel opacity-100"
                                    : "border-transparent opacity-50 hover:opacity-100"
                                    }`}
                            >
                                {img.thumb_url && (
                                    <img
                                        src={`/api/image-proxy?url=${encodeURIComponent(img.thumb_url)}`}
                                        className="w-full h-full object-cover"
                                        alt={`Thumbnail ${idx + 1}`}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-6xl px-4 lg:px-8 pt-6">
                <p className="text-steel text-sm mb-1">{car.brand || "—"}</p>
                <h1 className="font-display text-3xl font-bold text-ink">
                    {car.model_display || car.model || "—"}
                </h1>
            </div>

            <div className="mx-auto max-w-6xl px-4 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="font-display text-xl font-bold text-ink border-r-4 border-steel pr-3 mb-6">
                                {t.specs}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    [t.vin, car.vin],
                                    [t.color, car.color],
                                    [t.bodyType, car.body_type],
                                    [t.fuel, car.fuel],
                                    [t.transmission, car.transmission],
                                    [t.inspectionGrade, car.inspection_grade],
                                ]
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

                        {options.length > 0 && (
                            <section>
                                <h2 className="font-display text-xl font-bold text-ink border-r-4 border-steel pr-3 mb-6">
                                    {t.equipment}
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {options.map((o, idx) => {
                                        const catalogEntry = o.ct_dtl_id ? optionNameById[o.ct_dtl_id] : null;
                                        return (
                                            <span
                                                key={idx}
                                                className="rounded-full bg-ink/5 border border-line px-3 py-1.5 text-sm text-ink"
                                            >
                                                {catalogName(catalogEntry, o.name_ko)}
                                            </span>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {frameCriteria.length > 0 && diagramBaseUrl && (
                            <section>
                                <h2 className="font-display text-xl font-bold text-ink border-r-4 border-steel pr-3 mb-6">
                                    {t.frameDiagram}
                                </h2>
                                <div className="relative mx-auto w-full max-w-xl bg-ink/5 border border-line rounded-lg overflow-hidden">
                                    <img
                                        src={`/api/image-proxy?url=${encodeURIComponent(diagramBaseUrl)}`}
                                        alt="Car diagram base"
                                        className="w-full h-auto block"
                                    />
                                    {frameCriteria.map((point, idx) => {
                                        const part = partByFrameId[point.car_frame_id];
                                        if (!part?.diagram_image_url) return null;
                                        return (
                                            <img
                                                key={idx}
                                                src={`/api/image-proxy?url=${encodeURIComponent(part.diagram_image_url)}`}
                                                alt=""
                                                className="absolute inset-0 w-full h-full"
                                                style={{
                                                    filter:
                                                        "invert(21%) sepia(90%) saturate(3000%) hue-rotate(340deg) brightness(95%)",
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-3 justify-center text-xs text-ink/60">
                                    {frameLegend.map((l) => (
                                        <span key={l.code} className="flex items-center gap-1">
                                            <span className="font-mono font-bold">{l.code}</span>
                                            {legendLabel(l, l.label_ko)}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {frameCriteria.length > 0 && (
                            <section>
                                <h2 className="font-display text-xl font-bold text-ink border-r-4 border-steel pr-3 mb-6">
                                    {t.inspectionPoints}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {frameCriteria.map((point, idx) => {
                                        const part = partByFrameId[point.car_frame_id];
                                        const legend = point.perf_frame_criteria
                                            ? legendByCode[point.perf_frame_criteria]
                                            : null;
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between bg-ink/5 border border-line rounded-lg px-4 py-3"
                                            >
                                                <span className="font-medium text-sm text-ink">
                                                    {framePartName(part, point.car_frame_id)}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-full px-2.5 py-1 text-xs font-bold bg-amber/20 text-amber">
                                                        {legendLabel(legend, point.perf_frame_criteria)}
                                                    </span>
                                                    <span className="rounded bg-ink/10 px-2 py-1 font-mono text-xs font-bold text-ink/70">
                                                        {point.perf_frame_criteria}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {electricParts.length > 0 && (
                            <section>
                                <h2 className="font-display text-xl font-bold text-ink border-r-4 border-steel pr-3 mb-6">
                                    {t.electricParts}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {electricParts.map((e, idx) => {
                                        const catalogEntry = e.ct_dtl_id
                                            ? electricPartNameById[e.ct_dtl_id]
                                            : null;
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between bg-ink/5 border border-line rounded-lg px-4 py-3"
                                            >
                                                <span className="font-medium text-sm text-ink">
                                                    {catalogName(catalogEntry, e.name_ko)}
                                                </span>
                                                <span className="text-sm text-ink/70">
                                                    {dynamicText(e.status_ko)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {performanceItems.length > 0 && (
                            <section>
                                <h2 className="font-display text-xl font-bold text-ink border-r-4 border-steel pr-3 mb-6">
                                    {t.mechanicalInspection}
                                </h2>
                                <div className="space-y-2">
                                    {performanceItems.map((item, idx) => {
                                        const catEntry = item.category_ct_id
                                            ? perfCategoryNameById[item.category_ct_id]
                                            : null;
                                        const itemEntry = item.ct_dtl_id
                                            ? perfItemNameById[item.ct_dtl_id]
                                            : null;
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between bg-ink/5 border border-line rounded-lg px-4 py-3"
                                            >
                                                <div>
                                                    <p className="text-xs text-steel">
                                                        {catalogName(catEntry, item.category_name_ko)}
                                                    </p>
                                                    <p className="font-medium text-sm text-ink">
                                                        {catalogName(itemEntry, item.item_name_ko)}
                                                    </p>
                                                </div>
                                                <span className="text-sm text-ink/70">
                                                    {dynamicText(item.status_ko)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {inspectorNotes.length > 0 && (
                            <section>
                                <h2 className="font-display text-xl font-bold text-ink border-r-4 border-steel pr-3 mb-6">
                                    {t.inspectorNotes}
                                </h2>
                                {inspectorNotes.map((n, idx) => (
                                    <p
                                        key={idx}
                                        className="whitespace-pre-line text-sm text-ink/80 bg-ink/5 border border-line rounded-lg p-4"
                                    >
                                        {dynamicText(n.note_text)}
                                    </p>
                                ))}
                            </section>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-6 space-y-4">
                            <div className="bg-ink dark:bg-steel rounded-2xl p-6" suppressHydrationWarning>
                                <p className="text-paper/60 text-sm text-center mb-4">{t.auctionEndsIn}</p>
                                {countdown.expired ? (
                                    <p className="text-center font-bold text-lg text-paper">{t.auctionEnded}</p>
                                ) : (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="text-center">
                                            <p className="font-display text-3xl font-bold text-paper">
                                                {countdown.days}
                                            </p>
                                            <p className="text-[11px] text-paper/60 mt-1">{t.days}</p>
                                        </div>
                                        <span className="text-2xl font-bold text-paper/30">:</span>
                                        <div className="text-center">
                                            <p className="font-display text-3xl font-bold text-paper">
                                                {countdown.hours}
                                            </p>
                                            <p className="text-[11px] text-paper/60 mt-1">{t.hours}</p>
                                        </div>
                                        <span className="text-2xl font-bold text-paper/30">:</span>
                                        <div className="text-center">
                                            <p className="font-display text-3xl font-bold text-paper">
                                                {countdown.minutes}
                                            </p>
                                            <p className="text-[11px] text-paper/60 mt-1">{t.minutes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-ink/5 border border-line rounded-2xl p-6">
                                <p className="text-steel text-sm mb-1">{t.partNumber}</p>
                                <p className="font-mono text-sm font-bold text-ink mb-5">
                                    {car.vin || car.source_id}
                                </p>

                                <div className="bg-paper border border-line rounded-xl p-4 text-center mb-5">
                                    <p className="text-steel text-sm mb-1">
                                        {car.bid_succ_amt ? t.finalPrice : t.startingPrice}
                                    </p>
                                    <p className="font-display text-2xl font-bold text-ink">
                                        {displayPrice ? formatPrice(krwToUsd(displayPrice * 10000), currency, lang) : "—"}
                                    </p>
                                </div>

                                {car.mileage_km !== null && (
                                    <div className="flex items-center justify-between border-b border-line py-3">
                                        <span className="text-steel text-sm">{t.mileage}</span>
                                        <span className="font-bold text-ink">
                                            {car.mileage_km.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                {car.transmission && (
                                    <div className="flex items-center justify-between border-b border-line py-3">
                                        <span className="text-steel text-sm">{t.transmission}</span>
                                        <span className="font-bold text-ink">{car.transmission}</span>
                                    </div>
                                )}
                                {car.fuel && (
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-steel text-sm">{t.fuel}</span>
                                        <span className="font-bold text-ink">{car.fuel}</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleWhatsAppInquiry}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl mt-6 mb-3 transition-colors"
                                >
                                    {t.whatsappInquiry}
                                </button>
                                <ImportCostCalculator
                                    carPriceUsd={
                                        car.bid_succ_amt
                                            ? krwToUsd(car.bid_succ_amt * 10000)
                                            : krwToUsd((car.start_amt ?? 0) * 10000)
                                    }
                                    lang={lang}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}