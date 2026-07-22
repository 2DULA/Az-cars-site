"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LineChart, BadgeCheck, Search, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { dictionary } from "@/lib/i18n/dictionary";

// TypeScript types for our data
type LocalizedItem = {
  id: string;
  en: string;
  ar: string;
  [key: string]: string; // Allows indexing dynamically with lang (e.g., brand[lang])
};

type CarData = {
  brands: LocalizedItem[];
  models: Record<string, LocalizedItem[]>;
  years: string[];
};

// Mock data
const CAR_DATA: CarData = {
  brands: [
    { id: "hyundai", en: "Hyundai", ar: "هيونداي" },
    { id: "kia", en: "Kia", ar: "كيا" },
    { id: "genesis", en: "Genesis", ar: "جينيسيس" },
    { id: "toyota", en: "Toyota", ar: "تويوتا" },
    { id: "mercedes", en: "Mercedes-Benz", ar: "مرسيدس بنز" },
  ],
  models: {
    hyundai: [
      { id: "elantra", en: "Elantra", ar: "إلنترا" },
      { id: "sonata", en: "Sonata", ar: "سوناتا" },
      { id: "tucson", en: "Tucson", ar: "توسان" },
    ],
    kia: [
      { id: "k5", en: "K5", ar: "كي 5" },
      { id: "sorento", en: "Sorento", ar: "سورينتو" },
      { id: "sportage", en: "Sportage", ar: "سبورتج" },
    ],
    genesis: [
      { id: "g80", en: "G80", ar: "جي 80" },
      { id: "gv80", en: "GV80", ar: "جي في 80" },
    ],
    toyota: [
      { id: "camry", en: "Camry", ar: "كامري" },
      { id: "land-cruiser", en: "Land Cruiser", ar: "لاند كروزر" },
    ],
    mercedes: [
      { id: "e-class", en: "E-Class", ar: "إي كلاس" },
      { id: "s-class", en: "S-Class", ar: "إس كلاس" },
    ],
  },
  years: ["2026", "2025", "2024", "2023", "2022", "2021", "2020"]
};

// Define literal types for the dropdown variants
type DropdownType = 'brand' | 'model' | 'year' | null;

