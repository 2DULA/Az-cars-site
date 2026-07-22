
export const BRAND_TRANSLATIONS: Record<string, string> = {
  هيونداي: "Hyundai",
  كيا: "Kia",
  جينيسيس: "Genesis",
  تويوتا: "Toyota",
  مرسيدس: "Mercedes-Benz",
  "مرسيدس بنز": "Mercedes-Benz",
  بي_ام_دبليو: "BMW",
  "بي إم دبليو": "BMW",
  بمو: "BMW",
  أودي: "Audi",
  اودي: "Audi",
  لكزس: "Lexus",
  نيسان: "Nissan",
  هوندا: "Honda",
  فورد: "Ford",
  شيفروليه: "Chevrolet",
  فولكس_واجن: "Volkswagen",
  بورش: "Porsche",
  رينج_روفر: "Range Rover",
  "رنج روفر": "Range Rover",
  لاندروفر: "Land Rover",
  جيب: "Jeep",
  مازدا: "Mazda",
  ميتسوبيشي: "Mitsubishi",
  سوزوكي: "Suzuki",
  سسانج_يونج: "SsangYong",
  "سانج يونج": "SsangYong",
};

const MODEL_TRANSLATIONS: Record<string, string> = {
  إلنترا: "Elantra",
  الينترا: "Elantra",
  سوناتا: "Sonata",
  توسان: "Tucson",
  أفانتي: "Avante",
  افانتي: "Avante",
  كاسبر: "Casper",
  سورينتو: "Sorento",
  سبورتاج: "Sportage",
  كارنيفال: "Carnival",
  جي80: "G80",
  "جي 80": "G80",
  جي_في_80: "GV80",
  "جي في 80": "GV80",
  كامري: "Camry",
  كورولا: "Corolla",
  لاندكروزر: "Land Cruiser",
  "لاند كروزر": "Land Cruiser",
};

export function translateSearchTerm(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  if (BRAND_TRANSLATIONS[trimmed]) return BRAND_TRANSLATIONS[trimmed];
  if (MODEL_TRANSLATIONS[trimmed]) return MODEL_TRANSLATIONS[trimmed];


  const words = trimmed.split(/\s+/);
  const translatedWords = words.map(
    (w) => BRAND_TRANSLATIONS[w] || MODEL_TRANSLATIONS[w] || w
  );
  return translatedWords.join(" ");
}