import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { polar } from '@/lib/polar';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL!));
    }

    try {
        // Create a Polar customer portal session
        const portalSession = await polar.customerSessions.create({
            customerId: undefined as unknown as string,
            customerEmail: session.user.email,
        });

        return NextResponse.redirect(portalSession.customerPortalUrl);
    } catch (error) {
        console.error('Billing portal error:', error);
        // Fallback redirect to Polar directly
        return NextResponse.redirect('https://polar.sh/purchases');
    }
}
