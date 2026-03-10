import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { polar } from '@/lib/polar';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL!));
        }

        const productId = process.env.POLAR_PRODUCT_ID;

        if (!productId) {
            return NextResponse.json({ error: 'Product not configured' }, { status: 500 });
        }

        const checkoutSession = await polar.checkouts.create({
            productId,
            customerEmail: session.user.email,
            successUrl: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
        });

        return NextResponse.redirect(checkoutSession.url);
    } catch (error) {
        console.error('Polar checkout error:', error);
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }
}
