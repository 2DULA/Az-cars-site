"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, LogOut } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function AuthButton() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setLoaded(true);
        });

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => listener.subscription.unsubscribe();
    }, [supabase]);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    if (!loaded) {
        return <div className="h-10 w-24 rounded-full bg-paper animate-pulse" />;
    }

    if (user) {
        return (
            <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-ink/70 hidden sm:inline">
                    {user.email}
                </span>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-xs text-ink/70 hover:border-steel hover:text-steel"
                >
                    <LogOut size={14} />
                    خروج
                </button>
            </div>
        );
    }

    return (
        <Link
            href="/signin"
            className="flex items-center gap-2.5 rounded-full bg-ink px-7 py-2.5 font-display text-sm font-bold text-white shadow-sm transition-all hover:bg-steel"
        >
            <User size={16} />
            دخول
        </Link>
    );
}