import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { polar } from '@/lib/polar';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        const loginUrl = `${process.env.NEXTAUTH_URL || 'https://gitaval.vercel.app'}/login`;
        return NextResponse.redirect(loginUrl);
    }

    try {
        // Find the Polar customer by email
        const customers = await polar.customers.list({ email: session.user.email });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = (customers as any)?.items || (customers as any)?.result?.items || [];
        const customer = items[0];

        if (!customer?.id) {
            // Not a customer yet — redirect to upgrade page
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://gitaval.vercel.app'}/dashboard/upgrade`);
        }

        // Create a customer portal session with the customer ID
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const portalSession = await (polar.customerSessions as any).create({
            customerId: customer.id,
        });

        const portalUrl = portalSession?.customerPortalUrl || portalSession?.url || 'https://polar.sh/purchases';
        return NextResponse.redirect(portalUrl);
    } catch (error) {
        console.error('Billing portal error:', error);
        // Graceful fallback to Polar's generic portal
        return NextResponse.redirect('https://polar.sh/purchases');
    }
}
