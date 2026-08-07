"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type Currency = "SAR" | "USD" | "AED" | "EGP";

const CurrencyContext = createContext<{
    currency: Currency;
    setCurrency: (c: Currency) => void;
}>({ currency: "SAR", setCurrency: () => { } });

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>("SAR");
    const router = useRouter();

    useEffect(() => {
        const saved = getCookie("currency") as Currency | null;
        if (saved && ["SAR", "USD", "AED", "EGP"].includes(saved)) {
            setCurrencyState(saved);
        }
    }, []);

    function setCurrency(c: Currency) {
        setCurrencyState(c);
        document.cookie = `currency=${c}; path=/; max-age=31536000`;
        router.refresh();
    }

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    return useContext(CurrencyContext);
}