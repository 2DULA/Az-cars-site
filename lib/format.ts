// USD -> SAR uses a fixed approximate peg (SAR is pegged near 3.75 per USD).
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

// Multi-currency support -----------------------------------------------

// Fixed approximate rates relative to USD. SAR and AED are pegged; EGP
// floats and should be updated periodically for accuracy.
const USD_RATES: Record<"SAR" | "USD" | "AED" | "EGP", number> = {
  USD: 1,
  SAR: 3.75,
  AED: 3.67,
  EGP: 49,
};

const CURRENCY_SYMBOLS: Record<"SAR" | "USD" | "AED" | "EGP", string> = {
  USD: "USD",
  SAR: "SAR",
  AED: "AED",
  EGP: "EGP",
};

export function formatPrice(
  usdValue: number,
  currency: "SAR" | "USD" | "AED" | "EGP",
  lang: "ar" | "en" = "ar"
): string {
  const rate = USD_RATES[currency];
  const converted = Math.round(usdValue * rate);
  const locale = lang === "ar" ? "ar-SA" : "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(converted);
  } catch {
    return `${new Intl.NumberFormat(locale).format(converted)} ${CURRENCY_SYMBOLS[currency]}`;
  }
}

export function formatMileage(km: number): string {
  return `${new Intl.NumberFormat("ar-SA").format(km)} كم`;
}

// Arabic labels for the enum values returned by the Carapis API.
const AR_LABELS: Record<string, string> = {
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
  manual: "يدوي",
  auto: "أوتوماتيك",
  cvt: "CVT",
  semi_auto: "نصف أوتوماتيك",
  dct: "DCT",
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
  fwd: "دفع أمامي",
  rwd: "دفع خلفي",
  awd: "دفع رباعي كامل",
  "4wd": "دفع رباعي",
};

// English labels for the same enum values.
const EN_LABELS: Record<string, string> = {
  gasoline: "Gasoline",
  diesel: "Diesel",
  hybrid: "Hybrid",
  plug_hybrid: "Plug-in Hybrid",
  electric: "Electric",
  hydrogen: "Hydrogen",
  cng: "CNG",
  lpg: "LPG",
  other: "Other",
  unknown: "Unknown",
  manual: "Manual",
  auto: "Automatic",
  cvt: "CVT",
  semi_auto: "Semi-Automatic",
  dct: "DCT",
  sedan: "Sedan",
  hatchback: "Hatchback",
  coupe: "Coupe",
  convertible: "Convertible",
  suv: "SUV",
  wagon: "Wagon",
  pickup: "Pickup",
  van: "Van",
  minivan: "Minivan",
  crossover: "Crossover",
  truck: "Truck",
  bus: "Bus",
  white: "White",
  black: "Black",
  gray: "Gray",
  silver: "Silver",
  red: "Red",
  blue: "Blue",
  yellow: "Yellow",
  green: "Green",
  brown: "Brown",
  purple: "Purple",
  orange: "Orange",
  pink: "Pink",
  gold: "Gold",
  beige: "Beige",
  fwd: "FWD",
  rwd: "RWD",
  awd: "AWD",
  "4wd": "4WD",
};

export function arLabel(value: string): string {
  if (!value) return "—";
  return AR_LABELS[value.toLowerCase()] || titleCase(value);
}

export function enumLabel(value: string, lang: "ar" | "en" = "ar"): string {
  if (!value) return "—";
  const map = lang === "en" ? EN_LABELS : AR_LABELS;
  return map[value.toLowerCase()] || titleCase(value);
}

export function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}