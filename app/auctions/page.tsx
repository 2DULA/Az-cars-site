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

export default async function AuctionsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; fuel?: string; transmission?: string }>;
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
        if (sp.fuel) {
            if (!(car.fuel || "").includes(sp.fuel.trim())) return false;
        }
        if (sp.transmission) {
            if (!(car.transmission || "").includes(sp.transmission.trim())) return false;
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
                <AuctionFilters />

                <section className="flex-1">
                    {listings.length === 0 ? (
                        <div className="border border-line bg-white p-10 text-center">
                            <p className="font-display text-lg font-semibold">
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
                                        href={`/auctions?page=${currentPage - 1}`}
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
                                        href={`/auctions?page=${currentPage + 1}`}
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