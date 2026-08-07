"use client";

import { useState } from "react";
import { ArrowUpLeft, ArrowUpRight, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { dictionary } from "@/lib/i18n/dictionary";

export default function ContactPage() {
    const { lang } = useLanguage();
    const t = dictionary[lang].contactPage;
    const isRtl = lang === "ar";
    const Arrow = isRtl ? ArrowUpLeft : ArrowUpRight;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSending(true);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message }),
            });
            if (!res.ok) throw new Error();
            setSubmitted(true);
        } catch {
            setError("Failed to send. Please try again.");
        } finally {
            setSending(false);
        }
    }

    return (
        <main className="mx-auto max-w-6xl px-4 py-16 lg:px-8" dir={isRtl ? "rtl" : "ltr"}>
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-start">

                <div className="space-y-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold lg:text-4xl">
                            {t.title}
                        </h1>
                        <p className="mt-4 text-ink/70">
                            {t.subtitle}
                        </p>
                    </div>

                    <div className="space-y-6 border-t border-line pt-8">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-line text-steel">
                                <Phone size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold">{t.phoneLabel}</h3>
                                <p className="font-mono text-sm text-ink/70" dir="ltr">+966 50 000 0000</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-line text-steel">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold">{t.emailLabel}</h3>
                                <p className="font-mono text-sm text-ink/70">info@alez-cars.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-line text-steel">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold">{t.addressLabel}</h3>
                                <p className="text-sm text-ink/70">{t.addressValue}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm sm:p-8">
                    {submitted ? (
                        <div className="py-12 text-center">
                            <p className="font-display text-xl font-semibold text-steel">
                                {t.successTitle}
                            </p>
                            <p className="mt-2 text-sm text-ink/60">
                                {t.successBody}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold">
                                    {t.name}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t.namePlaceholder}
                                    required
                                    className="w-full rounded-lg border border-line bg-transparent text-ink px-4 py-3 text-sm outline-none placeholder:text-ink/40 focus:border-steel"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold">
                                    {t.emailLabel}
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@domain.com"
                                    required
                                    className="w-full rounded-lg border border-line bg-transparent text-ink px-4 py-3 text-sm outline-none placeholder:text-ink/40 focus:border-steel"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold">
                                    {t.messageLabel}
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={t.messagePlaceholder}
                                    rows={5}
                                    required
                                    className="w-full rounded-lg border border-line bg-transparent text-ink px-4 py-3 text-sm outline-none placeholder:text-ink/40 focus:border-steel resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-steel py-3.5 font-mono text-sm font-bold text-paper transition-all hover:bg-ink hover:shadow-md disabled:opacity-60"
                            >
                                {sending ? (
                                    <><Loader2 size={18} className="animate-spin" /> Sending...</>
                                ) : (
                                    <>{t.submit}<Arrow size={18} /></>
                                )}
                            </button>
                            {error && (
                                <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
                            )}
                        </form>
                    )}
                </div>

            </div>
        </main>
    );
}