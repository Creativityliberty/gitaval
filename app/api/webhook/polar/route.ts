import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    try {
        const expectedSig = crypto
            .createHmac('sha256', secret)
            .update(body, 'utf8')
            .digest('hex');
        const expected = `sha256=${expectedSig}`;
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
        return false;
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('webhook-signature') || req.headers.get('x-polar-signature') || '';
        const secret = process.env.POLAR_WEBHOOK_SECRET || '';

        if (secret && !verifyWebhookSignature(body, signature, secret)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = JSON.parse(body);
        const { type, data } = payload;

        const email = data?.customer?.email;

        if (!email) {
            return NextResponse.json({ received: true });
        }

        if (type === 'subscription.created' || type === 'subscription.updated') {
            const status = data?.status;
            const plan = (status === 'active' || status === 'trialing') ? 'pro' : 'free';

            await prisma.user.updateMany({
                where: { email },
                data: { plan }
            });
        }

        if (type === 'subscription.canceled' || type === 'subscription.revoked') {
            await prisma.user.updateMany({
                where: { email },
                data: { plan: 'free' }
            });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Polar webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
