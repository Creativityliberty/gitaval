import { NextRequest, NextResponse } from 'next/server';
import { analyzeRepo } from '@/lib/github';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const FREE_LIMIT = 3;  // analyses/month for free accounts
const ANON_LIMIT = 1;  // analyses total for anonymous (tracked client-side)

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Authenticated user gate
        if (session?.user?.email) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const user = await (prisma.user as any).findUnique({
                where: { email: session.user.email },
                select: { id: true, plan: true, analysisCount: true, analysisResetAt: true }
            });

            if (user) {
                const isPro = user.plan === 'pro';

                if (!isPro) {
                    // Reset counter if it's a new month
                    const now = new Date();
                    const resetAt = user.analysisResetAt ? new Date(user.analysisResetAt) : null;
                    const needsReset = !resetAt || resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear();

                    if (needsReset) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await (prisma.user as any).update({
                            where: { id: user.id },
                            data: { analysisCount: 0, analysisResetAt: now }
                        });
                        user.analysisCount = 0;
                    }

                    if (user.analysisCount >= FREE_LIMIT) {
                        return NextResponse.json({
                            error: 'Monthly limit reached',
                            limitReached: true,
                            plan: 'free',
                            limit: FREE_LIMIT,
                        }, { status: 429 });
                    }

                    // Increment counter
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (prisma.user as any).update({
                        where: { id: user.id },
                        data: { analysisCount: user.analysisCount + 1 }
                    });
                }
            }
        }
        // Anonymous users: limit tracked client-side in localStorage
        // The server just marks in the response whether this is an anon analysis
        const result = await analyzeRepo(url);

        return NextResponse.json({
            ...result,
            anonLimit: ANON_LIMIT,
            isAuthenticated: !!session?.user?.email,
        });
    } catch (error: unknown) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
