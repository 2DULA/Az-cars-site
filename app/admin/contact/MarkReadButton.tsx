"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MarkReadButton({ id, isRead }: { id: number; isRead: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    if (isRead) return null;

    async function markRead() {
        setLoading(true);
        try {
            await fetch("/api/admin/contact", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            router.refresh();
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={markRead}
            disabled={loading}
            className="flex items-center gap-1 rounded-lg border border-steel/20 px-2 py-1 text-[11px] font-mono font-bold text-steel hover:bg-steel/10 transition-colors"
        >
            <Check size={12} />
            {loading ? "..." : "Read"}
        </button>
    );
}
