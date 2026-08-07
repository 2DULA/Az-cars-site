import { createAdminClient } from "@/lib/supabase/admin";
import MarkReadButton from "./MarkReadButton";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
    const supabase = createAdminClient();
    const { data: messages, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl font-bold">Contact Messages</h1>
                <p className="font-mono text-sm text-steel">
                    {messages?.length || 0} message{(messages?.length || 0) !== 1 ? "s" : ""}
                </p>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    Failed to load messages. Make sure the <code className="font-mono">contact_messages</code> table exists in Supabase.
                </div>
            )}

            {messages && messages.length === 0 && (
                <div className="rounded-2xl border border-line bg-paper/60 p-12 text-center">
                    <p className="font-display text-lg text-ink/60">No messages yet</p>
                </div>
            )}

            <div className="space-y-3">
                {messages?.map((msg) => (
                    <div
                        key={msg.id}
                        className={`rounded-xl border p-4 transition-colors ${
                            msg.is_read ? "border-line bg-paper/40" : "border-steel/20 bg-steel/5"
                        }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-display font-bold text-ink">
                                        {msg.name}
                                    </span>
                                    {!msg.is_read && (
                                        <span className="rounded-full bg-steel/10 px-2 py-0.5 text-[10px] font-mono font-bold text-steel">
                                            NEW
                                        </span>
                                    )}
                                </div>
                                <p className="font-mono text-xs text-ink/50">{msg.email}</p>
                                <p className="text-sm text-ink/80 whitespace-pre-wrap mt-2">
                                    {msg.message}
                                </p>
                            </div>
                            <div className="text-right shrink-0 space-y-2">
                                <p className="font-mono text-[11px] text-ink/40">
                                    {new Date(msg.created_at).toLocaleString("ar-SA", {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                    })}
                                </p>
                                <MarkReadButton id={msg.id} isRead={msg.is_read} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
