import { createAdminClient } from "@/lib/supabase/admin";

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

// Optional: an email associated with your requests raises MyMemory's
// anonymous rate limit from ~5,000 to ~50,000 words/day. Not required.
const CONTACT_EMAIL = process.env.MYMEMORY_CONTACT_EMAIL;

async function translateOne(text: string, targetLang: string): Promise<string> {
    const params = new URLSearchParams({
        q: text,
        langpair: `ko|${targetLang}`,
    });
    if (CONTACT_EMAIL) params.set("de", CONTACT_EMAIL);

    const resp = await fetch(`${MYMEMORY_URL}?${params.toString()}`);
    if (!resp.ok) {
        throw new Error(`MyMemory request failed: ${resp.status}`);
    }
    const data = await resp.json();
    const translated = data?.responseData?.translatedText;
    if (!translated) {
        throw new Error(`Unexpected MyMemory response: ${JSON.stringify(data)}`);
    }
    return translated;
}

/**
 * Translates a batch of Korean strings to the given target language ("en"
 * or "ar"), using a Postgres-backed cache keyed by (source_text,
 * target_lang) so translations to different languages never collide, and
 * repeated phrases across cars are never re-requested.
 */
export async function translateBatch(
    texts: string[],
    targetLang: string = "en"
): Promise<Record<string, string>> {
    const uniqueTexts = Array.from(new Set(texts.filter(Boolean)));
    if (uniqueTexts.length === 0) return {};

    const supabase = createAdminClient();
    const result: Record<string, string> = {};

    // Check cache first.
    const { data: cached } = await supabase
        .from("translations")
        .select("source_text, translated_text")
        .eq("target_lang", targetLang)
        .in("source_text", uniqueTexts);

    const cachedSet = new Set<string>();
    for (const row of cached ?? []) {
        result[row.source_text] = row.translated_text;
        cachedSet.add(row.source_text);
    }

    const toTranslate = uniqueTexts.filter((t) => !cachedSet.has(t));
    if (toTranslate.length === 0) return result;

    const translated = await Promise.all(
        toTranslate.map(async (text) => {
            try {
                return { text, translation: await translateOne(text, targetLang) };
            } catch (e) {
                console.error(`Failed to translate "${text}":`, e);
                return { text, translation: text }; // fall back to source rather than fail the page
            }
        })
    );

    for (const { text, translation } of translated) {
        result[text] = translation;
    }

    // Best-effort cache write -- don't fail the request if this errors.
    const { error: cacheError } = await supabase.from("translations").upsert(
        translated.map(({ text, translation }) => ({
            source_text: text,
            target_lang: targetLang,
            translated_text: translation,
        })),
        { onConflict: "source_text,target_lang" }
    );
    if (cacheError) {
        console.error("Failed to cache translations:", cacheError);
    }

    return result;
}