"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);
        if (error) {
            setError(error.message);
            return;
        }

        router.push("/");
        router.refresh();
    }

    return (
        <main className= "mx-auto max-w-md px-4 py-16" dir = "rtl" >
            <h1 className="font-display text-2xl font-bold text-center" >
                تسجيل الدخول
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
    { loading? "جاري الدخول...": "دخول" }
    </button>
    </form>

    < p className = "mt-6 text-center text-sm text-ink/60" >
        ليس لديك حساب؟{ " " }
<Link href="/signup" className = "text-steel underline" >
    إنشاء حساب جديد
        </Link>
        </p>
        </main>
  );
}