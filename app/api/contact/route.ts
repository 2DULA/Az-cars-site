import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, message } = body;

        if (!name || typeof name !== "string" || name.length > 100) {
            return NextResponse.json({ error: "Invalid name" }, { status: 400 });
        }
        if (!email || typeof email !== "string" || !email.includes("@")) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }
        if (!message || typeof message !== "string" || message.length > 3000) {
            return NextResponse.json({ error: "Invalid message" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error } = await supabase.from("contact_messages").insert({
            name,
            email,
            message,
        });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
    }
}
