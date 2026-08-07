"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LineChart, BadgeCheck, Search, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { dictionary } from "@/lib/i18n/dictionary";
import { BRAND_TRANSLATIONS } from "@/lib/carBrandTranslations";
import { motion } from "framer-motion";

type BrandItem = {
  id: string;
  brand_name: string;
  count: number;
};

// Build English → Arabic brand name lookup
const EN_TO_AR_BRAND: Record<string, string> = {};
for (const [ar, en] of Object.entries(BRAND_TRANSLATIONS)) {
  EN_TO_AR_BRAND[en] = ar;
}
const KNOWN_AR_NAMES: Record<string, string> = {
  Hyundai: "هيونداي",
  Kia: "كيا",
  Genesis: "جينيسيس",
  Toyota: "تويوتا",
  "Mercedes-Benz": "مرسيدس بنز",
  BMW: "بي إم دبليو",
  Audi: "أودي",
  Lexus: "لكزس",
  Nissan: "نيسان",
  Honda: "هوندا",
  Ford: "فورد",
  Chevrolet: "شيفروليه",
  Volkswagen: "فولكس واجن",
  Porsche: "بورش",
  "Range Rover": "رنج روفر",
  "Land Rover": "لاند روفر",
  Jeep: "جيب",
  Mazda: "مازدا",
  Mitsubishi: "ميتسوبيشي",
  Suzuki: "سوزوكي",
  SsangYong: "سانج يونج",
  "KG Mobility": "كي جي موبيليتي",
  Renault: "رينو",
  Volvo: "فولفو",
  MINI: "ميني كوبر",
  Fiat: "فيات",
  Lincoln: "لينكولن",
  Jaguar: "جاكوار",
  Abarth: "أبارث",
  Tesla: "تسلا",
  Peugeot: "بيجو",
  "Citroën": "سيتروين",
  Citroen: "سيتروين",
  Skoda: "سكودا",
  "Alfa Romeo": "ألفا روميو",
  "Renault Korea": "رينو كوريا",
  Scania: "سكانيا",
  Seat: "سيات",
  Subaru: "سوبارو",
  Opel: "أوبل",
  GMC: "جي إم سي",
  Ram: "رام",
  DS: "دي إس",
  Infiniti: "إنفينيتي",
  Chrysler: "كرايسلر",
  Cadillac: "كاديلاك",
  Daihatsu: "دايهاتسو",
  BYD: "بي واي دي",
  Dacia: "داسيا",
  Isuzu: "إيسوزو",
  Vinfast: "فينفاست",
  Hino: "هينو",
  Smart: "سمارت",
  MG: "إم جي",
  Neta: "نيتا",
  Cupra: "كوبرا",
  Changan: "شانجان",
  Maserati: "مازيراتي",
  Dodge: "دودج",
  Buick: "بويك",
  Daewoo: "دايو",
  Foton: "فوتون",
  Polestar: "بولستار",
  Proton: "بروتون",
  Mercury: "ميركوري",
  Ferrari: "فيراري",
  Geely: "جيلي",
  Bentley: "بنتلي",
  "Daewoo Bus": "دايو باص",
};
for (const [en, ar] of Object.entries(KNOWN_AR_NAMES)) {
  EN_TO_AR_BRAND[en] = ar;
}
function brandArName(enName: string): string {
  if (EN_TO_AR_BRAND[enName]) return EN_TO_AR_BRAND[enName];
  const normalized = enName
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  return EN_TO_AR_BRAND[normalized] || KNOWN_AR_NAMES[enName] || KNOWN_AR_NAMES[normalized] || enName;
}

function brandDisplay(brand: BrandItem, lang: string): string {
  if (lang === "ar") return brandArName(brand.brand_name);
  return brand.brand_name;
}

type LocalizedItem = {
  id: string;
  en: string;
  ar: string;
  [key: string]: string;
};

type CarData = {
  brands: LocalizedItem[];
  models: Record<string, LocalizedItem[]>;
  years: string[];
};

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
      { id: "sportage", en: "سبورتج", ar: "سبورتج" },
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
  years: [
    "2026", "2025", "2024", "2023", "2022", "2021", "2020",
    "2019", "2018", "2017", "2016", "2015", "2014", "2013",
    "2012", "2011", "2010", "2009", "2008", "2007", "2006", "2005",
  ]
};

type DropdownType = 'brand' | 'model' | 'year' | null;

