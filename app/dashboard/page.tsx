import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RepoAnalyzer from "../components/RepoAnalyzer";
import { LayoutDashboard, Settings, UserCircle, Terminal } from "lucide-react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background font-body flex overflow-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 bg-grid z-0 opacity-10 pointer-events-none"></div>

            {/* Side Navigation */}
            <aside className="w-64 glass-panel border-r border-white/5 flex flex-col hidden md:flex relative z-10 z-[40]">
                <div className="p-6 border-b border-white/5 flex items-center gap-2">
                    <Terminal className="h-6 w-6 text-primary" />
                    <h2 className="font-display font-extrabold text-xl text-white tracking-tight text-glow">Gitavale PRO</h2>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary/20 text-white font-bold rounded-2xl border border-primary/30">
                        <LayoutDashboard className="h-5 w-5 text-primary" /> Dashboard
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-white hover:bg-white/5 font-medium rounded-2xl transition-colors">
                        <Settings className="h-5 w-5" /> API Settings
                    </Link>
                </nav>
                <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white truncate max-w-[100px]">{session.user?.name || "User"}</span>
                            <span className="text-xs text-primary">Pro Plan</span>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10">
                <div className="max-w-6xl mx-auto p-4 md:p-8">
                    <header className="mb-8 flex items-center justify-between">
                        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Welcome, {session.user?.name}</h1>
                    </header>

                    <div className="glass-panel rounded-[2.5rem] p-1 border border-white/5 relative">
                        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
                        <div className="relative z-10">
                            <RepoAnalyzer />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
