import Image from "next/image";
import { ShieldCheck, Clock, Globe } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
            {/* Header Section */}
            <div className="mb-16 text-center">
                <span className="inline-block rounded-full border border-line bg-paper px-4 py-1.5 font-mono text-sm font-semibold uppercase tracking-wide text-steel">
                    من نحن
                </span>
                <h1 className="mt-4 font-display text-4xl font-bold text-ink lg:text-5xl">
                    الأفضل بين يديك
                </h1>
            </div>

            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Text & Stats Column */}
                <div className="space-y-8">
                    <div>
                        <h2 className="font-display text-2xl font-bold leading-snug text-ink lg:text-3xl">
                            معرض العز العالمي — نختار لك الأفضل ونضمن راحة بالك
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-ink/75">
                            نحن شركة العز العالمي للسيارات، متخصصون في استيراد جميع أنواع السيارات من كوريا الجنوبية منذ 2019، ونسعى دومًا لتحقيق أعلى معايير الجودة. بدأنا كفريق صغير وتطورنا لنصبح أحد روّاد المجال بفضل أحدث التقنيات وفريقنا الخبير بفحص السيارات.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-2">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line bg-paper text-steel">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink">خبرة ممتدة</h3>
                                <p className="mt-1 text-sm text-ink/60">نعمل في الاستيراد بثقة منذ 2019</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line bg-paper text-steel">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink">+٣٠٠٠ سيارة</h3>
                                <p className="mt-1 text-sm text-ink/60">تم فحصها واستيرادها بنجاح</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 sm:col-span-2">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line bg-paper text-steel">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-ink">دعم متواصل ٢٤/٧</h3>
                                <p className="mt-1 text-sm text-ink/60">خدمة عملاء وخدمات ما بعد البيع على مدار الساعة لتلبية كافة احتياجاتك</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Brand Card */}
                <div className="relative flex aspect-[4/3] w-full items-center justify-center rounded-3xl border border-line bg-white p-10 shadow-sm transition-transform hover:-translate-y-1">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-paper/40 to-line/10" />

                    <div className="relative z-10 flex h-full w-full items-center justify-center">
                        <Image
                            src="/full logo.png"
                            alt="AZ International - معرض العز العالمي"
                            width={500}
                            height={400}
                            className="h-full w-full object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}