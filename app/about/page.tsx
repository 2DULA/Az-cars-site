"use client";

import Image from "next/image";
import { ShieldCheck, Clock, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { dictionary } from "@/lib/i18n/dictionary";

export default function AboutPage() {
    const { lang } = useLanguage();
    const t = dictionary[lang].aboutPage;
    const isRtl = lang === "ar";

    return (
        <main className="mx-auto max-w-6xl px-4 py-16 lg:px-8" dir={isRtl ? "rtl" : "ltr"}>
            <div className="mb-16 text-center">
                <span className="inline-block rounded-full border border-line bg-paper px-4 py-1.5 font-mono text-sm font-semibold uppercase tracking-wide text-steel">
                    {t.badge}
                </span>
                <h1 className="mt-4 font-display text-4xl font-bold text-ink lg:text-5xl">
                    {t.title}
                </h1>
            </div>

            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                    <div>
                        <h2 className="font-display text-2xl font-bold leading-snug text-ink lg:text-3xl">
                            {t.heading}
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-ink/75">
                            {t.body}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-2">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line bg-paper text-steel">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink">{t.experienceTitle}</h3>
                                <p className="mt-1 text-sm text-ink/60">{t.experienceBody}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line bg-paper text-steel">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink">{t.carsTitle}</h3>
                                <p className="mt-1 text-sm text-ink/60">{t.carsBody}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 sm:col-span-2">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line bg-paper text-steel">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink">{t.supportTitle}</h3>
                                <p className="mt-1 text-sm text-ink/60">{t.supportBody}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative flex aspect-[4/3] w-full items-center justify-center rounded-3xl border border-line bg-paper p-10 shadow-sm transition-transform hover:-translate-y-1">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-paper/40 to-line/10" />

                    <div className="relative z-10 flex h-full w-full items-center justify-center">
                        <Image
                            src="/full logo.png"
                            alt="AZ International"
                            width={500}
                            height={400}
                            className="h-full w-full object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}