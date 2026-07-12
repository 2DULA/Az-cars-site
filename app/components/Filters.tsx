"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { arLabel } from "@/lib/format";

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

  const [search, setSearch] = useState(searchParams.get("search") || "");

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
    <aside className="w-full shrink-0 border border-line bg-white p-5 lg:w-64">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("search", search);
        }}
        className="mb-5"
      >
        <label className="mb-1 block font-mono text-[11px] text-ink/60">
          بحث
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="الماركة، الموديل، الفئة..."
          className="w-full border border-line px-3 py-2 text-sm outline-none focus:border-steel"
        />
      </form>

      <FilterSelect
        label="نوع الهيكل"
        param="body_type"
        options={BODY_TYPES}
        searchParams={searchParams}
        onChange={updateParam}
      />
      <FilterSelect
        label="نوع الوقود"
        param="fuel_type"
        options={FUEL_TYPES}
        searchParams={searchParams}
        onChange={updateParam}
      />
      <FilterSelect
        label="ناقل الحركة"
        param="transmission"
        options={TRANSMISSIONS}
        searchParams={searchParams}
        onChange={updateParam}
      />

      <div className="mb-5">
        <label className="mb-1 block font-mono text-[11px] text-ink/60">
          السعر (ريال سعودي)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="من"
            defaultValue={searchParams.get("min_price") || ""}
            onBlur={(e) => updateParam("min_price", e.target.value)}
            className="w-1/2 border border-line px-2 py-2 text-sm outline-none focus:border-steel"
          />
          <input
            type="number"
            placeholder="إلى"
            defaultValue={searchParams.get("max_price") || ""}
            onBlur={(e) => updateParam("max_price", e.target.value)}
            className="w-1/2 border border-line px-2 py-2 text-sm outline-none focus:border-steel"
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="mb-1 block font-mono text-[11px] text-ink/60">
          سنة الصنع
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="من"
            defaultValue={searchParams.get("min_year") || ""}
            onBlur={(e) => updateParam("min_year", e.target.value)}
            className="w-1/2 border border-line px-2 py-2 text-sm outline-none focus:border-steel"
          />
          <input
            type="number"
            placeholder="إلى"
            defaultValue={searchParams.get("max_year") || ""}
            onBlur={(e) => updateParam("max_year", e.target.value)}
            className="w-1/2 border border-line px-2 py-2 text-sm outline-none focus:border-steel"
          />
        </div>
      </div>

      <div className="space-y-2 border-t border-line pt-4">
        <ToggleRow
          label="بدون حوادث فقط"
          active={searchParams.get("has_accident") === "false"}
          onClick={() =>
            updateParam(
              "has_accident",
              searchParams.get("has_accident") === "false" ? null : "false"
            )
          }
        />
        <ToggleRow
          label="اجتازت الفحص"
          active={searchParams.get("inspection_passed") === "true"}
          onClick={() => toggleBoolean("inspection_passed")}
        />
        <ToggleRow
          label="أقل من سعر السوق"
          active={searchParams.get("is_undervalued") === "true"}
          onClick={() => toggleBoolean("is_undervalued")}
        />
      </div>

      {isPending && (
        <p className="mt-4 font-mono text-[11px] text-steel">
          جاري التحديث…
        </p>
      )}

      <button
        type="button"
        onClick={() => router.push(pathname)}
        className="mt-5 w-full border border-ink py-2 font-mono text-xs uppercase tracking-wide hover:bg-ink hover:text-paper"
      >
        مسح الفلاتر
      </button>
    </aside>
  );
}

function FilterSelect({
  label,
  param,
  options,
  searchParams,
  onChange,
}: {
  label: string;
  param: string;
  options: string[];
  searchParams: URLSearchParams;
  onChange: (key: string, value: string | null) => void;
}) {
  return (
    <div className="mb-5">
      <label className="mb-1 block font-mono text-[11px] text-ink/60">
        {label}
      </label>
      <select
        value={searchParams.get(param) || ""}
        onChange={(e) => onChange(param, e.target.value || null)}
        className="w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-steel"
      >
        <option value="">الكل</option>
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
      className="flex w-full items-center justify-between text-right text-sm"
    >
      <span>{label}</span>
      <span
        className={`h-4 w-8 rounded-full border border-ink transition-colors ${
          active ? "bg-amber" : "bg-white"
        }`}
      >
        <span
          className={`block h-3.5 w-3.5 translate-y-[1px] rounded-full bg-ink transition-transform ${
            active ? "-translate-x-4" : "translate-x-[1px]"
          }`}
        />
      </span>
    </button>
  );
}
