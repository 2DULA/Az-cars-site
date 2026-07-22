import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Header from "./components/Header";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { CurrencyProvider } from "@/lib/currency/CurrencyContext";

export const metadata: Metadata = {
  title: "معرض العز العالمي — لبيع واستيراد السيارات",
  description:
    "قوائم سيارات حقيقية وموثقة من الأسواق العالمية، مع سجل الحالة وتحليل عدالة السعر لكل سيارة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <LanguageProvider>
          <CurrencyProvider>
            <Header />
            <div className="flex-1">{children}</div>

            <footer className="border-t border-line bg-paper">
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