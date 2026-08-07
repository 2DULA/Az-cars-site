"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Calculator } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCurrency } from "@/lib/currency/CurrencyContext";


const IMPORT_COST_CONFIG = {
    customsDutyRate: 0.05, // 5%
    vatRate: 0.15, // 15%, applied to (carPrice + shipping + customsDuty)
    shippingFlatUsd: 2453, // ~9,200 SAR at 3.75 peg, placeholder
    clearanceFlatUsd: 400, // ~1,500 SAR placeholder
    inspectionFlatUsd: 133, // ~500 SAR placeholder
    platesAndRegistrationFlatUsd: 267, // ~1,000 SAR placeholder
    agentFeeFlatUsd: 533, // ~2,000 SAR placeholder
};

const STRINGS = {
    ar: {
        buttonLabel: "احسب تكلفة الاستيراد",
        modalTitle: "حاسبة تكلفة الاستيراد",
        destination: "الوجهة",
        destinationValue: "السعودية SA",
        carPrice: "سعر السيارة",
        shipping: "الشحن (كوريا ← الوجهة)",
        customsDuty: "الرسوم الجمركية (٥٪)",
        vat: "ضريبة القيمة المضافة (١٥٪)",
        clearance: "التخليص الجمركي",
        inspection: "الفحص",
        plates: "اللوحات والاستمارة",
        agentFee: "عمولة الوكيل",
        total: "الإجمالي التقديري",
        disclaimer1:
            "آلية الاحتساب: تُحتسب الرسوم الجمركية (٥٪) على قيمة السيارة + الشحن، ثم تُحتسب ضريبة القيمة المضافة (١٥٪) على الإجمالي شاملًا الرسوم الجمركية وفقًا لنظام الجمارك السعودي.",
        disclaimer2:
            "* القيم تقديرية وقد تختلف حسب سعر الصرف والوزن وشركة الشحن واللوائح الجمركية. ليست عرض سعر ملزم.",
    },
    en: {
        buttonLabel: "Estimate Import Cost",
        modalTitle: "Import Cost Calculator",
        destination: "Destination",
        destinationValue: "Saudi Arabia (SA)",
        carPrice: "Car Price",
        shipping: "Shipping (Korea → Destination)",
        customsDuty: "Customs Duty (5%)",
        vat: "VAT (15%)",
        clearance: "Customs Clearance",
        inspection: "Inspection",
        plates: "Plates & Registration",
        agentFee: "Agent Fee",
        total: "Estimated Total",
        disclaimer1:
            "How it's calculated: customs duty (5%) is applied to the car price + shipping, then VAT (15%) is applied to the total including customs duty, per Saudi customs regulations.",
        disclaimer2:
            "* Figures are estimates and may vary by exchange rate, weight, shipping carrier, and customs regulations. Not a binding quote.",
    },
};

interface ImportCostCalculatorProps {
    carPriceUsd: number;
    lang: "ar" | "en";
}

export default function ImportCostCalculator({
    carPriceUsd,
    lang,
}: ImportCostCalculatorProps) {
    const [open, setOpen] = useState(false);
    const { currency } = useCurrency();
    const t = STRINGS[lang];
    const isRtl = lang === "ar";

    const shipping = IMPORT_COST_CONFIG.shippingFlatUsd;
    const customsDuty = (carPriceUsd + shipping) * IMPORT_COST_CONFIG.customsDutyRate;
    const vat = (carPriceUsd + shipping + customsDuty) * IMPORT_COST_CONFIG.vatRate;
    const clearance = IMPORT_COST_CONFIG.clearanceFlatUsd;
    const inspection = IMPORT_COST_CONFIG.inspectionFlatUsd;
    const plates = IMPORT_COST_CONFIG.platesAndRegistrationFlatUsd;
    const agentFee = IMPORT_COST_CONFIG.agentFeeFlatUsd;

    const total =
        carPriceUsd + shipping + customsDuty + vat + clearance + inspection + plates + agentFee;

    const rows = [
        { label: t.carPrice, value: carPriceUsd },
        { label: t.shipping, value: shipping },
        { label: t.customsDuty, value: customsDuty },
        { label: t.vat, value: vat },
        { label: t.clearance, value: clearance },
        { label: t.inspection, value: inspection },
        { label: t.plates, value: plates },
        { label: t.agentFee, value: agentFee },
    ];

    const modal = open ? (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setOpen(false)}
        >
            <div
                dir={isRtl ? "rtl" : "ltr"}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-paper shadow-xl"
            >
                <div className="sticky top-0 flex items-center justify-between border-b border-line bg-paper px-6 py-4">
                    <h2 className="font-display text-lg font-bold text-ink">
                        {t.modalTitle}
                    </h2>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5">
                    <p className="mb-1 text-sm font-semibold text-ink/70">
                        {t.destination}
                    </p>
                    <p className="mb-5 font-bold text-ink">{t.destinationValue}</p>

                    <div className="space-y-3">
                        {rows.map((row) => (
                            <div
                                key={row.label}
                                className="flex items-center justify-between border-b border-line pb-3 last:border-0"
                            >
                                <span className="text-sm text-ink/70">{row.label}</span>
                                <span className="font-bold text-ink" suppressHydrationWarning>
                                    {formatPrice(row.value, currency, lang)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-xl border border-line bg-ink/5 p-4">
                        <span className="font-display text-sm font-bold text-ink">
                            {t.total}
                        </span>
                        <span
                            className="font-display text-xl font-bold text-ink"
                            suppressHydrationWarning
                        >
                            {formatPrice(total, currency, lang)}
                        </span>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-ink/50">
                        {t.disclaimer1}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-ink/50">
                        {t.disclaimer2}
                    </p>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-ink/5 py-3 px-4 font-bold text-ink transition-colors hover:bg-ink/10"
            >
                <Calculator size={18} />
                {t.buttonLabel}
            </button>

            {typeof document !== "undefined" && modal
                ? createPortal(modal, document.body)
                : null}
        </>
    );
}