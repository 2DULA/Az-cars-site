"use client";

import { useState, useRef } from "react";
import { Camera, X, Send, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { dictionary } from "@/lib/i18n/dictionary";

const WHATSAPP_NUMBER = "9665XXXXXXXX";

export default function PartsRequestPage() {
    const { lang } = useLanguage();
    const t = dictionary[lang].partsPage;
    const isRtl = lang === "ar";

    const [phone, setPhone] = useState("");
    const [vin, setVin] = useState("");
    const [carDescription, setCarDescription] = useState("");
    const [email, setEmail] = useState("");
    const [partDescription, setPartDescription] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const lines = [
            t.whatsappMessageTitle,
            `${t.whatsappPhone} ${phone}`,
            `${t.whatsappVin} ${vin}`,
            `${t.whatsappCarDescription} ${carDescription}`,
            email ? `${t.whatsappEmail} ${email}` : null,
            `${t.whatsappPart} ${partDescription}`,
        ].filter(Boolean);
        const message = encodeURIComponent(lines.join("\n"));
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    }

    return (
        <main className="mx-auto max-w-2xl px-4 py-12 lg:px-8" dir={isRtl ? "rtl" : "ltr"}>
            <div className="bg-paper border border-line rounded-xl shadow-sm p-6 lg:p-10">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-display font-bold">{t.title}</h1>
                    <p className="text-steel mt-2">{t.subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">{t.phone}</label>
                            <div className="relative">
                                <Phone className={`absolute top-3 text-steel ${isRtl ? "right-3" : "left-3"}`} size={18} />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className={`w-full bg-transparent text-ink border border-line py-2.5 outline-none focus:border-indigo-500 rounded ${isRtl ? "pl-3 pr-10" : "pr-3 pl-10"}`}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">{t.emailOptional}</label>
                            <div className="relative">
                                <Mail className={`absolute top-3 text-steel ${isRtl ? "right-3" : "left-3"}`} size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full bg-transparent text-ink border border-line py-2.5 outline-none focus:border-indigo-500 rounded ${isRtl ? "pl-3 pr-10" : "pr-3 pl-10"}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">{t.vin}</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={vin}
                                onChange={(e) => setVin(e.target.value)}
                                className="flex-1 bg-transparent text-ink border border-line px-3 py-2.5 outline-none focus:border-indigo-500 rounded"
                                placeholder={t.vinPlaceholder}
                            />
                            {/* Updated button classes below */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-transparent text-ink border border-line px-4 rounded flex items-center gap-2 hover:opacity-70 transition-opacity"
                            >
                                <Camera size={18} /> {t.photo}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                        </div>
                        {imagePreview && (
                            <div className="mt-3 relative inline-block">
                                <img src={imagePreview} className="w-20 h-20 object-cover rounded border border-line" />
                                <button
                                    type="button"
                                    onClick={() => setImagePreview(null)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">{t.carDescription}</label>
                        <textarea
                            value={carDescription}
                            onChange={(e) => setCarDescription(e.target.value)}
                            rows={2}
                            required
                            className="w-full bg-transparent text-ink border border-line px-3 py-2.5 outline-none focus:border-indigo-500 rounded"
                            placeholder={t.carDescriptionPlaceholder}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">{t.partDescription}</label>
                        <textarea
                            value={partDescription}
                            onChange={(e) => setPartDescription(e.target.value)}
                            rows={3}
                            required
                            className="w-full bg-transparent text-ink border border-line px-3 py-2.5 outline-none focus:border-indigo-500 rounded"
                            placeholder={t.partDescriptionPlaceholder}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                        <Send size={20} /> {t.submit}
                    </button>
                </form>
            </div>
        </main>
    );
}