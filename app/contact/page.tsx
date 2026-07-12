"use client";

import { useState } from "react";
import { ArrowUpLeft, Phone, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // TODO: wire this up to an email service or backend endpoint
        console.log({ name, email, message });
        setSubmitted(true);
    }

    return (
        <main className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-start">

                {/* Right Column (Arabic RTL): Contact Information */}
                <div className="space-y-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold lg:text-4xl">
                            هل لديك أسئلة؟ تواصل معنا!
                        </h1>
                        <p className="mt-4 text-ink/70">
                            نحن هنا لمساعدتك في العثور على سيارة أحلامك أو الإجابة على أي استفسارات حول المزادات وخدمات استيراد السيارات.
                        </p>
                    </div>

                    <div className="space-y-6 border-t border-line pt-8">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-line text-steel">
                                <Phone size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold">رقم الهاتف</h3>
                                <p className="font-mono text-sm text-ink/70 dir-ltr text-right">+966 50 000 0000</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-line text-steel">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold">البريد الإلكتروني</h3>
                                <p className="font-mono text-sm text-ink/70">info@alez-cars.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-line text-steel">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold">العنوان</h3>
                                <p className="text-sm text-ink/70">الرياض، المملكة العربية السعودية</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Column: Form Wrapper */}
                <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
                    {submitted ? (
                        <div className="py-12 text-center">
                            <p className="font-display text-xl font-semibold text-steel">
                                تم إرسال رسالتك بنجاح
                            </p>
                            <p className="mt-2 text-sm text-ink/60">
                                سنتواصل معك في أقرب وقت ممكن.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold">
                                    اسمك
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="الاسم الكامل"
                                    required
                                    className="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm outline-none placeholder:text-ink/40 focus:border-steel focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold">
                                    البريد الإلكتروني
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@domain.com"
                                    required
                                    className="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm outline-none placeholder:text-ink/40 focus:border-steel focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold">
                                    الرسالة
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="اكتب رسالتك هنا..."
                                    rows={5}
                                    required
                                    className="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm outline-none placeholder:text-ink/40 focus:border-steel focus:bg-white resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-steel py-3.5 font-mono text-sm font-bold text-white transition-all hover:bg-ink hover:shadow-md"
                            >
                                إرسال الرسالة
                                <ArrowUpLeft size={18} />
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </main>
    );
}