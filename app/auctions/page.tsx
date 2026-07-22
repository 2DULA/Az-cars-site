import fs from "fs";
import path from "path";
import Link from "next/link";
import AuctionCard from "@/app/components/AuctionCard";
import AuctionFilters from "@/app/components/AuctionFilters";

interface AuctionListing {
    url: string;
    brand: string | null;
    model: string | null;
    trim: string | null;
    fuel: string | null;
    price_krw: string | null;
    mileage: string | null;
    transmission: string | null;
    engine: string | null;
    image: string | null;
    auction_date: string | null;
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
    min_price?: string;
    max_price?: string;
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

    const filePath = path.join(process.cwd(), "scraper", "auctions.json");
    const allListings: AuctionListing[] = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
        : [];

    const filtered = allListings.filter((car) => {
        if (sp.search) {
            const q = sp.search.trim();
            const haystack = `${car.brand || ""} ${car.model || ""} ${car.trim || ""}`;
            if (!haystack.includes(q)) return false;
        }
        if (sp.brand && car.brand !== sp.brand) return false;
        if (sp.fuel && car.fuel !== sp.fuel) return false;
        if (sp.transmission && car.transmission !== sp.transmission) return false;

        if (sp.min_year || sp.max_year) {
            const yearMatch = (car.trim || "").match(/\b(19|20)\d{2}\b/);
            const year = yearMatch ? Number(yearMatch[0]) : null;
            if (sp.min_year && (!year || year < Number(sp.min_year))) return false;
            if (sp.max_year && (!year || year > Number(sp.max_year))) return false;
        }

        if (sp.min_price || sp.max_price) {
            const usd = car.price_krw ? Number(car.price_krw) * 0.00077 * 3.75 : 0;
            if (sp.min_price && usd < Number(sp.min_price)) return false;
            if (sp.max_price && usd > Number(sp.max_price)) return false;
        }

        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const start = (currentPage - 1) * PAGE_SIZE;
    const listings = filtered.slice(start, start + PAGE_SIZE);

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8" dir="rtl">
            <div className="mb-8 flex items-end justify-between border-b border-line pb-6">
                <div>
                    <p className="font-mono text-xs uppercase tracking-wide text-steel">
                        المزادات
                    </p>
                    <h1 className="font-display text-3xl font-bold">
                        مزادات السيارات الكورية
                    </h1>
                </div>
                <p className="font-mono text-sm text-ink/60">
                    {filtered.length} سيارة في المزاد
                </p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row">
                <AuctionFilters allListings={allListings} />

                <section className="flex-1">
                    {listings.length === 0 ? (
                        <div className="border border-line bg-paper p-10 text-center">
                            <p className="font-display text-lg font-semibold text-ink">
                                لا توجد سيارات مطابقة
                            </p>
                            <p className="mt-1 text-sm text-ink/60">
                                جرّب تعديل الفلاتر أو تشغيل السكربت لتحديث البيانات.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {listings.map((car, i) => {
                                    const internalDetailsUrl = `/auctions/details?targetUrl=${encodeURIComponent(
                                        car.url
                                    )}`;
                                    return (
                                        <AuctionCard key={i} car={car} url={internalDetailsUrl} />
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-4">
                                {currentPage > 1 && (
                                    <Link
                                        href={buildPageUrl(sp, currentPage - 1)}
                                        className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-wide hover:bg-ink hover:text-paper"
                                    >
                                        → السابق
                                    </Link>
                                )}
                                <span className="font-mono text-sm text-ink/60">
                                    صفحة {currentPage} من {totalPages}
                                </span>
                                {currentPage < totalPages && (
                                    <Link
                                        href={buildPageUrl(sp, currentPage + 1)}
                                        className="border border-ink px-4 py-2 font-mono text-xs uppercase tracking-wide hover:bg-ink hover:text-paper"
                                    >
                                        التالي ←
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
