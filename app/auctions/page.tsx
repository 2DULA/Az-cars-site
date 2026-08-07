import Link from "next/link";
import { cookies } from "next/headers";
import AuctionCard from "@/app/components/AuctionCard";
import AuctionFilters from "@/app/components/AuctionFilters";
import { createClient } from "@/lib/supabase/server";
import { dictionary } from "@/lib/i18n/dictionary";
import { translateSearchTerm } from "@/lib/carBrandTranslations";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مزادات السيارات الكورية | معرض العز",
  description:
    "تصفح أحدث مزادات السيارات الكورية — عروض حية من المزادات المحلية مع تقارير فحص كاملة.",
};

export interface AuctionListing {
    source_id: string;
    brand: string | null;
    model: string | null;
    model_display: string | null;
    model_ko: string | null;
    fuel: string | null;
    transmission: string | null;
    start_amt: number | null;
    mileage_km: number | null;
    year: number | null;
    auction_date: string | null;
    auction_start_at: string | null;
    accident_tag: string | null;
    inspection_grade: string | null;
    image_url: string | null;
}

const PAGE_SIZE = 20;

type SearchParams = {
    page?: string;
    search?: string;
    brand?: string;
    fuel?: string;
    transmission?: string;
    min_year?: string;
    max_year?: string;
    min_price?: string; // assumed to arrive already in KRW; see note below
    max_price?: string;
    has_accident?: string; // "false" means "no accident only"
    inspection_passed?: string; // "true" means only AA/A-grade, adjust as needed
};

function buildPageUrl(sp: SearchParams, page: number): string {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (sp.brand) params.set("brand", sp.brand);
    if (sp.fuel) params.set("fuel", sp.fuel);
    if (sp.transmission) params.set("transmission", sp.transmission);
    if (sp.min_year) params.set("min_year", sp.min_year);
    if (sp.max_year) params.set("max_year", sp.max_year);
    if (sp.min_price) params.set("min_price", sp.min_price);
    if (sp.max_price) params.set("max_price", sp.max_price);
    if (sp.has_accident) params.set("has_accident", sp.has_accident);
    if (sp.inspection_passed) params.set("inspection_passed", sp.inspection_passed);
    params.set("page", String(page));
    return `/auctions?${params.toString()}`;
}

