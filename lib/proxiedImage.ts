const CARAPIS_MEDIA_BASE = "https://api.carapis.com";

export function proxiedImage(url: string): string {
    if (!url) return url;

    const fullUrl = url.startsWith("/")
        ? `${CARAPIS_MEDIA_BASE}${url}`
        : url;

    return `/api/image-proxy?url=${encodeURIComponent(fullUrl)}`;
}