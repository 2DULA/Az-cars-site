import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest) {
    const admin = await getAdminUser();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from("contact_messages")
            .update({ is_read: true })
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}
