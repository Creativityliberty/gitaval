import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateApiKey } from '@/lib/apiAuth';

// GET — list user's API keys
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const keys = await prisma.apiKey.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, keyPrefix: true, createdAt: true, lastUsedAt: true }
    });

    return NextResponse.json({ keys });
}

// POST — generate new API key
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (prisma.user as any).findUnique({
        where: { email: session.user.email },
        select: { id: true, plan: true }
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (user.plan !== 'pro') {
        return NextResponse.json({ error: 'API access is a Pro feature', upgrade: true }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Key name required' }, { status: 400 });

    // Max 5 keys per user
    const count = await prisma.apiKey.count({ where: { userId: user.id } });
    if (count >= 5) return NextResponse.json({ error: 'Maximum 5 API keys allowed' }, { status: 400 });

    const { key, hash, prefix } = generateApiKey();

    await prisma.apiKey.create({
        data: { name: name.trim(), keyHash: hash, keyPrefix: prefix, userId: user.id }
    });

    // Return the raw key ONCE — never stored in DB
    return NextResponse.json({ key, prefix, name: name.trim() });
}
