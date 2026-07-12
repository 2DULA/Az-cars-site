"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Lang = "ar" | "en";

const LanguageContext = createContext<{
    lang: Lang;
    setLang: (l: Lang) => void;
}>({ lang: "ar", setLang: () => { } });

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Lang>("ar");

    useEffect(() => {
        const saved = getCookie("lang") as Lang | null;
        if (saved === "en" || saved === "ar") setLangState(saved);
    }, []);

    function setLang(l: Lang) {
        setLangState(l);
        document.cookie = `lang=${l}; path=/; max-age=31536000`;
        document.documentElement.lang = l;
        document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    }

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    
    return useContext(LanguageContext);

}