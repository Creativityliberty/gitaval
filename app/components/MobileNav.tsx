'use client';

import { Link } from '../../navigation';
import { LayoutDashboard, Archive, Settings, Zap, User } from 'lucide-react';
import { usePathname } from '../../navigation';
import { useTranslations } from 'next-intl';

interface MobileNavProps {
    userPlan: string;
}

export default function MobileNav({ userPlan }: MobileNavProps) {
    const pathname = usePathname();
    const t = useTranslations('Dashboard');

    const items = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Hub' },
        { href: '/dashboard/archives', icon: Archive, label: t('archives') },
        { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
        { href: '/dashboard/profile', icon: User, label: 'Profile' },
        ...(userPlan !== 'pro' ? [{ href: '/dashboard/upgrade', icon: Zap, label: t('upgrade') }] : []),
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-panel border-t border-white/10 flex items-center justify-around px-2 py-2 safe-bottom">
            {items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-white'
                            }`}
                    >
                        <Icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
