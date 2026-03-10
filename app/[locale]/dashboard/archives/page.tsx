import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Link } from "../../../../navigation";
import { Archive, ArrowRight, Database } from "lucide-react";
import { getTranslations } from 'next-intl/server';

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
    const t = await getTranslations('Dashboard');

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
                    {t('archives')}
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
                <div className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="h-16 w-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center opacity-30 mb-2">
                        <Archive className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">No archives yet</h2>
                        <p className="text-muted-foreground max-w-xs mx-auto text-sm">Analyze your first repository to start building your knowledge base history.</p>
                    </div>
                    <Link href="/dashboard" className="btn-primary px-8 mt-4">Analyze a Repo</Link>
                </div>
            )}

            {session && projects.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/dashboard/archives/${project.id}`}
                            className="glass-card p-6 flex flex-col transition-all hover:border-primary/50 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-4 w-4 text-primary" />
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 pr-8">
                                    <h3 className="font-display font-bold text-lg text-white group-hover:text-primary transition-colors truncate">{project.repoName}</h3>
                                    <p className="text-xs text-muted-foreground truncate opacity-70">{project.owner}</p>
                                </div>
                                <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-md border border-primary/20 shrink-0">
                                    {project.exportFormat || 'txt'}
                                </span>
                            </div>

                            <div className="space-y-2 mt-auto">
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-muted-foreground">Files</span>
                                    <span className="text-white font-mono font-bold">{project.fileCount}</span>
                                </div>
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-muted-foreground">Tokens</span>
                                    <span className="text-cyan-400 font-mono font-bold">{(project.tokenCount || 0).toLocaleString()}</span>
                                </div>
                                <div className="pt-3 border-t border-white/5 mt-2 flex justify-between items-center text-[11px] font-mono text-white/40">
                                    <span>{new Date(project.timestamp).toLocaleDateString()}</span>
                                    <span>{new Date(project.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
