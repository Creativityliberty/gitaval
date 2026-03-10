import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Archive, ArrowRight, Database } from "lucide-react";

type ProjectSummary = {
    id: string;
    repoUrl: string;
    owner: string;
    repoName: string;
    fileCount: number;
    tokenCount: number;
    timestamp: Date;
    exportFormat?: string | null;
};

export default async function ArchivesPage() {
    const session = await getServerSession(authOptions);

    let projects: ProjectSummary[] = [];
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });
        if (user) {
            const raw = await prisma.project.findMany({
                where: { userId: user.id },
                orderBy: { timestamp: 'desc' },
                take: 50,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            projects = (raw as any[]).map((p) => ({
                id: p.id,
                repoUrl: p.repoUrl,
                owner: p.owner,
                repoName: p.repoName,
                fileCount: p.fileCount,
                tokenCount: p.tokenCount,
                timestamp: p.timestamp,
                exportFormat: p.exportFormat ?? null,
            }));
        }
    }

    return (
        <div className="space-y-6 animate-reveal">
            <header className="mb-8">
                <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                    <Archive className="h-8 w-8 text-primary" />
                    Project Archives
                </h1>
                <p className="text-muted-foreground mt-2">View and re-download your previously generated context digests without re-analyzing the repository.</p>
            </header>

            {!session && (
                <div className="glass-card p-12 text-center flex flex-col items-center">
                    <Database className="h-12 w-12 text-primary/30 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
                    <p className="text-muted-foreground mb-6">Archives are only stored securely for authenticated users.</p>
                    <Link href="/login" className="btn-primary">Sign In</Link>
                </div>
            )}

            {session && projects.length === 0 && (
                <div className="glass-card p-12 text-center text-muted-foreground">
                    No archives found. Analyze a repository from the dashboard first.
                </div>
            )}

            {session && projects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="glass-card p-6 flex flex-col transition-all hover:border-primary/50 group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-display font-bold text-lg text-white group-hover:text-primary transition-colors">{project.repoName}</h3>
                                    <p className="text-xs text-muted-foreground">{project.owner}</p>
                                </div>
                                <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-md border border-primary/20">
                                    {project.exportFormat || 'txt'}
                                </span>
                            </div>

                            <div className="space-y-2 mt-auto mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Files:</span>
                                    <span className="text-white font-mono">{project.fileCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Est. Tokens:</span>
                                    <span className="text-cyan-400 font-mono">{(project.tokenCount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span className="text-white/60 text-xs">{new Date(project.timestamp).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <Link
                                href={`/dashboard/archives/${project.id}`}
                                className="mt-auto w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-medium border border-white/5"
                            >
                                Open Archive <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
