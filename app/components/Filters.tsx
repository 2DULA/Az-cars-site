"use client";

import { translateSearchTerm } from "@/lib/carBrandTranslations";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { arLabel } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { dictionary } from "@/lib/i18n/dictionary";
import { ChevronDown } from "lucide-react";

const BODY_TYPES = [
  "sedan",
  "suv",
  "hatchback",
  "coupe",
  "convertible",
  "wagon",
  "pickup",
  "van",
  "crossover",
];
const FUEL_TYPES = ["gasoline", "diesel", "hybrid", "electric", "lpg"];
const TRANSMISSIONS = ["auto", "manual", "cvt", "dct"];

export default function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const { lang } = useLanguage();
  const t = dictionary[lang as keyof typeof dictionary].filters;

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [open, setOpen] = useState(false);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function toggleBoolean(key: string) {
    const current = searchParams.get(key);
    updateParam(key, current === "true" ? null : "true");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl border border-line bg-paper/60 px-5 py-3 font-display text-sm font-bold text-ink lg:hidden"
      >
        {t.search}
        <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <aside className={`${open ? "block" : "hidden"} lg:block w-full shrink-0 rounded-2xl border border-line bg-paper/60 p-6 backdrop-blur-md lg:w-64`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("search", translateSearchTerm(search));
        }}
        className="mb-5"
      >
        <label className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60">
          {t.search}
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-xl border border-line bg-paper/40 px-4 py-3 text-sm text-ink outline-none transition-all hover:border-steel/50 focus:border-steel focus:bg-paper focus:ring-2 focus:ring-steel/10 placeholder:text-ink/40"
        />
      </form>

      <FilterSelect
        label={t.bodyType}
        allLabel={t.any}
        param="body_type"
        options={BODY_TYPES}
        searchParams={searchParams}
        onChange={updateParam}
      />
      <FilterSelect
        label={t.fuelType}
        allLabel={t.any}
        param="fuel_type"
        options={FUEL_TYPES}
        searchParams={searchParams}
        onChange={updateParam}
      />
      <FilterSelect
        label={t.transmission}
        allLabel={t.any}
        param="transmission"
        options={TRANSMISSIONS}
        searchParams={searchParams}
        onChange={updateParam}
      />

      <div className="mb-5">
        <label className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60">
          {t.priceRange}
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t.min}
            defaultValue={searchParams.get("min_price") || ""}
            onBlur={(e) => updateParam("min_price", e.target.value)}
            className="w-1/2 rounded-xl border border-line bg-paper/40 px-3 py-3 text-sm text-ink outline-none transition-all hover:border-steel/50 focus:border-steel focus:bg-paper focus:ring-2 focus:ring-steel/10 placeholder:text-ink/40"
          />
          <input
            type="number"
            placeholder={t.max}
            defaultValue={searchParams.get("max_price") || ""}
            onBlur={(e) => updateParam("max_price", e.target.value)}
            className="w-1/2 rounded-xl border border-line bg-paper/40 px-3 py-3 text-sm text-ink outline-none transition-all hover:border-steel/50 focus:border-steel focus:bg-paper focus:ring-2 focus:ring-steel/10 placeholder:text-ink/40"
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60">
          {t.yearRange}
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t.min}
            defaultValue={searchParams.get("min_year") || ""}
            onBlur={(e) => updateParam("min_year", e.target.value)}
            className="w-1/2 rounded-xl border border-line bg-paper/40 px-3 py-3 text-sm text-ink outline-none transition-all hover:border-steel/50 focus:border-steel focus:bg-paper focus:ring-2 focus:ring-steel/10 placeholder:text-ink/40"
          />
          <input
            type="number"
            placeholder={t.max}
            defaultValue={searchParams.get("max_year") || ""}
            onBlur={(e) => updateParam("max_year", e.target.value)}
            className="w-1/2 rounded-xl border border-line bg-paper/40 px-3 py-3 text-sm text-ink outline-none transition-all hover:border-steel/50 focus:border-steel focus:bg-paper focus:ring-2 focus:ring-steel/10 placeholder:text-ink/40"
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-line/60 pt-5">
        <ToggleRow
          label={t.accidentFree}
          active={searchParams.get("has_accident") === "false"}
          onClick={() =>
            updateParam(
              "has_accident",
              searchParams.get("has_accident") === "false" ? null : "false"
            )
          }
        />
        <ToggleRow
          label={t.inspectionPassed}
          active={searchParams.get("inspection_passed") === "true"}
          onClick={() => toggleBoolean("inspection_passed")}
        />
        <ToggleRow
          label={t.belowMarket}
          active={searchParams.get("is_undervalued") === "true"}
          onClick={() => toggleBoolean("is_undervalued")}
        />
      </div>

      {isPending && (
        <p className="mt-4 font-mono text-[11px] text-steel animate-pulse">
          {t.updating}
        </p>
      )}

      <button
        type="button"
        onClick={() => router.push(pathname)}
        className="mt-6 w-full rounded-xl border border-line bg-transparent py-3 font-mono text-xs font-bold uppercase tracking-wider text-ink/70 transition-all hover:border-steel hover:bg-steel/5 hover:text-steel active:scale-[0.98]"
      >
        {t.clear}
      </button>
    </aside>
    </>
  );
}

function FilterSelect({
  label,
  allLabel,
  param,
  options,
  searchParams,
  onChange,
}: {
  label: string;
  allLabel: string;
  param: string;
  options: string[];
  searchParams: URLSearchParams;
  onChange: (key: string, value: string | null) => void;
}) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60">
        {label}
      </label>
      <select
        value={searchParams.get(param) || ""}
        onChange={(e) => onChange(param, e.target.value || null)}
        className="w-full appearance-none rounded-xl border border-line bg-paper/40 px-4 py-3 text-sm text-ink outline-none transition-all hover:border-steel/50 focus:border-steel focus:bg-paper focus:ring-2 focus:ring-steel/10"
      >
        <option value="">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {arLabel(opt)}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between text-right text-sm text-ink transition-colors hover:text-steel"
    >
      <span>{label}</span>
      <span
        className={`flex h-5 w-9 items-center rounded-full border transition-all duration-300 ${active ? "border-steel bg-steel" : "border-line bg-paper/40 group-hover:border-steel/50"
          }`}
      >
        <span
          className={`block h-3.5 w-3.5 rounded-full shadow-sm transition-transform duration-300 ${active
            ? "-translate-x-[18px] bg-white"
            : "translate-x-[2px] bg-ink/40 group-hover:bg-steel/60"
            }`}
        />
      </span>
    </button>
  );
}
