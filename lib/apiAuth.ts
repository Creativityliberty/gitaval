import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export function hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
}

export function generateApiKey(): { key: string; hash: string; prefix: string } {
    const raw = crypto.randomBytes(32).toString('hex');
    const key = `gta_${raw}`;
    const hash = hashApiKey(key);
    const prefix = `gta_${raw.slice(0, 8)}...`;
    return { key, hash, prefix };
}

export async function authenticateApiKey(req: Request) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7).trim();
    if (!token.startsWith('gta_')) return null;

    const hash = hashApiKey(token);

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiKey = await (prisma as any).apiKey.findUnique({
            where: { keyHash: hash },
            include: { user: true }
        });

        if (!apiKey) return null;

        // Update lastUsedAt async (don't await)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() }
        }).catch(console.error);

        return apiKey.user;
    } catch {
        return null;
    }
}
