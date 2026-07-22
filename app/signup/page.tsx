"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { dictionary } from "@/lib/i18n/dictionary";

export default function SignUpPage() {
    const router = useRouter();
    const supabase = createClient();
    const { lang } = useLanguage();
    const t = dictionary[lang].auth;

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
            <main className="mx-auto max-w-md px-4 py-20 text-center" dir={lang === "ar" ? "rtl" : "ltr"}>
                <h1 className="font-display text-2xl font-bold">{t.accountCreatedTitle}</h1>
                <p className="mt-3 text-ink/60">{t.accountCreatedBody}</p>
                <Link
                    href="/signin"
                    className="mt-6 inline-block bg-ink px-6 py-3 font-mono text-sm text-paper hover:bg-steel"
                >
                    {t.goToSignInButton}
                </Link>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-md px-4 py-16" dir={lang === "ar" ? "rtl" : "ltr"}>
            <h1 className="font-display text-2xl font-bold text-center">
                {t.signUpTitle}
            </h1>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                    <label className="mb-1.5 block text-sm font-semibold">
                        {t.username}
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        minLength={3}
                        className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-steel"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-semibold">
                        {t.email}
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-steel"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-semibold">
                        {t.password}
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-steel"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-3">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-ink py-3 font-mono text-sm text-paper hover:bg-steel disabled:opacity-50"
                >
                    {loading ? t.creatingAccount : t.createAccount}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink/60">
                {t.alreadyHaveAccount}{" "}
                <Link href="/signin" className="text-steel underline">
                    {t.goToSignIn}
                </Link>
            </p>
        </main>
    );
}