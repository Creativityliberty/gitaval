import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        if (!process.env.DATABASE_URL) {
            console.error("CRITICAL: DATABASE_URL is missing from environment variables!");
            return NextResponse.json({ message: "Configuration error: DATABASE_URL is missing" }, { status: 500 });
        }
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password required" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
    } catch (error: unknown) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
