import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("targetUrl");

    if (!targetUrl) {
        return NextResponse.json({ error: "Missing target URL" }, { status: 400 });
    }

    try {
        const { data } = await axios.get(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        const $ = cheerio.load(data);

        let rawImages: string[] = [];

        const mainImgSrc = $("#gl-main-img").attr("src");
        if (mainImgSrc) {
            rawImages.push(mainImgSrc);
        }

        $("img").each((_, el) => {
            const src = $(el).attr("src") || $(el).attr("data-src");
            if (src && src.includes("lotteautoauction.net") && !rawImages.includes(src)) {
                rawImages.push(src);
            }
        });

        let inspectionImg = "";
        const images: string[] = [];

        rawImages.forEach((src) => {
            if (src.includes("/AU_INSP/")) {
                inspectionImg = src;
            } else {
                images.push(src);
            }
        });

        const specs: Record<string, string> = {};

        $(".gl-detail-specs .gl-detail-spec").each((_, el) => {
            const label = $(el)
                .find(".gl-detail-spec-head .label.bilingual")
                .attr("data-lang-ar")
                ?.trim();

            const valueEl = $(el).find(".value").first();
            const value =
                valueEl.attr("data-lang-ar")?.trim() ||
                valueEl.find("bdi").text().trim() ||
                valueEl.text().trim();

            if (label && value) {
                specs[label] = value;
            }
        });

        const auctionDate = $(".auction-countdown").attr("data-auction-date") || null;

        const inspectionPoints: { part: string; code: string; status: string }[] = [];

        $(".gl-detail-marker").each((_, el) => {
            const part = $(el).find(".mk").text().trim();
            const code = $(el).find(".gl-marker-code").text().trim();
            const status = $(el).find(".gl-marker-st").attr("data-lang-ar")?.trim() || "";

            if (part) {
                inspectionPoints.push({ part, code, status });
            }
        });

        return NextResponse.json({
            images,
            inspectionImg,
            specs,
            auctionDate,
            inspectionPoints,
        });
    } catch (error) {
        console.error("Scraping error:", error);
        return NextResponse.json({ error: "Scraping details failed" }, { status: 500 });
    }
}