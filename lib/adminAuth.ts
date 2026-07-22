import { createClient } from "@/lib/supabase/server";

// Add authorized admin emails here
const ADMIN_EMAILS = [
    "alimusa7155@gmail.com",
    "httpsdula@gmail.com",
    // add more as needed
];

export async function getAdminUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        return null;
    }

    return user;
}

export function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email);
}