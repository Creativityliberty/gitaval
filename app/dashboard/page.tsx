import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import RepoAnalyzer from "../components/RepoAnalyzer";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    return (
        <>
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">Project Hub</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, {session?.user?.name}</p>
                </div>
            </header>

            <div className="glass-panel rounded-[2.5rem] p-1 border border-white/5 relative">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                    <RepoAnalyzer />
                </div>
            </div>
        </>
    );
}
