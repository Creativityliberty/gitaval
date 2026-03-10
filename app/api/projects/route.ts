import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { repoUrl, owner, repoName, fileCount, tokenCount, promptTemplate, exportFormat, digest } = await req.json();

        if (!repoUrl || !owner || !repoName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const project = await prisma.project.create({
            data: {
                userId: user.id,
                repoUrl,
                owner,
                repoName,
                fileCount: fileCount || 0,
                tokenCount: tokenCount || 0,
                promptTemplate,
                exportFormat,
                digest
            }
        });

        return NextResponse.json({ success: true, project }, { status: 201 });
    } catch (error) {
        console.error('API Error (POST /api/projects):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const projects = await prisma.project.findMany({
            where: { userId: user.id },
            orderBy: { timestamp: 'desc' },
            take: 20,
        });

        return NextResponse.json({ success: true, projects }, { status: 200 });
    } catch (error) {
        console.error('API Error (GET /api/projects):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
