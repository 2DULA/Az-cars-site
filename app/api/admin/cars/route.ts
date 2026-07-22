import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/adminAuth";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "manual-cars.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "cars");

async function readCars() {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
}

async function writeCars(cars: any[]) {
    await fs.writeFile(DATA_PATH, JSON.stringify(cars, null, 2), "utf-8");
}

export async function GET() {
    const cars = await readCars();
    return NextResponse.json(cars);
}

export async function POST(req: NextRequest) {
    const admin = await getAdminUser();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const id = `manual-${Date.now()}`;

    const make = formData.get("make") as string;
    const model = formData.get("model") as string;
    const year = Number(formData.get("year"));
    const price = Number(formData.get("price"));
    const mileage = Number(formData.get("mileage"));
    const description = formData.get("description") as string;
    const engine = formData.get("engine") as string;
    const transmission = formData.get("transmission") as string;
    const fuel = formData.get("fuel") as string;

    const files = formData.getAll("images") as File[];
    const carDir = path.join(UPLOAD_DIR, id);
    await fs.mkdir(carDir, { recursive: true });

    const imagePaths: string[] = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file || file.size === 0) continue;
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name) || ".jpg";
        const filename = `${i + 1}${ext}`;
        await fs.writeFile(path.join(carDir, filename), buffer);
        imagePaths.push(`/uploads/cars/${id}/${filename}`);
    }

    const newCar = {
        id,
        source: "manual",
        make,
        model,
        year,
        price,
        mileage,
        description,
        images: imagePaths,
        specs: { engine, transmission, fuel },
    };

    const cars = await readCars();
    cars.push(newCar);
    await writeCars(cars);

    return NextResponse.json(newCar, { status: 201 });
}

export async function PUT(req: NextRequest) {
    const admin = await getAdminUser();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const cars = await readCars();
    const index = cars.findIndex((c: any) => c.id === body.id);
    if (index === -1) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    cars[index] = { ...cars[index], ...body };
    await writeCars(cars);

    return NextResponse.json(cars[index]);
}

export async function DELETE(req: NextRequest) {
    const admin = await getAdminUser();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const cars = await readCars();
    const filtered = cars.filter((c: any) => c.id !== id);
    await writeCars(filtered);

    const carDir = path.join(UPLOAD_DIR, id);
    await fs.rm(carDir, { recursive: true, force: true }).catch(() => { });

    return NextResponse.json({ success: true });
}