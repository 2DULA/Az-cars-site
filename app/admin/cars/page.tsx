import fs from "fs/promises";
import path from "path";
import DeleteCarButton from "./DeleteCarButton";
import Link from "next/link";

async function getCars() {
    const raw = await fs.readFile(
        path.join(process.cwd(), "data", "manual-cars.json"),
        "utf-8"
    );
    return JSON.parse(raw);
}

export default async function AdminCarsPage() {
    const cars = await getCars();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-display">Manual Car Listings</h1>
                <Link
                    href="/admin/cars/new"
                    className="px-4 py-2 bg-[var(--steel)] text-white rounded"
                >
                    + Add Car
                </Link>
            </div>

            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="text-left border-b border-[var(--line)]">
                        <th className="py-2">Image</th>
                        <th>Make/Model</th>
                        <th>Year</th>
                        <th>Price (SAR)</th>
                        <th>Mileage</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {cars.map((car: any) => (
                        <tr key={car.id} className="border-b border-[var(--line)]">
                            <td className="py-2">
                                {car.images?.[0] && (
                                    <img
                                        src={car.images[0]}
                                        alt=""
                                        className="w-16 h-12 object-cover rounded"
                                    />
                                )}
                            </td>
                            <td>
                                {car.make} {car.model}
                            </td>
                            <td>{car.year}</td>
                            <td>{car.price?.toLocaleString()}</td>
                            <td>{car.mileage?.toLocaleString()} km</td>
                            <td>
                                <DeleteCarButton id={car.id} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {cars.length === 0 && (
                <p className="text-[var(--steel)] mt-4">No manual listings yet.</p>
            )}
        </div>
    );
}