"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

export default function AuctionFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [search, setSearch] = useState(searchParams.get("search") || "");

    function updateParam(key: string, value: string | null) {
        const params = new URLSearchParams(searchParams.toString());
        if (value === null || value === "") {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        params.delete("page");
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }

    return (
        <aside className="w-full shrink-0 border border-line bg-white p-5 lg:w-64">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    updateParam("search", search);
                }}
                className="mb-5"
            >
                <label className="mb-1 block font-mono text-[11px] text-ink/60">
                    بحث
                </label>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="الماركة، الموديل..."
                    className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-steel"
                />
            </form>

            <div className="mb-5">
                <label className="mb-1 block font-mono text-[11px] text-ink/60">
                    الوقود
                </label>
                <input
                    type="text"
                    defaultValue={searchParams.get("fuel") || ""}
                    onBlur={(e) => updateParam("fuel", e.target.value)}
                    placeholder="بنزين، ديزل..."
                    className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-steel"
                />
            </div>

            <div className="mb-5">
                <label className="mb-1 block font-mono text-[11px] text-ink/60">
                    ناقل الحركة
                </label>
                <input
                    type="text"
                    defaultValue={searchParams.get("transmission") || ""}
                    onBlur={(e) => updateParam("transmission", e.target.value)}
                    placeholder="أوتوماتيك، يدوي..."
                    className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-steel"
                />
            </div>

            {isPending && (
                <p className="mt-4 font-mono text-[11px] text-steel">
                    جاري التحديث…
                </p>
            )}

            <button
                type="button"
                onClick={() => router.push(pathname)}
                className="mt-2 w-full border border-ink py-2 font-mono text-xs uppercase tracking-wide hover:bg-ink hover:text-paper"
            >
                مسح الفلاتر
            </button>
        </aside>
    );
}