export default function Home() {
  const { lang } = useLanguage();
  const t = dictionary[lang as keyof typeof dictionary].home;
  const isRtl = lang === "ar";

  const router = useRouter();

  // Search States
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<LocalizedItem | null>(null);
  const [selectedModel, setSelectedModel] = useState<LocalizedItem | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // UI Dropdown Visibility State
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

  const searchUi = {
    tabs: {
      all: isRtl ? "الكل" : "All",
      direct: isRtl ? "بيع مباشر" : "Direct Sale",
      auction: isRtl ? "مزاد" : "Auction"
    },
    placeholders: {
      brand: isRtl ? "جميع البراندات" : "All Brands",
      model: isRtl ? "جميع الموديلات" : "All Models",
      year: isRtl ? "سنة الصنع" : "Year",
      searchBtn: isRtl ? "بحث" : "Search"
    }
  };

  const toggleDropdown = (type: DropdownType) => {
    if (openDropdown === type) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(type);
    }
  };

  const handleBrandSelect = (brand: LocalizedItem) => {
    setSelectedBrand(brand);
    setSelectedModel(null); // Reset model if brand changes
    setOpenDropdown(null);
  };

  const handleModelSelect = (model: LocalizedItem) => {
    setSelectedModel(model);
    setOpenDropdown(null);
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setOpenDropdown(null);
  };

  const handleSearchSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Auction tab sends the user to the auctions page instead of /cars
    if (activeTab === "auction") {
      router.push("/auctions");
      return;
    }

    const params = new URLSearchParams();

    if (selectedBrand) {
      params.set("brand", selectedBrand.id);
    }
    if (selectedModel) {
      params.set("model", selectedModel.id);
    }
    if (selectedYear) {
      params.set("min_year", selectedYear);
      params.set("max_year", selectedYear);
    }

    const queryString = params.toString();
    const targetUrl = `/cars${queryString ? `?${queryString}` : ""}`;

    router.push(targetUrl);
  };
  const availableModels = selectedBrand ? CAR_DATA.models[selectedBrand.id] : [];

  return (
    <main dir={isRtl ? "rtl" : "ltr"}>

      {openDropdown && (
        <div
          className="fixed inset-0 z-10 bg-transparent"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      <section className="relative z-20 bg-gradient-to-b from-paper to-paper/40">

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-steel/5 blur-3xl" />
          <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-amber/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-32 pt-36 text-center lg:px-8">

          <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.2] text-ink lg:text-7xl tracking-tight">
            {t.heroLine1} <br className="hidden sm:block" />
            <span className="text-ink">{t.heroLine2}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/75">
            {t.heroSubtitle}
          </p>

          <div className="mt-20 w-full max-w-5xl px-2">

            <div className="flex justify-center gap-12 mb-8 font-mono text-base md:text-lg font-bold tracking-wide uppercase">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-3 border-b-2 transition-all ${activeTab === 'all' ? 'border-steel text-steel' : 'border-transparent text-ink/40 hover:text-ink'}`}
              >
                {searchUi.tabs.all}
              </button>
              <button
                onClick={() => setActiveTab('direct')}
                className={`pb-3 border-b-2 transition-all ${activeTab === 'direct' ? 'border-steel text-steel' : 'border-transparent text-ink/40 hover:text-ink'}`}
              >
                {searchUi.tabs.direct}
              </button>
              <button
                onClick={() => setActiveTab('auction')}
                className={`pb-3 border-b-2 transition-all ${activeTab === 'auction' ? 'border-steel text-steel' : 'border-transparent text-ink/40 hover:text-ink'}`}
              >
                {searchUi.tabs.auction}
              </button>
            </div>

            <div className="relative z-50 bg-paper border-2 border-line rounded-[2rem] md:rounded-full p-3 flex flex-col md:flex-row items-center w-full shadow-2xl transition-all">

              {/* BRAND DROPDOWN SELECTOR */}
              <div className="relative w-full md:flex-1">
                <div
                  onClick={() => toggleDropdown('brand')}
                  className="w-full flex items-center justify-between px-8 py-5 border-b md:border-b-0 md:border-e border-line cursor-pointer group text-ink/80 hover:text-ink transition-colors"
                >
                  <div className="flex flex-col items-start text-start">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-steel/60 mb-0.5">{isRtl ? "الماركة" : "Brand"}</span>
                    <span className="text-base font-bold md:text-lg">{selectedBrand ? selectedBrand[lang] : searchUi.placeholders.brand}</span>
                  </div>
                  <ChevronDown size={20} className={`text-steel/60 transition-transform duration-200 ${openDropdown === 'brand' ? 'rotate-180' : ''}`} />
                </div>

                {openDropdown === 'brand' && (
                  <div className="absolute top-[105%] start-0 w-full md:w-72 mt-2 bg-paper border border-line rounded-2xl shadow-xl max-h-64 overflow-y-auto z-50 p-2 text-start animate-in fade-in slide-in-from-top-2 duration-150">
                    {CAR_DATA.brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandSelect(brand)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-ink rounded-xl hover:bg-line/40 transition-colors text-start"
                      >
                        <span>{brand[lang]}</span>
                        {selectedBrand?.id === brand.id && <Check size={16} className="text-steel" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative w-full md:flex-1">
                <div
                  onClick={() => toggleDropdown('model')}
                  className={`w-full flex items-center justify-between px-8 py-5 border-b md:border-b-0 md:border-e border-line cursor-pointer group text-ink/80 hover:text-ink transition-colors ${!selectedBrand ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-start text-start">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-steel/60 mb-0.5">{isRtl ? "الموديل" : "Model"}</span>
                    <span className="text-base font-bold md:text-lg">{selectedModel ? selectedModel[lang] : searchUi.placeholders.model}</span>
                  </div>
                  <ChevronDown size={20} className={`text-steel/60 transition-transform duration-200 ${openDropdown === 'model' ? 'rotate-180' : ''}`} />
                </div>

                {openDropdown === 'model' && selectedBrand && (
                  <div className="absolute top-[105%] start-0 w-full md:w-72 mt-2 bg-paper border border-line rounded-2xl shadow-xl max-h-64 overflow-y-auto z-50 p-2 text-start animate-in fade-in slide-in-from-top-2 duration-150">
                    {availableModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelSelect(model)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-ink rounded-xl hover:bg-line/40 transition-colors text-start"
                      >
                        <span>{model[lang]}</span>
                        {selectedModel?.id === model.id && <Check size={16} className="text-steel" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative w-full md:flex-1">
                <div
                  onClick={() => toggleDropdown('year')}
                  className="w-full flex items-center justify-between px-8 py-5 cursor-pointer group text-ink/80 hover:text-ink transition-colors"
                >
                  <div className="flex flex-col items-start text-start">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-steel/60 mb-0.5">{isRtl ? "السنة" : "Year"}</span>
                    <span className="text-base font-bold md:text-lg">{selectedYear ? selectedYear : searchUi.placeholders.year}</span>
                  </div>
                  <ChevronDown size={20} className={`text-steel/60 transition-transform duration-200 ${openDropdown === 'year' ? 'rotate-180' : ''}`} />
                </div>

                {openDropdown === 'year' && (
                  <div className="absolute top-[105%] start-0 w-full md:w-48 mt-2 bg-paper border border-line rounded-2xl shadow-xl max-h-64 overflow-y-auto z-50 p-2 text-start animate-in fade-in slide-in-from-top-2 duration-150">
                    {CAR_DATA.years.map((year) => (
                      <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-ink rounded-xl hover:bg-line/40 transition-colors text-start"
                      >
                        <span>{year}</span>
                        {selectedYear === year && <Check size={16} className="text-steel" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SEARCH SUBMIT BUTTON */}
              <button
                onClick={handleSearchSubmit}
                className="w-full md:w-auto mt-4 md:mt-0 flex items-center justify-center gap-3 rounded-2xl md:rounded-full bg-steel hover:bg-ink text-white hover:text-paper px-10 py-5 font-mono text-base font-bold transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl shrink-0"
              >
                <Search size={22} strokeWidth={2.5} />
                {searchUi.placeholders.searchBtn}
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-line bg-paper/50">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-ink">{t.whyTitle}</h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Feature
              icon={<ShieldCheck size={28} />}
              title={t.feature1Title}
              body={t.feature1Body}
            />
            <Feature
              icon={<LineChart size={28} />}
              title={t.feature2Title}
              body={t.feature2Body}
            />
            <Feature
              icon={<BadgeCheck size={28} />}
              title={t.feature3Title}
              body={t.feature3Body}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-steel/30 hover:shadow-md">
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-line bg-line/30 text-steel">
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-ink/70">{body}</p>
    </div>
  );
}