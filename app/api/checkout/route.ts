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

        const productId = process.env.POLAR_PRODUCT_ID || '918ecf9f-efe1-4e6b-a3d5-7a034aef67d8';

        const successUrl = `${process.env.NEXTAUTH_URL || 'https://gitaval.vercel.app'}/dashboard?upgraded=true`;

        const checkoutSession = await polar.checkouts.create({
            products: [productId],
            customerEmail: session.user.email,
            successUrl,
        });

        return NextResponse.redirect(checkoutSession.url);
    } catch (error) {
        console.error('Polar checkout error:', error);
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }
}
