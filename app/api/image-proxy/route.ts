import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing url param" }, { status: 400 });
    }

    let target: URL;
    try {
        target = new URL(url);
    } catch {
        return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    if (target.protocol !== "https:" && target.protocol !== "http:") {
        return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
    }

    try {
        const upstream = await fetch(target.toString(), {
            headers: {
                Referer: `${target.protocol}//${target.host}/`,
                "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
            },
            next: { revalidate: 3600 },
        });

        if (!upstream.ok || !upstream.body) {
            return NextResponse.json(
                { error: `Upstream image fetch failed (${upstream.status})` },
                { status: 502 }
            );
        }

        const contentType = upstream.headers.get("content-type") || "image/jpeg";

        return new NextResponse(upstream.body, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, immutable",
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch image" },
            { status: 502 }
        );
    }
}