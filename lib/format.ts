// USD -> SAR uses a fixed approximate peg (SAR is pegged near 3.75 per USD).
// For a real client project, confirm whether they want a live exchange rate
// or a fixed markup rate instead.
const USD_TO_SAR = 3.75;

export function usdToSar(usd: number): number {
  return Math.round(usd * USD_TO_SAR);
}

export function formatSAR(usdValue: number): string {
  const sar = usdToSar(usdValue);
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(sar);
}

export function formatMileage(km: number): string {
  return `${new Intl.NumberFormat("ar-SA").format(km)} كم`;
}

// Arabic labels for the enum values returned by the Carapis API.
// Falls back to the raw value (title-cased) if not found here.
const AR_LABELS: Record<string, string> = {
  // fuel_type
  gasoline: "بنزين",
  diesel: "ديزل",
  hybrid: "هايبرد",
  plug_hybrid: "هايبرد قابل للشحن",
  electric: "كهربائي",
  hydrogen: "هيدروجين",
  cng: "غاز طبيعي",
  lpg: "غاز مسال",
  other: "أخرى",
  unknown: "غير معروف",
  // transmission
  manual: "يدوي",
  auto: "أوتوماتيك",
  cvt: "CVT",
  semi_auto: "نصف أوتوماتيك",
  dct: "DCT",
  // body_type
  sedan: "سيدان",
  hatchback: "هاتشباك",
  coupe: "كوبيه",
  convertible: "كشف",
  suv: "دفع رباعي",
  wagon: "ستيشن",
  pickup: "بيك أب",
  van: "فان",
  minivan: "ميني فان",
  crossover: "كروس أوفر",
  truck: "شاحنة",
  bus: "حافلة",
  // color
  white: "أبيض",
  black: "أسود",
  gray: "رمادي",
  silver: "فضي",
  red: "أحمر",
  blue: "أزرق",
  yellow: "أصفر",
  green: "أخضر",
  brown: "بني",
  purple: "بنفسجي",
  orange: "برتقالي",
  pink: "وردي",
  gold: "ذهبي",
  beige: "بيج",
  // drive_type
  fwd: "دفع أمامي",
  rwd: "دفع خلفي",
  awd: "دفع رباعي كامل",
  "4wd": "دفع رباعي",
};

export function arLabel(value: string): string {
  if (!value) return "—";
  return AR_LABELS[value.toLowerCase()] || titleCase(value);
}

export function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