export default function Home() {
  const { lang } = useLanguage();
  const t = dictionary[lang as keyof typeof dictionary].home;
  const isRtl = lang === "ar";

  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<BrandItem | null>(null);
  const [selectedModel, setSelectedModel] = useState<LocalizedItem | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const [brands, setBrands] = useState<BrandItem[]>([]);

  const searchConsoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then(setBrands)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!openDropdown) return;
    function handleClickOutside(e: MouseEvent) {
      if (searchConsoleRef.current && !searchConsoleRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

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
    if (openDropdown === type) setOpenDropdown(null);
    else setOpenDropdown(type);
  };

  const handleBrandSelect = (brand: BrandItem) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
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
    const params = new URLSearchParams();
    if (selectedBrand) params.set("brand", selectedBrand.id);
    if (selectedYear) {
      params.set("min_year", selectedYear);
      params.set("max_year", selectedYear);
    }
    const queryString = params.toString();

    if (activeTab === "auction") {
      router.push(`/auctions${queryString ? `?${queryString}` : ""}`);
      return;
    }
    if (selectedModel) params.set("model", selectedModel.id);
    router.push(`/cars${queryString ? `?${queryString}` : ""}`);
  };

  const availableModels = selectedBrand ? (CAR_DATA.models[selectedBrand.id] || []) : [];

  return (
    <main dir={isRtl ? "rtl" : "ltr"} className="relative min-h-screen w-full">

      <div key={lang} className="fixed inset-0 w-full h-full overflow-hidden -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
        >
          <source src="/car-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90 mix-blend-multiply" />
      </div>

      {/* HERO SECTION */}
      <section className="relative z-50 min-h-screen w-full flex flex-col justify-center">
        <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center lg:px-8">

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mt-6 max-w-4xl font-display text-4xl sm:text-5xl font-bold leading-[1.15] text-white lg:text-7xl tracking-tight drop-shadow-xl"
          >
            {t.heroLine1} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{t.heroLine2}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-white/80 font-medium tracking-wide"
          >
            {t.heroSubtitle}
          </motion.p>

          <div className="mt-14 w-full max-w-5xl px-2">

          {/* SEGMENTED CONTROL TABS */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex justify-center mb-8 bg-white/15 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-2xl"
            >
              {[
                { id: 'all', label: searchUi.tabs.all },
                { id: 'direct', label: searchUi.tabs.direct },
                { id: 'auction', label: searchUi.tabs.auction }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-2.5 rounded-full font-mono text-sm md:text-base font-bold uppercase tracking-wider transition-colors duration-300 ${
                    activeTab === tab.id 
                      ? "text-slate-900 dark:text-white" 
                      : "text-white hover:text-white/80 dark:text-white/60 dark:hover:text-white"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="active-tab-indicator"
                      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-md z-0" 
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </motion.div>

            {/* FLOATING ISLAND SEARCH CONSOLE */}
            <motion.div
              ref={searchConsoleRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative z-10 bg-paper/80 backdrop-blur-2xl border border-ink/10 rounded-[2.5rem] md:rounded-full p-2.5 flex flex-col md:flex-row items-center w-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all"
            >

              {/* BRAND DROPDOWN */}
              <div className="relative w-full md:flex-1">
                <div
                  onClick={() => toggleDropdown('brand')}
                  className="w-full flex items-center justify-between px-6 py-4 md:border-e border-line/40 cursor-pointer group hover:bg-black/5 rounded-3xl transition-all"
                >
                  <div className="flex flex-col items-start text-start">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-steel/70 mb-1">{isRtl ? "الماركة" : "Brand"}</span>
                    <span className="text-base font-bold md:text-lg text-ink">{selectedBrand ? brandDisplay(selectedBrand, lang) : searchUi.placeholders.brand}</span>
                  </div>
                  <ChevronDown size={18} className={`text-steel/70 transition-transform duration-300 ${openDropdown === 'brand' ? 'rotate-180' : ''}`} />
                </div>

                {openDropdown === 'brand' && (
                  <div className="absolute top-[120%] start-0 w-full md:w-72 mt-2 bg-paper/80 backdrop-blur-2xl border border-ink/10 rounded-3xl shadow-2xl max-h-72 overflow-y-auto custom-scrollbar z-[70] p-2 text-start animate-in fade-in slide-in-from-top-4 duration-200">
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        onMouseDown={(e) => { e.preventDefault(); handleBrandSelect(b); }}
                        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-ink rounded-2xl hover:bg-line/40 transition-all text-start group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform">{brandDisplay(b, lang)}</span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="rounded-full bg-steel/10 px-2 py-0.5 text-[11px] font-mono text-steel">{b.count}+</span>
                          {selectedBrand?.id === b.id && <Check size={16} className="text-steel" />}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* MODEL DROPDOWN */}
              <div className="relative w-full md:flex-1">
                <div
                  onClick={() => selectedBrand && toggleDropdown('model')}
                  className={`w-full flex items-center justify-between px-6 py-4 md:border-e border-line/40 group hover:bg-black/5 rounded-3xl transition-all ${!selectedBrand ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex flex-col items-start text-start">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-steel/70 mb-1">{isRtl ? "الموديل" : "Model"}</span>
                    <span className="text-base font-bold md:text-lg text-ink">{selectedModel ? selectedModel[lang] : searchUi.placeholders.model}</span>
                  </div>
                  <ChevronDown size={18} className={`text-steel/70 transition-transform duration-300 ${openDropdown === 'model' ? 'rotate-180' : ''}`} />
                </div>

                {openDropdown === 'model' && selectedBrand && (
                  <div className="absolute top-[120%] start-0 w-full md:w-72 mt-2 bg-paper/80 backdrop-blur-2xl border border-ink/10 rounded-3xl shadow-2xl max-h-72 overflow-y-auto custom-scrollbar z-[70] p-2 text-start animate-in fade-in slide-in-from-top-4 duration-200">
                    {availableModels.map((item) => (
                      <button
                        key={item.id}
                        onMouseDown={(e) => { e.preventDefault(); handleModelSelect(item); }}
                        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-ink rounded-2xl hover:bg-line/40 transition-all text-start group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform">{item[lang]}</span>
                        {selectedModel?.id === item.id && <Check size={16} className="text-steel" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* YEAR DROPDOWN */}
              <div className="relative w-full md:flex-1">
                <div
                  onClick={() => toggleDropdown('year')}
                  className="w-full flex items-center justify-between px-6 py-4 cursor-pointer group hover:bg-black/5 rounded-3xl transition-all"
                >
                  <div className="flex flex-col items-start text-start">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-steel/70 mb-1">{isRtl ? "السنة" : "Year"}</span>
                    <span className="text-base font-bold md:text-lg text-ink">{selectedYear ? selectedYear : searchUi.placeholders.year}</span>
                  </div>
                  <ChevronDown size={18} className={`text-steel/70 transition-transform duration-300 ${openDropdown === 'year' ? 'rotate-180' : ''}`} />
                </div>

                {openDropdown === 'year' && (
                  <div className="absolute top-[120%] start-0 w-full md:w-56 mt-2 bg-paper/80 backdrop-blur-2xl border border-ink/10 rounded-3xl shadow-2xl max-h-64 overflow-y-auto custom-scrollbar z-[70] p-2 text-start animate-in fade-in slide-in-from-top-4 duration-200">
                    {CAR_DATA.years.map((year) => (
                      <button
                        key={year}
                        onMouseDown={(e) => { e.preventDefault(); handleYearSelect(year); }}
                        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-ink rounded-2xl hover:bg-line/40 transition-colors text-start group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform">{year}</span>
                        {selectedYear === year && <Check size={16} className="text-steel" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SEARCH SUBMIT BUTTON */}
              <button
                onClick={handleSearchSubmit}
                className="w-full md:w-auto mt-2 md:mt-0 flex items-center justify-center gap-2 rounded-[2rem] md:rounded-full bg-gradient-to-r from-steel to-steel/90 hover:from-ink hover:to-ink text-white px-10 py-5 font-mono text-base font-bold transition-all duration-300 shadow-lg shadow-steel/30 hover:shadow-xl hover:-translate-y-0.5 shrink-0"
              >
                <Search size={20} strokeWidth={2.5} />
                {searchUi.placeholders.searchBtn}
              </button>

            </motion.div>
          </div>
        </div>
      </section>

      {/* OVERLAPPING FEATURES SECTION */}
      <section className="relative z-30 mx-auto max-w-6xl px-4 pb-32 pt-10 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md shadow-sm border border-white/20 text-xs font-mono font-bold text-white uppercase tracking-widest mb-4">
            {isRtl ? "المميزات" : "Benefits"}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{t.whyTitle}</h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Feature
            icon={<ShieldCheck size={26} strokeWidth={2} />}
            title={t.feature1Title}
            body={t.feature1Body}
            delay={0.1}
          />
          <Feature
            icon={<LineChart size={26} strokeWidth={2} />}
            title={t.feature2Title}
            body={t.feature2Body}
            delay={0.2}
          />
          <Feature
            icon={<BadgeCheck size={26} strokeWidth={2} />}
            title={t.feature3Title}
            body={t.feature3Body}
            delay={0.3}
          />
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, body, delay }: { icon: React.ReactNode; title: string; body: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-white/40 group"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-3xl transition-transform duration-500 group-hover:scale-150" />

      <div className="relative z-10 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-white/20 text-white shadow-sm border border-white/30 transition-all duration-500 group-hover:bg-white group-hover:text-ink">
        {icon}
      </div>
      <h3 className="relative z-10 font-display text-xl font-bold text-white transition-colors duration-300">{title}</h3>
      <p className="relative z-10 mt-3 text-base leading-relaxed text-white/70">{body}</p>
    </motion.div>
  );
}
