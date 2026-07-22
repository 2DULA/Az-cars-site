"use client";

import { useRouter } from "next/navigation";

export default function DeleteCarButton({ id }: { id: string }) {
    const router = useRouter();

    async function handleDelete() {
        if (!confirm("Delete this listing?")) return;
        await fetch(`/api/admin/cars?id=${id}`, { method: "DELETE" });
        router.refresh();
    }

    return (
        <button
            onClick={handleDelete}
            className="text-red-600 text-xs hover:underline"
        >
            Delete
        </button>
    );
}