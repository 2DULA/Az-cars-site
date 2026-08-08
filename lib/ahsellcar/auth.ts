import { createAdminClient } from "@/lib/supabase/admin";

const AUTH_BASE = "https://api.ahsellcar.co.kr/auth/external/rest/api/v1";

interface StoredAuth {
    access_token: string;
    refresh_token: string;
    access_token_expires_at: string; // ISO timestamp
}

async function getStoredAuth(): Promise<StoredAuth> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("scraper_auth")
        .select("access_token, refresh_token, access_token_expires_at")
        .eq("id", true)
        .single();

    if (error || !data) {
        throw new Error(
            "No scraper_auth row found. Run the one-time manual login before using this route."
        );
    }
    return data;
}

async function saveAuth(accessToken: string, refreshToken: string, expiresAt: Date) {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from("scraper_auth")
        .update({
            access_token: accessToken,
            refresh_token: refreshToken,
            access_token_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", true);

    if (error) throw error;
}

async function refreshToken(currentRefreshToken: string): Promise<string> {
    const resp = await fetch(`${AUTH_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!resp.ok) {
        throw new Error(`Token refresh failed: ${resp.status} ${await resp.text()}`);
    }

    const data = await resp.json();

    // NOTE: same as the Python scraper -- confirm these keys against the
    // real refresh response the first time this actually runs.
    const newAccess: string | undefined = data.accessToken ?? data.access_token;
    const newRefresh: string | undefined = data.refreshToken ?? data.refresh_token;

    if (!newAccess || !newRefresh) {
        throw new Error(`Unexpected refresh response shape: ${JSON.stringify(data)}`);
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h, matches observed token lifetime
    await saveAuth(newAccess, newRefresh, expiresAt);
    return newAccess;
}

/**
 * Returns a valid access token, refreshing first if the stored one is
 * expired or within 1 hour of expiring.
 */
export async function ensureValidAccessToken(): Promise<string> {
    const auth = await getStoredAuth();
    return auth.access_token;
}