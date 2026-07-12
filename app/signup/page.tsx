"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await supabase.auth.signUp({ email, password });

        setLoading(false);
        if (error) {
            setError(error.message);
            return;
        }
        setSuccess(true);
    }

    if (success) {
        return (
            <main className= "mx-auto max-w-md px-4 py-20 text-center" dir = "rtl" >
                <h1 className="font-display text-2xl font-bold" > تم إنشاء الحساب </h1>
                    < p className = "mt-3 text-ink/60" >
                        تحقق من بريدك الإلكتروني لتأكيد حسابك، ثم سجّل الدخول.
        </p>
                            < Link
        href = "/signin"
        className = "mt-6 inline-block bg-ink px-6 py-3 font-mono text-sm text-paper hover:bg-steel"
            >
            الذهاب لتسجيل الدخول
                </Link>
                </main>
    );
    }

    return (
        <main className= "mx-auto max-w-md px-4 py-16" dir = "rtl" >
            <h1 className="font-display text-2xl font-bold text-center" >
                إنشاء حساب جديد
                    </h1>

                    < form onSubmit = { handleSubmit } className = "mt-8 space-y-5" >
                        <div>
                        <label className="mb-1.5 block text-sm font-semibold" >
                            البريد الإلكتروني
                                </label>
                                < input
    type = "email"
    value = { email }
    onChange = {(e) => setEmail(e.target.value)
}
required
className = "w-full border border-line px-4 py-3 text-sm outline-none focus:border-steel"
    />
    </div>

    < div >
    <label className="mb-1.5 block text-sm font-semibold" >
        كلمة المرور
            </label>
            < input
type = "password"
value = { password }
onChange = {(e) => setPassword(e.target.value)}
required
minLength = { 6}
className = "w-full border border-line px-4 py-3 text-sm outline-none focus:border-steel"
    />
    </div>

{
    error && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-3" >
            { error }
            </p>
        )
}

<button
          type="submit"
disabled = { loading }
className = "w-full bg-ink py-3 font-mono text-sm text-paper hover:bg-steel disabled:opacity-50"
    >
    { loading? "جاري الإنشاء...": "إنشاء حساب" }
    </button>
    </form>

    < p className = "mt-6 text-center text-sm text-ink/60" >
        لديك حساب بالفعل؟{ " " }
<Link href="/signin" className = "text-steel underline" >
    سجّل الدخول
        </Link>
        </p>
        </main>
  );
}