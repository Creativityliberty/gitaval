import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const user = await authenticateApiKey(req);
    if (!user) return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));

    const [archives, total] = await Promise.all([
        prisma.project.findMany({
            where: { userId: user.id },
            orderBy: { timestamp: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            select: { id: true, repoUrl: true, owner: true, repoName: true, fileCount: true, tokenCount: true, exportFormat: true, timestamp: true } as any
        }),
        prisma.project.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
        archives,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
}
