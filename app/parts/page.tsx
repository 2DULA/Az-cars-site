"use client";

import { useState, useRef } from "react";
import { Camera, X, Send, Car, FileText, Phone, Mail } from "lucide-react";

const WHATSAPP_NUMBER = "9665XXXXXXXX";

export default function PartsRequestPage() {
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
            "طلب قطعة غيار جديد:",
            `رقم الهاتف: ${phone}`,
            `رقم الهيكل (VIN): ${vin}`,
            `وصف السيارة: ${carDescription}`,
            email ? `البريد الإلكتروني: ${email}` : null,
            `القطعة المطلوبة: ${partDescription}`,
        ].filter(Boolean);
        const message = encodeURIComponent(lines.join("\n"));
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    }

    return (
        <main className="mx-auto max-w-2xl px-4 py-12 lg:px-8" dir="rtl">
            <div className="bg-white border border-line rounded-xl shadow-sm p-6 lg:p-10">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-display font-bold">قطع الغيار التي تريدها في مكان واحد</h1>
                    <p className="text-steel mt-2">املأ النموذج وسنبحث نيابة عنك ونتواصل معك.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Row 1: Contact & Car */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">رقم الهاتف</label>
                            <div className="relative">
                                <Phone className="absolute right-3 top-3 text-steel" size={18} />
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full border border-line pl-3 pr-10 py-2.5 outline-none focus:border-indigo-500 rounded" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">البريد الإلكتروني (اختياري)</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-3 text-steel" size={18} />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-line pl-3 pr-10 py-2.5 outline-none focus:border-indigo-500 rounded" />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: VIN Section */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">رقم الهيكل (VIN)</label>
                        <div className="flex gap-2">
                            <input type="text" value={vin} onChange={(e) => setVin(e.target.value)} className="flex-1 border border-line px-3 py-2.5 outline-none focus:border-indigo-500 rounded" placeholder="17 خانة" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-ink text-white px-4 rounded flex items-center gap-2 hover:bg-gray-800">
                                <Camera size={18} /> صورة
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                        </div>
                        {imagePreview && (
                            <div className="mt-3 relative inline-block">
                                <img src={imagePreview} className="w-20 h-20 object-cover rounded border" />
                                <button type="button" onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={14} /></button>
                            </div>
                        )}
                    </div>

                    {/* Row 3: Descriptions */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">وصف السيارة</label>
                        <textarea value={carDescription} onChange={(e) => setCarDescription(e.target.value)} rows={2} required className="w-full border border-line px-3 py-2.5 outline-none focus:border-indigo-500 rounded" placeholder="الماركة، الموديل، السنة..." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">القطعة المطلوبة</label>
                        <textarea value={partDescription} onChange={(e) => setPartDescription(e.target.value)} rows={3} required className="w-full border border-line px-3 py-2.5 outline-none focus:border-indigo-500 rounded" placeholder="اشرح القطعة التي تحتاجها..." />
                    </div>

                    <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all">
                        <Send size={20} /> إرسال عبر واتساب
                    </button>
                </form>
            </div>
        </main>
    );
}