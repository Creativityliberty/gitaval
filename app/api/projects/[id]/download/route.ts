import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const project = await prisma.project.findFirst({
            where: { id: params.id, userId: user.id }
        });

        if (!project) {
            return NextResponse.json({ error: 'Archive not found' }, { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content = (project as any).digest || 'No digest available for this archive.';
        const filename = `${project.repoName}-digest.txt`;

        return new Response(content, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('API Error (GET /api/projects/[id]/download):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
