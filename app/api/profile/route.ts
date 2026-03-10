import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, currentPassword, newPassword, avatar } = await req.json();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = await (prisma.user as any).findUnique({
            where: { email: session.user.email }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};

        if (name) updateData.name = name;
        if (avatar) updateData.image = avatar;

        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password required' }, { status: 400 });
            }
            const valid = await bcrypt.compare(currentPassword, user.password || '');
            if (!valid) {
                return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
            }
            updateData.password = await bcrypt.hash(newPassword, 12);
        }

        await prisma.user.update({
            where: { email: session.user.email },
            data: updateData,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
