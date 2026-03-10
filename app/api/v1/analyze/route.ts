import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/apiAuth';
import { analyzeRepo } from '@/lib/github';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const user = await authenticateApiKey(req);
    if (!user) {
        return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fullUser = await (prisma.user as any).findUnique({
        where: { id: user.id },
        select: { plan: true, analysisCount: true, analysisResetAt: true }
    });

    if (fullUser?.plan !== 'pro') {
        return NextResponse.json({ error: 'API access requires a Pro subscription', upgrade: 'https://gitaval.vercel.app/dashboard/upgrade' }, { status: 403 });
    }

    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 });

    try {
        const result = await analyzeRepo(url);

        // Save to archives
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const project = await (prisma.project.create as any)({
            data: {
                userId: user.id,
                repoUrl: url,
                owner: result.summary?.owner || '',
                repoName: result.summary?.repo || '',
                fileCount: result.summary?.filesAnalyzed || 0,
                tokenCount: result.summary?.estimatedTokens || 0,
                exportFormat: 'text',
                digest: result.content || '',
            }
        });

        return NextResponse.json({
            archiveId: project.id,
            summary: result.summary,
            digest: result.content,
            fileCount: result.summary?.filesAnalyzed,
            tokenCount: result.summary?.estimatedTokens,
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Analysis failed';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
