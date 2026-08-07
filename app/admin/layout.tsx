import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const admin = await getAdminUser();
    if (!admin) {
        redirect("/signin");
    }

    let unreadCount = 0;
    try {
        const supabase = createAdminClient();
        const { count } = await supabase
            .from("contact_messages")
            .select("*", { count: "exact", head: true })
            .eq("is_read", false);
        unreadCount = count ?? 0;
    } catch {
        // Table may not exist yet
    }

    return (
        <div className="min-h-screen bg-[var(--paper)]">
            <div className="flex">
                <aside className="w-56 border-r border-[var(--line)] p-4 min-h-screen">
                    <h2 className="font-display text-lg mb-6">Admin</h2>
                    <nav className="flex flex-col gap-2 text-sm">
                        <Link href="/admin/cars" className="py-2 hover:text-steel">Cars</Link>
                        <Link href="/admin/cars/new" className="py-2 hover:text-steel">+ Add Car</Link>
                        <Link href="/admin/contact" className="py-2 hover:text-steel flex items-center gap-2">
                            Messages
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-steel/20 px-2 py-0.5 text-[11px] font-mono font-bold text-steel">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    </nav>
                </aside>
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}