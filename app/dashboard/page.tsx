import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RepoAnalyzer from "../components/RepoAnalyzer";
import { LayoutDashboard, Settings, UserCircle } from "lucide-react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-50 font-body flex">
            {/* Side Navigation */}
            <aside className="w-64 bg-white border-r border-slate-100 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-display font-bold text-2xl text-blue-600 tracking-tight">Gitavale PRO</h2>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 font-bold rounded-2xl">
                        <LayoutDashboard className="h-5 w-5" /> Dashboard
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 font-medium rounded-2xl transition-colors">
                        <Settings className="h-5 w-5" /> API Settings
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UserCircle className="h-8 w-8 text-slate-300" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 truncate max-w-[100px]">{session.user?.name || "User"}</span>
                            <span className="text-xs text-slate-400">Pro Plan</span>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-4 md:p-8">
                    <header className="mb-8 flex items-center justify-between">
                        <h1 className="text-3xl font-display font-bold text-slate-900">Welcome, {session.user?.name}</h1>
                    </header>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200">
                        <RepoAnalyzer />
                    </div>
                </div>
            </main>
        </div>
    );
}
