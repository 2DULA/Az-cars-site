import { createAdminClient } from "@/lib/supabase/admin";
import { ensureValidAccessToken } from "./auth";
import { translateBatch } from "./translate";

const INSPECTION_BASE = "https://api.ahsellcar.co.kr/inspection/external/rest/api/v1";
const FILE_BASE = "https://file.ahsellcar.co.kr/rest/api/v1";

async function authedFetch(url: string, accessToken: string) {
    const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!resp.ok) {
        throw new Error(`Request failed (${resp.status}): ${url}`);
    }
    return resp.json();
}

/**
 * Fetches the full inspection report, frame damage mapping, and image
 * gallery for a car (by perfId), and upserts everything into Postgres.
 *
 * Optimized to run independent work concurrently:
 *  - perf/review/report and perf/frame/info both only need perfId, so
 *    they're fetched in parallel instead of sequentially.
 *  - The image file-resolver call depends on report's fileIds, but once
 *    kicked off it runs alongside every other table write.
 *  - The four independent per-car tables (options, electric parts,
 *    performance items, inspector notes) are each delete-then-insert,
 *    but the four tables themselves don't depend on each other, so all
 *    four run concurrently via Promise.all rather than one at a time.
 */
export async function fetchAndCacheCarDetails(carId: string, perfId: string) {
    const accessToken = await ensureValidAccessToken();
    const supabase = createAdminClient();

    // Claim this fetch immediately, before doing any real work. If two
    // requests for the same car arrive close together, the second one's
    // staleness check (in the details page) will now see a fresh
    // timestamp and skip re-fetching -- preventing the delete/insert
    // sequences below from racing each other and leaving duplicate rows.
    await supabase
        .from("cars")
        .update({ details_fetched_at: new Date().toISOString() })
        .eq("id", carId);

    // Kick off both independent API calls at once.
    const [report, frameInfo] = await Promise.all([
        authedFetch(`${INSPECTION_BASE}/perf/review/report/${perfId}`, accessToken),
        authedFetch(`${INSPECTION_BASE}/perf/frame/info?perfId=${perfId}`, accessToken),
    ]);
    const reportData = report.data;

    // Kick off the file resolver as soon as we have fileIds -- don't await
    // yet, let it run alongside the DB writes below.
    const fileIds: string[] = reportData?.files?.fileIds ?? [];
    const filesPromise: Promise<any[]> = fileIds.length
        ? (async () => {
            const params = new URLSearchParams();
            fileIds.forEach((id) => params.append("fileIds", id));
            const resp = await authedFetch(
                `${FILE_BASE}/file/list/ids?${params.toString()}`,
                accessToken
            );
            return resp.data ?? [];
        })()
        : Promise.resolve([]);

    const options = reportData?.car?.options ?? [];
    const electric = reportData?.evaluation?.electricParts ?? [];
    const descr = reportData?.description;

    const perfRows: any[] = [];
    for (const cat of reportData?.evaluation?.performanceDtl ?? []) {
        for (const item of cat.criteriaList ?? []) {
            perfRows.push({
                car_id: carId,
                category_ct_id: cat.ctId,
                category_name_ko: cat.ctNmKo,
                category_order: cat.orderNo,
                ct_dtl_id: item.ctDtlId,
                item_name_ko: item.ctDtlNmKo,
                item_order: item.orderNo,
                status_ko: item.criteriaTypeKoNm,
            });
        }
    }

    const frameRows: any[] = [];
    for (const entry of frameInfo.data ?? []) {
        for (const c of entry.criterias ?? []) {
            frameRows.push({
                car_id: carId,
                car_frame_id: entry.carFrameId,
                frame_eval_type: c.frameEvalType,
                perf_frame_criteria: c.perfFrameCriteria,
            });
        }
    }

    // Translate every distinct Korean status string used by this car,
    // kicked off now so it runs alongside the file resolver and DB
    // writes below rather than blocking them. Cached per-string, so
    // repeated phrases across cars only cost one translation call ever.
    const statusTextsToTranslate = [
        ...electric.map((e: any) => e.ctCriteriaTypeNmKo),
        ...perfRows.map((r) => r.status_ko),
        ...(descr?.descr ? [descr.descr] : []),
    ].filter(Boolean);
    const translationsPromise = translateBatch(statusTextsToTranslate, "ar");

    // All independent table writes run concurrently.
    await Promise.all([
        (async () => {
            await supabase.from("car_options").delete().eq("car_id", carId);
            if (options.length) {
                await supabase.from("car_options").insert(
                    options.map((o: any) => ({
                        car_id: carId,
                        ct_dtl_id: o.ctDtlId,
                        name_ko: o.ctDtlNm,
                        icon_url: o.url,
                    }))
                );
            }
        })(),
        (async () => {
            await supabase.from("car_electric_parts").delete().eq("car_id", carId);
            if (electric.length) {
                const translations = await translationsPromise;
                await supabase.from("car_electric_parts").insert(
                    electric.map((e: any) => ({
                        car_id: carId,
                        ct_dtl_id: e.ctDtlId,
                        name_ko: e.ctDtlNmKo,
                        status_ko: e.ctCriteriaTypeNmKo,
                        status_en: translations[e.ctCriteriaTypeNmKo] ?? null,
                    }))
                );
            }
        })(),
        (async () => {
            await supabase.from("car_performance_items").delete().eq("car_id", carId);
            if (perfRows.length) {
                const translations = await translationsPromise;
                await supabase.from("car_performance_items").insert(
                    perfRows.map((r) => ({
                        ...r,
                        status_en: translations[r.status_ko] ?? null,
                    }))
                );
            }
        })(),
        (async () => {
            await supabase.from("car_inspector_notes").delete().eq("car_id", carId);
            if (descr?.descr) {
                const translations = await translationsPromise;
                await supabase.from("car_inspector_notes").insert({
                    car_id: carId,
                    note_type: descr.type,
                    note_text: descr.descr,
                    note_text_en: translations[descr.descr] ?? null,
                });
            }
        })(),
        (async () => {
            await supabase.from("car_frame_criteria").delete().eq("car_id", carId);
            if (frameRows.length) {
                await supabase.from("car_frame_criteria").insert(frameRows);
            }
        })(),
        (async () => {
            const files = await filesPromise;
            await supabase.from("car_images").delete().eq("car_id", carId);
            if (files.length) {
                await supabase.from("car_images").insert(
                    files.map((f: any, idx: number) => ({
                        car_id: carId,
                        file_id: f.fileId,
                        thumb_url: f.thumbUrl,
                        file_url: f.fileUrl,
                        sort_order: idx,
                    }))
                );
            }
        })(),
    ]);

    // Mark that details have been fetched, so subsequent visits skip
    // re-fetching (see the freshness check in the details page).
    await supabase
        .from("cars")
        .update({ details_fetched_at: new Date().toISOString() })
        .eq("id", carId);
}