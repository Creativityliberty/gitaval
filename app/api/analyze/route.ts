import { NextRequest, NextResponse } from 'next/server';
import { analyzeRepo } from '@/lib/github';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const result = await analyzeRepo(url);

        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
