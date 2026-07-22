"use client";

import Link from "next/link";
import AuthButton from "./AuthButton";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCurrency, type Currency } from "@/lib/currency/CurrencyContext";
import { dictionary } from "@/lib/i18n/dictionary";
import { Moon, Sun, ChevronDown, Languages, Coins } from "lucide-react";

const LANGUAGES = [
    { code: "ar", label: "العربية SA" },
    { code: "en", label: "English" },
];

const CURRENCIES = [
    { code: "SAR", label: "ريال SAR" },
    { code: "USD", label: "دولار USD" },
    { code: "AED", label: "درهم AED" },
    { code: "EGP", label: "جنيه EGP" },
];

export default function Header() {
    const { lang, setLang } = useLanguage();
    const { currency, setCurrency } = useCurrency();
    const t = dictionary[lang];

    const NAV_LINKS = [
        { href: "/", label: t.nav.home },
        { href: "/cars", label: t.nav.cars },
        { href: "/auctions", label: t.nav.auctions },
        { href: "/parts", label: t.nav.parts },
        { href: "/about", label: t.nav.about },
        { href: "/contact", label: t.nav.contact },
    ];

    const [langOpen, setLangOpen] = useState(false);
    const [currencyOpen, setCurrencyOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        if (newTheme) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-md">
            <div className="mx-auto flex w-full items-center justify-between px-6 py-4 2xl:px-12">
                <div className="flex items-center gap-16">
                    <Link href="/" className="transition-transform hover:scale-105">
                        <img
                            src="/logo.png"
                            alt="AZ International"
                            className="h-12 w-auto object-contain"
                        />
                    </Link>
                    <nav className="hidden items-center gap-10 lg:flex">
                        {NAV_LINKS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="font-display text-[15px] font-bold text-ink/80 transition-colors hover:text-steel"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => {
                                setCurrencyOpen((v) => !v);
                                setLangOpen(false);
                            }}
                            className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 font-mono text-sm font-medium text-ink/80 shadow-sm transition-colors hover:border-steel"
                        >
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-paper text-steel">
                                <Coins size={12} />
                            </div>
                            {CURRENCIES.find((c) => c.code === currency)?.label}
                            <ChevronDown size={14} className="text-ink/50" />
                        </button>
                        {currencyOpen && (
                            <div className="absolute end-0 top-full z-10 mt-2 w-36 rounded-xl border border-line bg-paper shadow-lg">
                                {CURRENCIES.map((c) => (
                                    <button
                                        key={c.code}
                                        onClick={() => {
                                            setCurrency(c.code as Currency);
                                            setCurrencyOpen(false);
                                        }}
                                        className="block w-full px-4 py-2.5 text-start font-mono text-sm text-ink/80 hover:bg-paper/80"
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => {
                                setLangOpen((v) => !v);
                                setCurrencyOpen(false);
                            }}
                            className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 font-mono text-sm font-medium text-ink/80 shadow-sm transition-colors hover:border-steel"
                        >
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-paper text-steel">
                                <Languages size={12} />
                            </div>
                            {LANGUAGES.find((l) => l.code === lang)?.label}
                            <ChevronDown size={14} className="text-ink/50" />
                        </button>
                        {langOpen && (
                            <div className="absolute end-0 top-full z-10 mt-2 w-36 rounded-xl border border-line bg-paper shadow-lg">
                                {LANGUAGES.map((l) => (
                                    <button
                                        key={l.code}
                                        onClick={() => {
                                            setLang(l.code as "ar" | "en");
                                            setLangOpen(false);
                                        }}
                                        className="block w-full px-4 py-2.5 text-start font-mono text-sm text-ink/80 hover:bg-paper/80"
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={toggleTheme}
                        aria-label={isDark ? "الوضع النهاري" : "الوضع الليلي"}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-ink/80 shadow-sm transition-all hover:border-steel"
                    >
                        {mounted ? (isDark ? <Sun size={18} /> : <Moon size={18} />) : <Moon size={18} />}
                    </button>

                    <AuthButton />
                </div>
            </div>
        </header>
    );
}