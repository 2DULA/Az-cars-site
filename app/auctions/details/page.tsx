"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface LiveDetails {
    images: string[];
    inspectionImg: string;
    specs: Record<string, string>;
    auctionDate: string | null;
    inspectionPoints: { part: string; code: string; status: string }[];
}

function useCountdown(target: string | null) {
    const [remaining, setRemaining] = useState<number>(0);

    useEffect(() => {
        if (!target) return;
        const targetTime = new Date(target).getTime();

        const tick = () => setRemaining(Math.max(0, targetTime - Date.now()));
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [target]);

    const total = Math.floor(remaining / 1000);
    const days = String(Math.floor(total / 86400)).padStart(2, "0");
    const hours = String(Math.floor((total % 86400) / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const seconds = String(total % 60).padStart(2, "0");

    return { days, hours, minutes, seconds, expired: remaining <= 0 };
}

function SpecRow({ label, value }: { label: string; value?: string }) {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between border-b border-line py-3 last:border-0">
            <span className="text-steel text-sm">{label}</span>
            <span className="font-bold">{value}</span>
        </div>
    );
}

function CountdownUnit({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <p className="font-display text-3xl font-bold">{value}</p>
            <p className="text-[11px] text-white/60 mt-1">{label}</p>
        </div>
    );
}

function CarDetailsContent() {
    const searchParams = useSearchParams();
    const targetUrl = searchParams.get("targetUrl");

    const [data, setData] = useState<LiveDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    useEffect(() => {
        if (!targetUrl) {
            setLoading(false);
            return;
        }

        fetch(`/api/scrape-details?targetUrl=${encodeURIComponent(targetUrl)}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((resData) => {
                setData(resData);
                if (resData.images && resData.images.length > 0) {
                    setActiveImage(resData.images[0]);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching details:", error);
                setLoading(false);
            });
    }, [targetUrl]);

    const countdown = useCountdown(data?.auctionDate || null);

    if (loading) return <div className="p-10 text-center font-display text-xl">جاري تحميل بيانات الفحص والملفات...</div>;

    if (!targetUrl) return <div className="p-10 text-center text-red-500 font-bold">عذراً، الرابط غير مكتمل. يرجى العودة للصفحة السابقة واختيار سيارة.</div>;

    if (!data) return <div className="p-10 text-center text-red-500">حدث خطأ أثناء تحميل التفاصيل.</div>;

    return (
        <main dir="rtl" className="bg-paper">
            {/* Full-bleed hero */}
            <div className="relative w-full aspect-[21/9] bg-ink overflow-hidden">
                {activeImage ? (
                    <img
                        src={`/api/image-proxy?url=${encodeURIComponent(activeImage)}`}
                        alt="Car Main View"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-white/40 font-mono">لا توجد صور متوفرة</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />

                <div className="absolute bottom-0 right-0 p-6 sm:p-10 text-white">
                    <p className="text-white/70 text-sm">{data.specs?.["الشركة المصنعة"] || "—"}</p>
                    <h1 className="font-display text-4xl sm:text-5xl font-bold mt-1">
                        {data.specs?.["الموديل"] || "—"}
                    </h1>
                    <p className="text-white/60 text-sm mt-2">
                        {[data.specs?.["المميزات"], data.specs?.["سنة الصنع"]].filter(Boolean).join(" · ")}
                    </p>
                </div>
            </div>

            {/* Thumbnail strip */}
            {data.images && data.images.length > 0 && (
                <div className="mx-auto max-w-6xl px-4 lg:px-8 -mt-8 relative z-10">
                    <div className="flex gap-2 overflow-x-auto bg-white border border-line rounded-xl p-3 shadow-sm">
                        {data.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(img)}
                                className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? "border-steel opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                                    }`}
                            >
                                <img
                                    src={`/api/image-proxy?url=${encodeURIComponent(img)}`}
                                    className="w-full h-full object-cover"
                                    alt={`Thumbnail ${idx + 1}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-6xl px-4 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content column */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="font-display text-xl font-bold border-r-4 border-steel pr-3 mb-6">
                                المواصفات
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {Object.entries(data.specs || {}).map(([label, value]) => (
                                    <div key={label} className="bg-white border border-line rounded-lg p-3 text-center">
                                        <p className="text-steel text-xs mb-1">{label}</p>
                                        <p className="font-bold text-sm">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {data.inspectionPoints && data.inspectionPoints.length > 0 && (
                            <section>
                                <h2 className="font-display text-xl font-bold border-r-4 border-steel pr-3 mb-6">
                                    نقاط الفحص
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {data.inspectionPoints.map((point, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between bg-white border border-line rounded-lg px-4 py-3"
                                        >
                                            <span className="font-medium text-sm">{point.part}</span>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${point.status === "تبديل"
                                                        ? "bg-red-50 text-red-600"
                                                        : "bg-orange-50 text-orange-600"
                                                        }`}
                                                >
                                                    {point.status}
                                                </span>
                                                <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs font-bold text-gray-700">
                                                    {point.code}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section>
                            <h2 className="font-display text-xl font-bold border-r-4 border-steel pr-3 mb-6">
                                صورة الفحص
                            </h2>
                            {data.inspectionImg ? (
                                <div className="flex justify-center bg-white border border-line rounded-lg p-4">
                                    <img
                                        src={`/api/image-proxy?url=${encodeURIComponent(data.inspectionImg)}`}
                                        alt="Inspection Diagram"
                                        className="max-w-full h-auto rounded"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-[2/1] w-full bg-white flex items-center justify-center border border-dashed border-line rounded-lg">
                                    <p className="text-steel text-sm">لم يتم العثور على صورة فحص تلقائياً.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sticky sidebar */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-6 space-y-4">
                            <div
                                className="bg-ink rounded-2xl p-6 text-white"
                                suppressHydrationWarning
                            >
                                <p className="text-white/60 text-sm text-center mb-4">ينتهي المزاد خلال</p>
                                {countdown.expired ? (
                                    <p className="text-center font-bold text-lg">انتهى المزاد</p>
                                ) : (
                                    <div className="flex items-center justify-center gap-3">
                                        <CountdownUnit value={countdown.days} label="يوم" />
                                        <span className="text-2xl font-bold text-white/30">:</span>
                                        <CountdownUnit value={countdown.hours} label="ساعة" />
                                        <span className="text-2xl font-bold text-white/30">:</span>
                                        <CountdownUnit value={countdown.minutes} label="دقيقة" />
                                    </div>
                                )}
                            </div>

                            <div className="bg-white border border-line rounded-2xl p-6">
                                <p className="text-steel text-sm mb-1">رقم القطعة</p>
                                <p className="font-mono text-sm font-bold mb-5">
                                    {data.specs?.["رقم القطعة"] || data.specs?.["رقم الهيكل (VIN)"] || "—"}
                                </p>

                                <div className="bg-paper rounded-xl p-4 text-center mb-5">
                                    <p className="text-steel text-sm mb-1">سعر بداية المزاد</p>
                                    <p className="font-display text-2xl font-bold">
                                        {data.specs?.["السعر"] ? `${data.specs["السعر"]} ريال` : "—"}
                                    </p>
                                </div>

                                <SpecRow label="المسافة" value={data.specs?.["المسافة المقطوعة"]} />
                                <SpecRow label="ناقل الحركة" value={data.specs?.["ناقل الحركة"]} />
                                <SpecRow label="الوقود" value={data.specs?.["الوقود"]} />
                                <SpecRow label="اللون" value={data.specs?.["اللون"]} />

                                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl mt-6 mb-3 transition-colors">
                                    استفسار عبر واتساب
                                </button>
                                <button className="w-full bg-white border border-line hover:bg-gray-50 text-ink font-bold py-3 px-4 rounded-xl transition-colors">
                                    احسب التكلفة التقديرية
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function CarDetailsPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-display text-xl">جاري تحميل الصفحة...</div>}>
            <CarDetailsContent />
        </Suspense>
    );
}