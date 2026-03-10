'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    LayoutDashboard, Settings, Key, UserCircle, Archive, Zap,
    ChevronLeft, ChevronRight, LogOut, CreditCard
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
    highlight?: boolean;
}

interface DashboardSidebarProps {
    userName: string;
    userPlan: string;
}

export default function DashboardSidebar({ userName, userPlan }: DashboardSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    const navItems: NavItem[] = [
        { href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5 shrink-0" />, label: 'Project Hub' },
        { href: '/dashboard/archives', icon: <Archive className="h-5 w-5 shrink-0" />, label: 'Archives' },
        { href: '/dashboard/api-keys', icon: <Key className="h-5 w-5 shrink-0" />, label: 'API Keys' },
        { href: '/dashboard/settings', icon: <Settings className="h-5 w-5 shrink-0" />, label: 'Settings' },
        ...(userPlan === 'pro' ? [{
            href: '/api/billing/portal',
            icon: <CreditCard className="h-5 w-5 shrink-0" />,
            label: 'Billing'
        }] : [{
            href: '/dashboard/upgrade',
            icon: <Zap className="h-5 w-5 shrink-0" />,
            label: 'Upgrade to Pro',
            highlight: true
        }]),
    ];

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 256 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="glass-panel border-r border-white/5 flex flex-col relative z-[40] shrink-0 overflow-hidden hidden md:flex"
        >
            {/* Logo */}
            <div className={`p-5 border-b border-white/5 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed && (
                    <h2 className="font-display font-extrabold text-lg text-white tracking-tight text-glow whitespace-nowrap">
                        Gitavale PRO
                    </h2>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors shrink-0"
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-grow p-3 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all font-medium group relative
                            ${item.highlight
                                ? 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }
                            ${collapsed ? 'justify-center' : ''}`}
                    >
                        {item.icon}
                        {!collapsed && (
                            <span className="whitespace-nowrap text-sm">{item.label}</span>
                        )}
                        {collapsed && (
                            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-black/90 border border-white/10 rounded-xl text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                                {item.label}
                            </div>
                        )}
                    </Link>
                ))}
            </nav>

            {/* User Section */}
            <div className={`p-3 border-t border-white/5 bg-black/20`}>
                <Link
                    href="/dashboard/profile"
                    title={collapsed ? userName : undefined}
                    className={`flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors group relative ${collapsed ? 'justify-center' : ''}`}
                >
                    <div className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <UserCircle className="h-5 w-5 text-primary" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white truncate">{userName}</span>
                            <span className={`text-xs font-bold ${userPlan === 'pro' ? 'text-primary' : 'text-muted-foreground'}`}>
                                {userPlan === 'pro' ? '⚡ Pro Plan' : 'Free Plan'}
                            </span>
                        </div>
                    )}
                    {collapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-black/90 border border-white/10 rounded-xl text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                            {userName} · {userPlan === 'pro' ? '⚡ Pro' : 'Free'}
                        </div>
                    )}
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    title={collapsed ? 'Sign out' : undefined}
                    className={`mt-1 flex items-center gap-3 px-3 py-2 w-full rounded-2xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="text-xs">Sign out</span>}
                </button>
            </div>
        </motion.aside>
    );
}
