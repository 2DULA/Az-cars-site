"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCarPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData(e.currentTarget);

        const res = await fetch("/api/admin/cars", {
            method: "POST",
            body: formData,
        });

        setSubmitting(false);
        if (res.ok) {
            router.push("/admin/cars");
            router.refresh();
        } else {
            alert("Failed to add car");
        }
    }

    return (
        <div className="max-w-xl">
            <h1 className="text-2xl font-display mb-6">Add Car Listing</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input name="make" placeholder="Make" required className="border p-2 rounded" />
                <input name="model" placeholder="Model" required className="border p-2 rounded" />
                <input name="year" type="number" placeholder="Year" required className="border p-2 rounded" />
                <input name="price" type="number" placeholder="Price (SAR)" required className="border p-2 rounded" />
                <input name="mileage" type="number" placeholder="Mileage (km)" required className="border p-2 rounded" />
                <input name="engine" placeholder="Engine" className="border p-2 rounded" />
                <input name="transmission" placeholder="Transmission" className="border p-2 rounded" />
                <input name="fuel" placeholder="Fuel type" className="border p-2 rounded" />
                <textarea name="description" placeholder="Description" className="border p-2 rounded" rows={4} />
                <input name="images" type="file" accept="image/*" multiple className="border p-2 rounded" />

                <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-[var(--steel)] text-white rounded disabled:opacity-50"
                >
                    {submitting ? "Adding..." : "Add Car"}
                </button>
            </form>
        </div>
    );
}