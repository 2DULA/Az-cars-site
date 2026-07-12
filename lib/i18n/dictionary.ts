export const dictionary = {
    ar: {
        nav: {
            home: "الرئيسية",
            cars: "السيارات",
            auctions: "المزادات",
            parts: "قطع غيار",
            about: "من نحن",
            contact: "تواصل",
            login: "دخول",
            logout: "خروج",
        },
        home: {
            eyebrow: "معرض العز العالمي",
            heroTitle: "بيع واستيراد السيارات، بثقة وشفافية.",
            heroSubtitle:
                "مخزون حي مصدره أكبر الأسواق الكورية — سجل فحص كامل، سجل الحوادث، وأسعار عادلة مقارنة بالسوق لكل سيارة.",
            browseCta: "تصفح السيارات",
            feature1Title: "حالة موثقة",
            feature1Body:
                "سجل الحوادث، حالة الفحص، وسجل الاستدعاءات متوفرة لكل سيارة قبل الشحن.",
            feature2Title: "تحليل عدالة السعر",
            feature2Body:
                "كل إعلان يُقارن بمبيعات مشابهة حتى تعرف بالضبط ما تدفعه مقابله.",
            feature3Title: "مصدر مباشر",
            feature3Body:
                "بيانات حية تُسحب مباشرة من الأسواق الكورية — بدون إعلانات قديمة أو وسطاء.",
        },
    },
    en: {
        nav: {
            home: "Home",
            cars: "Cars",
            auctions: "Auctions",
            parts: "Spare Parts",
            about: "About",
            contact: "Contact",
            login: "Sign in",
            logout: "Sign out",
        },
        home: {
            eyebrow: "AZ International",
            heroTitle: "Buying and importing cars, with trust and transparency.",
            heroSubtitle:
                "Live inventory sourced from Korea's largest marketplaces — full inspection history, accident records, and fair market pricing on every vehicle.",
            browseCta: "Browse Inventory",
            feature1Title: "Verified condition",
            feature1Body:
                "Accident history, inspection status, and recall records available for every vehicle before shipping.",
            feature2Title: "Fair price analysis",
            feature2Body:
                "Every listing is compared against similar sales, so you know exactly what you're paying for.",
            feature3Title: "Direct sourcing",
            feature3Body:
                "Live data pulled directly from Korean marketplaces — no stale listings, no middlemen.",
        },
    },
} as const;

export type Dictionary = typeof dictionary.ar;