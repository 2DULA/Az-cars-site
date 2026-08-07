import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Header from "./components/Header";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { CurrencyProvider } from "@/lib/currency/CurrencyContext";

export const metadata: Metadata = {
  title: "معرض العز العالمي — لبيع واستيراد السيارات",
  description:
    "قوائم سيارات حقيقية وموثقة من الأسواق العالمية، مع سجل الحالة وتحليل عدالة السعر لكل سيارة.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value === "en" ? "en" : "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <LanguageProvider>
          <CurrencyProvider>
            <Header />
            <div className="flex-1">{children}</div>

            <footer className="border-t border-white/10 bg-paper/30 backdrop-blur-xl">
              <div className="mx-auto max-w-6xl px-4 py-8 font-mono text-xs text-ink/50 lg:px-8">
                © {new Date().getFullYear()} معرض العز العالمي
              </div>
            </footer>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}