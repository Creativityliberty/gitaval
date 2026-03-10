import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LayoutDashboard, Settings, Key, UserCircle, Archive, Zap } from "lucide-react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    let userPlan = "free";
    if (session?.user?.email) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = await (prisma.user.findUnique as any)({
            where: { email: session.user.email },
            select: { plan: true }
        });
        userPlan = user?.plan || "free";
    }

    return (
        <div className="min-h-screen bg-background font-body flex overflow-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 bg-grid z-0 opacity-10 pointer-events-none"></div>

            {/* Side Navigation */}
            <aside className="w-64 glass-panel border-r border-white/5 flex flex-col hidden md:flex relative z-10 z-[40]">
                <div className="p-6 border-b border-white/5 flex items-center gap-2">
                    <h2 className="font-display font-extrabold text-xl text-white tracking-tight text-glow">Gitavale PRO</h2>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-white hover:bg-white/5 font-medium rounded-2xl transition-colors">
                        <LayoutDashboard className="h-5 w-5" /> Project Hub
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-white hover:bg-white/5 font-medium rounded-2xl transition-colors">
                        <Settings className="h-5 w-5" /> Settings
                    </Link>
                    <Link href="/dashboard/api-keys" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-white hover:bg-white/5 font-medium rounded-2xl transition-colors">
                        <Key className="h-5 w-5" /> API Keys
                    </Link>
                    <Link href="/dashboard/archives" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-white hover:bg-white/5 font-medium rounded-2xl transition-colors">
                        <Archive className="h-5 w-5" /> Archives
                    </Link>
                    {userPlan !== "pro" && (
                        <Link href="/dashboard/upgrade" className="flex items-center gap-3 px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-2xl transition-colors border border-primary/20">
                            <Zap className="h-5 w-5" /> Upgrade to Pro
                        </Link>
                    )}
                </nav>
                <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white truncate max-w-[100px]">{session.user?.name || "User"}</span>
                            <span className={`text-xs font-bold ${userPlan === "pro" ? "text-primary" : "text-muted-foreground"}`}>
                                {userPlan === "pro" ? "⚡ Pro Plan" : "Free Plan"}
                            </span>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10">
                <div className="max-w-6xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
