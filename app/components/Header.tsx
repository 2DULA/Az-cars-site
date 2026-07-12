"use client";

import Link from "next/link";
import { useState } from "react";
import { Moon, User, ChevronDown, Languages, Coins } from "lucide-react";

const NAV_LINKS = [
    { href: "/", label: "الرئيسية" },
    { href: "/cars", label: "السيارات" },
    { href: "/auctions", label: "المزادات" },
    { href: "/parts", label: "قطع غيار" },
    { href: "/about", label: "من نحن" },
    { href: "/contact", label: "تواصل" },
];

const LANGUAGES = [
    { code: "ar", label: "العربية SA" },
    { code: "en", label: "English" },
];

const CURRENCIES = [
    { code: "SAR", label: "ريال SAR" },
    { code: "USD", label: "دولار USD" },
];

export default function Header() {
    const [lang, setLang] = useState(LANGUAGES[0]);
    const [currency, setCurrency] = useState(CURRENCIES[0]);
    const [langOpen, setLangOpen] = useState(false);
    const [currencyOpen, setCurrencyOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md">
            <div className="mx-auto flex w-full items-center justify-between px-6 py-4 2xl:px-12">
                {/* Brand + Nav */}
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

                {/* Utilities */}
                <div className="flex items-center gap-3">
                    {/* Currency Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setCurrencyOpen((v) => !v);
                                setLangOpen(false);
                            }}
                            className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 font-mono text-sm font-medium text-ink/80 shadow-sm transition-colors hover:border-steel"
                        >
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-paper text-steel">
                                <Coins size={12} />
                            </div>
                            {currency.label}
                            <ChevronDown size={14} className="text-ink/50" />
                        </button>
                        {currencyOpen && (
                            <div className="absolute end-0 top-full z-10 mt-2 w-36 rounded-xl border border-line bg-white shadow-lg">
                                {CURRENCIES.map((c) => (
                                    <button
                                        key={c.code}
                                        onClick={() => {
                                            setCurrency(c);
                                            setCurrencyOpen(false);
                                        }}
                                        className="block w-full px-4 py-2.5 text-start font-mono text-sm text-ink/80 hover:bg-paper"
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Language Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setLangOpen((v) => !v);
                                setCurrencyOpen(false);
                            }}
                            className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 font-mono text-sm font-medium text-ink/80 shadow-sm transition-colors hover:border-steel"
                        >
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-paper text-steel">
                                <Languages size={12} />
                            </div>
                            {lang.label}
                            <ChevronDown size={14} className="text-ink/50" />
                        </button>
                        {langOpen && (
                            <div className="absolute end-0 top-full z-10 mt-2 w-36 rounded-xl border border-line bg-white shadow-lg">
                                {LANGUAGES.map((l) => (
                                    <button
                                        key={l.code}
                                        onClick={() => {
                                            setLang(l);
                                            setLangOpen(false);
                                        }}
                                        className="block w-full px-4 py-2.5 text-start font-mono text-sm text-ink/80 hover:bg-paper"
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        aria-label="الوضع الليلي"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink/80 shadow-sm transition-all hover:border-steel"
                    >
                        <Moon size={18} />
                    </button>

                    <button className="flex items-center gap-2.5 rounded-full bg-ink px-7 py-2.5 font-display text-sm font-bold text-white shadow-sm transition-all hover:bg-steel">
                        <User size={16} />
                        دخول
                    </button>
                </div>
            </div>
        </header>
    );
}