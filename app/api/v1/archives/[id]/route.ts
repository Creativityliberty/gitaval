import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await authenticateApiKey(req);
    if (!user) return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });

    const archive = await prisma.project.findFirst({
        where: { id: params.id, userId: user.id }
    });

    if (!archive) return NextResponse.json({ error: 'Archive not found' }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = archive as any;
    return NextResponse.json({
        id: a.id,
        repoUrl: a.repoUrl,
        owner: a.owner,
        repoName: a.repoName,
        fileCount: a.fileCount,
        tokenCount: a.tokenCount,
        exportFormat: a.exportFormat,
        promptTemplate: a.promptTemplate,
        digest: a.digest,
        timestamp: a.timestamp,
    });
}
