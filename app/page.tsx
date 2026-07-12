import Link from "next/link";
import { ArrowLeft, ShieldCheck, LineChart, BadgeCheck } from "lucide-react";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-paper to-white">
        {/* Subtle background glow effects */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-steel/5 blur-3xl" />
        <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-amber/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-32 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-steel shadow-sm">
            <BadgeCheck size={14} />
            من سيول إلى جميع أنحاء العالم
          </span>

          <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.2] text-ink lg:text-7xl">
            مرحباً بك في عالمك لـ <br className="hidden sm:block" />
            <span className="text-steel">السيارات الكورية الموثقة</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/75">
            مخزون حي مصدره أكبر الأسواق الكورية — سجل فحص كامل، سجل الحوادث،
            وأسعار عادلة مقارنة بالسوق لكل سيارة، جاهزة للتصدير إليك مباشرة.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/cars"
              className="flex items-center gap-2 rounded-lg bg-steel px-8 py-4 font-mono text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-ink hover:shadow-lg"
            >
              تصفح السيارات
              <ArrowLeft size={18} />
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 rounded-lg border border-line bg-white px-8 py-4 font-mono text-sm font-bold text-ink transition-all hover:bg-paper"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-line bg-paper/50">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-ink">لماذا تختار سياراتنا؟</h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Feature
              icon={<ShieldCheck size={28} />}
              title="حالة موثقة"
              body="سجل الحوادث، حالة الفحص، وسجل الاستدعاءات متوفرة لكل سيارة قبل الشحن لضمان راحة بالك."
            />
            <Feature
              icon={<LineChart size={28} />}
              title="تحليل عدالة السعر"
              body="كل إعلان يُقارن بمبيعات مشابهة حتى تعرف بالضبط ما تدفعه مقابله وتحصل على أفضل صفقة."
            />
            <Feature
              icon={<BadgeCheck size={28} />}
              title="مصدر مباشر"
              body="بيانات حية تُسحب مباشرة من الأسواق الكورية — بدون إعلانات قديمة أو وسطاء."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-8 shadow-sm transition-transform hover:-translate-y-1">
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-line bg-paper text-steel">
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-ink/70">{body}</p>
    </div>
  );
}