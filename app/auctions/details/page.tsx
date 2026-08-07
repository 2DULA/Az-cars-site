import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { fetchAndCacheCarDetails } from "@/lib/ahsellcar/fetchCarDetails";
import { translateBatch } from "@/lib/ahsellcar/translate";
import { dictionary } from "@/lib/i18n/dictionary";
import CarDetailsView from "./CarDetailsView";

// Re-fetch details if they're older than this, so occasional inspection
// updates on the source site eventually propagate without needing a
// manual cache-bust. Adjust as you see fit.
const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24h

export default async function CarDetailsPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const { id } = await searchParams;

    const cookieStore = await cookies();
    const lang = cookieStore.get("lang")?.value === "en" ? "en" : "ar";
    const isRtl = lang === "ar";
    const t = dictionary[lang].auctionDetailsPage;

    if (!id) {
        return (
            <div className="p-10 text-center text-red-500 font-bold" dir={isRtl ? "rtl" : "ltr"}>
                {t.missingLink}
            </div>
        );
    }

    const supabase = await createClient();

    const { data: car, error } = await supabase
        .from("cars")
        .select("*")
        .eq("source_id", id)
        .single();

    if (error || !car) {
        return (
            <div className="p-10 text-center text-red-500" dir={isRtl ? "rtl" : "ltr"}>
                {t.loadError}
            </div>
        );
    }

    const isStale =
        !car.details_fetched_at ||
        Date.now() - new Date(car.details_fetched_at).getTime() > STALE_AFTER_MS;

    if (isStale && car.perf_id) {
        try {
            await fetchAndCacheCarDetails(car.id, car.perf_id);
        } catch (e) {
            // Don't fail the whole page if the live fetch errors -- fall back
            // to whatever's already cached (possibly nothing, on a first visit).
            console.error(`Failed to fetch live details for car ${car.id}:`, e);
        }
    }

    const [
        { data: images },
        { data: options },
        { data: electricParts },
        { data: performanceItems },
        { data: inspectorNotes },
        { data: frameCriteria },
    ] = await Promise.all([
        supabase.from("car_images").select("*").eq("car_id", car.id).order("sort_order"),
        supabase.from("car_options").select("*").eq("car_id", car.id),
        supabase.from("car_electric_parts").select("*").eq("car_id", car.id),
        supabase
            .from("car_performance_items")
            .select("*")
            .eq("car_id", car.id)
            .order("category_order")
            .order("item_order"),
        supabase.from("car_inspector_notes").select("*").eq("car_id", car.id),
        supabase.from("car_frame_criteria").select("*").eq("car_id", car.id),
    ]);

    // Static reference data for rendering the frame diagram.
    const frameCarFrameIds = (frameCriteria || []).map((f) => f.car_frame_id);
    const { data: frameLayoutParts } = frameCarFrameIds.length
        ? await supabase.from("frame_layout_parts").select("*").in("car_frame_id", frameCarFrameIds)
        : { data: [] };
    const { data: frameLegend } = await supabase.from("frame_criteria_legend").select("*");
    const { data: optionCatalog } = await supabase.from("option_catalog").select("*");
    const { data: electricPartCatalog } = await supabase.from("electric_part_catalog").select("*");
    const { data: performanceItemCatalog } = await supabase
        .from("performance_item_catalog")
        .select("*");
    const { data: performanceCategoryCatalog } = await supabase
        .from("performance_category_catalog")
        .select("*");
    const { data: diagramBaseRows } = await supabase.from("frame_diagram_base").select("*").limit(1);
    const diagramBaseUrl = diagramBaseRows?.[0]?.draw_file_url ?? null;

    // Translate every distinct Korean free-text status/note string for
    // this car into whichever language is currently active. Cached per
    // (source_text, target_lang), so this is fast after the first hit --
    // only genuinely slow the very first time any given phrase is seen
    // in a given language.
    const dynamicTexts = [
        ...(electricParts || []).map((e) => e.status_ko),
        ...(performanceItems || []).map((p) => p.status_ko),
        ...(inspectorNotes || []).map((n) => n.note_text),
    ].filter(Boolean) as string[];
    const dynamicTranslations = await translateBatch(dynamicTexts, lang);

    return (
        <CarDetailsView
            car={car}
            images={images || []}
            options={options || []}
            electricParts={electricParts || []}
            performanceItems={performanceItems || []}
            inspectorNotes={inspectorNotes || []}
            frameCriteria={frameCriteria || []}
            frameLayoutParts={frameLayoutParts || []}
            frameLegend={frameLegend || []}
            optionCatalog={optionCatalog || []}
            electricPartCatalog={electricPartCatalog || []}
            performanceItemCatalog={performanceItemCatalog || []}
            performanceCategoryCatalog={performanceCategoryCatalog || []}
            diagramBaseUrl={diagramBaseUrl}
            lang={lang}
            isRtl={isRtl}
            dynamicTranslations={dynamicTranslations}
        />
    );
}