import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for server-only operations that need to bypass RLS
// (writing scraper_auth, upserting fetched car detail data). NEVER import
// this from a "use client" component or expose SUPABASE_SERVICE_ROLE_KEY
// to the browser -- it must only ever be read from a server-side env var
// (no NEXT_PUBLIC_ prefix).
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
    if (!key) throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");

    return createSupabaseClient(url, key, { auth: { persistSession: false } });
}