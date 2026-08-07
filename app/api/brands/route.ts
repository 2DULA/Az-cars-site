import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 120;

// Normalize Korean brand names from auction data to English
const KOREAN_BRAND_MAP: Record<string, string> = {
    "푸조": "Peugeot",
    "대우버스": "Daewoo Bus",
    "신위안(제이스": "Shinwian (Jayce)",
    "현대": "Hyundai",
    "시보레": "Chevrolet",
};

// Normalize typos, abbreviations, and case variants
const BRAND_NORMALIZE: Record<string, string> = {
    "For": "Ford",
    "Toyot": "Toyota",
    "Byd": "BYD",
    "Mg": "MG",
    "Kgm": "KG Mobility",
    "Ssangyong": "SsangYong",
    "Mini": "MINI",
    "Škoda": "Skoda",
    "Benj": "Mercedes-Benz",
    "Im": "BMW",
    "Gmc": "GMC",
};

interface BrandAggregate {
    id: string;
    brand_name: string;
    count: number;
}

export async function GET() {
    const brandMap = new Map<string, BrandAggregate>();

    function addBrand(id: string, name: string) {
        const existing = brandMap.get(id);
        if (existing) {
            existing.count++;
        } else {
            brandMap.set(id, { id, brand_name: name, count: 1 });
        }
    }

    // Auction cars from Supabase
    try {
        const supabase = await createClient();
        let auctionCount = 0;
        let from = 0;
        const PAGE_SIZE = 1000;
        let hasMore = true;

        while (hasMore) {
            const { data: auctions } = await supabase
                .from("cars")
                .select("brand")
                .eq("source", "auction")
                .eq("status", "active")
                .range(from, from + PAGE_SIZE - 1);

            if (!auctions || auctions.length === 0) {
                hasMore = false;
                break;
            }

            for (const a of auctions) {
                if (a.brand) {
                    let name = KOREAN_BRAND_MAP[a.brand] || a.brand;
                    name = BRAND_NORMALIZE[name] || name;
                    const slug = name.toLowerCase().replace(/\s+/g, "-");
                    addBrand(slug, name);
                    auctionCount++;
                }
            }

            from += PAGE_SIZE;
            if (auctions.length < PAGE_SIZE) hasMore = false;
        }

        if (process.env.NODE_ENV === "development") {
            console.log(`[brands] Auctions: ${auctionCount}`);
        }
    } catch {
        if (process.env.NODE_ENV === "development") {
            console.log("[brands] Auctions: failed");
        }
    }

    const brands = Array.from(brandMap.values()).sort((a, b) => b.count - a.count);

    return NextResponse.json(brands);
}