export default async function AuctionsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const sp = await searchParams;
    const currentPage = Math.max(1, Number(sp.page) || 1);
    const supabase = await createClient();

    const cookieStore = await cookies();
    const lang = (cookieStore.get("lang")?.value === "en" ? "en" : "ar") as
        | "ar"
        | "en";
    const t = dictionary[lang].auctionsPage;
    const isRtl = lang === "ar";

    // Base query: active auction cars, primary image joined in.
    let query = supabase
        .from("cars")
        .select(
            `source_id, brand, model, model_display, model_ko, fuel, transmission,
       start_amt, mileage_km, year, auction_date, auction_start_at,
       accident_tag, inspection_grade, thumbnail_url`,
            { count: "exact" }
        )
        .eq("source", "auction")
        .eq("status", "active");

    if (sp.search) {
        const q = translateSearchTerm(sp.search.trim());
        query = query.or(`model.ilike.%${q}%,model_ko.ilike.%${q}%,brand.ilike.%${q}%`);
    }
    if (sp.brand) query = query.eq("brand", sp.brand);
    if (sp.fuel) query = query.eq("fuel", sp.fuel);
    if (sp.transmission) query = query.eq("transmission", sp.transmission);
    if (sp.min_year) query = query.gte("year", Number(sp.min_year));
    if (sp.max_year) query = query.lte("year", Number(sp.max_year));

    // NOTE: min_price/max_price are assumed to already be in KRW here.
    // If your filter inputs collect a different currency (e.g. SAR, since
    // the UI label says "السعر (ريال سعودي)"), convert to KRW with the
    // same rate your price transformer uses BEFORE this point -- otherwise
    // this filters against the wrong scale entirely.
    if (sp.min_price) query = query.gte("start_amt", Number(sp.min_price));
    if (sp.max_price) query = query.lte("start_amt", Number(sp.max_price));

    if (sp.has_accident === "false") {
        query = query.or("accident_tag.is.null,accident_tag.eq.");
    }
    if (sp.inspection_passed === "true") {
        query = query.in("inspection_grade", ["A", "AA"]); // adjust grade set as needed
    }

    const start = (currentPage - 1) * PAGE_SIZE;
    query = query.order("auction_start_at", { ascending: true }).range(start, start + PAGE_SIZE - 1);

    const { data, count, error } = await query;

    if (error) {
        console.error("Failed to load auctions:", error);
    }

    const listings: AuctionListing[] = (data || []).map((row: any) => ({
        source_id: row.source_id,
        brand: row.brand,
        model: row.model,
        model_display: row.model_display,
        model_ko: row.model_ko,
        fuel: row.fuel,
        transmission: row.transmission,
        start_amt: row.start_amt,
        mileage_km: row.mileage_km,
        year: row.year,
        auction_date: row.auction_date,
        auction_start_at: row.auction_start_at,
        accident_tag: row.accident_tag,
        inspection_grade: row.inspection_grade,
        image_url: row.thumbnail_url ?? null,
    }));

    const totalCount = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    // Filter option lists (brand/fuel/transmission) now come from a small
    // distinct-values query instead of scanning the full in-memory array.
    const { data: filterOptionsRaw } = await supabase
        .from("cars")
        .select("brand, fuel, transmission")
        .eq("source", "auction")
        .eq("status", "active");

    const brandOptions = Array.from(
        new Set((filterOptionsRaw || []).map((r) => r.brand).filter(Boolean))
    ).sort() as string[];
    const fuelOptions = Array.from(
        new Set((filterOptionsRaw || []).map((r) => r.fuel).filter(Boolean))
    ).sort() as string[];
    const transmissionOptions = Array.from(
        new Set((filterOptionsRaw || []).map((r) => r.transmission).filter(Boolean))
    ).sort() as string[];

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8" dir={isRtl ? "rtl" : "ltr"}>
            <div className="mb-8 flex items-end justify-between border-b border-line pb-6">
                <div>
                    <p className="font-mono text-xs uppercase tracking-wide text-steel">
                        {t.badge}
                    </p>
                    <h1 className="font-display text-3xl font-bold">
                        {t.title}
                    </h1>
                </div>
                <p className="font-mono text-sm text-ink/60">{totalCount} {t.countSuffix}</p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row">
                <AuctionFilters
                    brandOptions={brandOptions}
                    fuelOptions={fuelOptions}
                    transmissionOptions={transmissionOptions}
                />

                <section className="flex-1">
                    {listings.length === 0 ? (
                        <div className="border border-line bg-paper p-10 text-center">
                            <p className="font-display text-lg font-semibold text-ink">
                                {t.noResultsTitle}
                            </p>
                            <p className="mt-1 text-sm text-ink/60">
                                {t.noResultsBody}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {listings.map((car) => {
                                    const internalDetailsUrl = `/auctions/details?id=${car.source_id}`;
                                    return (
                                        <AuctionCard key={car.source_id} car={car} url={internalDetailsUrl} />
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-4">
                                {currentPage > 1 && (
                                    <Link
                                        href={buildPageUrl(sp, currentPage - 1)}
                                        className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-wide hover:bg-ink hover:text-paper"
                                    >
                                        {t.previous}
                                    </Link>
                                )}
                                <span className="font-mono text-sm text-ink/60">
                                    {t.pageLabel} {currentPage} {t.ofLabel} {totalPages}
                                </span>
                                {currentPage < totalPages && (
                                    <Link
                                        href={buildPageUrl(sp, currentPage + 1)}
                                        className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-wide hover:bg-ink hover:text-paper"
                                    >
                                        {t.next}
                                    </Link>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}
