import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/adminAuth";
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

    return (
        <div className="min-h-screen bg-[var(--paper)]">
            <div className="flex">
                <aside className="w-56 border-r border-[var(--line)] p-4 min-h-screen">
                    <h2 className="font-display text-lg mb-6">Admin</h2>
                    <nav className="flex flex-col gap-2 text-sm">
                        <Link href="/admin/cars" className="py-2 hover:text-steel">Cars</Link>
                        <Link href="/admin/cars/new" className="py-2 hover:text-steel">+ Add Car</Link>
                    </nav>
                </aside>
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}