"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { dictionary } from "@/lib/i18n/dictionary";
import { User, Mail, Lock } from "lucide-react";

export default function SignUpPage() {
    const router = useRouter();
    const supabase = createClient();
    const { lang } = useLanguage();
    const t = dictionary[lang].auth;
    const isRtl = lang === "ar";

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
            },
        });

        setLoading(false);
        if (error) {
            setError(error.message);
            return;
        }
        setSuccess(true);
    }

    if (success) {
        return (
            <main
                className="relative flex min-h-[80vh] w-full items-center justify-center px-4 py-12 sm:py-20"
                dir={isRtl ? "rtl" : "ltr"}
            >
                <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-steel/10 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 left-1/3 -z-10 h-64 w-64 rounded-full bg-amber/5 blur-[120px] pointer-events-none" />

                <div className="w-full max-w-md rounded-2xl border border-line bg-paper/60 p-8 text-center shadow-xl shadow-ink/5 backdrop-blur-md sm:p-10">
                    <h1 className="font-display text-3xl font-bold text-ink">
                        {t.accountCreatedTitle}
                    </h1>
                    <p className="mt-3 text-sm text-ink/60">{t.accountCreatedBody}</p>
                    <Link
                        href="/signin"
                        className="mt-8 inline-block w-full rounded-xl bg-steel py-4 font-mono text-sm font-bold text-white shadow-sm transition-all hover:bg-ink hover:text-paper active:scale-[0.98]"
                    >
                        {t.goToSignInButton}
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main
            className="relative flex min-h-[80vh] w-full items-center justify-center px-4 py-12 sm:py-20"
            dir={isRtl ? "rtl" : "ltr"}
        >
            <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-steel/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/3 -z-10 h-64 w-64 rounded-full bg-amber/5 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md rounded-2xl border border-line bg-paper/60 p-8 shadow-xl shadow-ink/5 backdrop-blur-md sm:p-10">
                <div className="text-center">
                    <h1 className="font-display text-3xl font-bold text-ink">
                        {t.signUpTitle}
                    </h1>
                    <p className="mt-2 text-sm text-ink/60">
                        {t.signUpSubtitle}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-ink/75">
                            {t.username}
                        </label>
                        <div className="relative">
                            <span className={`absolute inset-y-0 ${isRtl ? 'right-4' : 'left-4'} flex items-center text-ink/40`}>
                                <User size={16} />
                            </span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                minLength={3}
                                className={`w-full rounded-xl border border-line bg-paper/40 py-3.5 ${isRtl ? 'pl-4 pr-11' : 'pl-11 pr-4'} text-sm text-ink outline-none transition-all focus:border-steel focus:bg-paper focus:ring-2 focus:ring-steel/10`}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-ink/75">
                            {t.email}
                        </label>
                        <div className="relative">
                            <span className={`absolute inset-y-0 ${isRtl ? 'right-4' : 'left-4'} flex items-center text-ink/40`}>
                                <Mail size={16} />
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@example.com"
                                className={`w-full rounded-xl border border-line bg-paper/40 py-3.5 ${isRtl ? 'pl-4 pr-11' : 'pl-11 pr-4'} text-sm text-ink outline-none transition-all focus:border-steel focus:bg-paper focus:ring-2 focus:ring-steel/10`}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-ink/75">
                            {t.password}
                        </label>
                        <div className="relative">
                            <span className={`absolute inset-y-0 ${isRtl ? 'right-4' : 'left-4'} flex items-center text-ink/40`}>
                                <Lock size={16} />
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className={`w-full rounded-xl border border-line bg-paper/40 py-3.5 ${isRtl ? 'pl-4 pr-11' : 'pl-11 pr-4'} text-sm text-ink outline-none transition-all focus:border-steel focus:bg-paper focus:ring-2 focus:ring-steel/10`}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-steel py-4 font-mono text-sm font-bold text-white shadow-sm transition-all hover:bg-ink hover:text-paper active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? t.creatingAccount : t.createAccount}
                    </button>
                </form>

                <div className="mt-8 border-t border-line/60 pt-6 text-center">
                    <p className="text-sm text-ink/65">
                        {t.alreadyHaveAccount}{" "}
                        <Link href="/signin" className="font-bold text-steel hover:underline transition-colors">
                            {t.goToSignIn}
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}