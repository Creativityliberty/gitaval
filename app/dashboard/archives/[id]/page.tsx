import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Sparkles } from "lucide-react";

interface Props {
    params: { id: string };
}

type FullProject = {
    id: string;
    repoUrl: string;
    owner: string;
    repoName: string;
    fileCount: number;
    tokenCount: number;
    timestamp: Date;
    exportFormat?: string | null;
    promptTemplate?: string | null;
    digest?: string | null;
};

export default async function ArchiveDetailPage({ params }: Props) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) notFound();

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) notFound();

    const raw = await prisma.project.findFirst({
        where: { id: params.id, userId: user.id }
    });

    if (!raw) notFound();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project: FullProject = raw as any;

    const hasDigest = !!project.digest;

    return (
        <div className="space-y-8 animate-reveal">
            <header className="flex items-center gap-4">
                <Link href="/dashboard/archives" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-white transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                        {project.owner}/<span className="text-primary text-glow">{project.repoName}</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Analyzed on {new Date(project.timestamp).toLocaleString()} · {project.fileCount} files · {(project.tokenCount || 0).toLocaleString()} estimated tokens
                    </p>
                </div>
            </header>

            {project.promptTemplate && (
                <div className="glass-card p-6 border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Prompt Template Used</span>
                    </div>
                    <p className="text-muted-foreground text-sm font-mono whitespace-pre-wrap leading-relaxed">{project.promptTemplate}</p>
                </div>
            )}

            {hasDigest ? (
                <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/10">
                    <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-black/20">
                        <span className="font-display font-bold text-white uppercase tracking-tight">Saved Digest</span>
                        <a
                            href={`/api/projects/${project.id}/download`}
                            className="btn-glass flex items-center gap-2 text-sm text-white"
                        >
                            <Download className="h-4 w-4" />
                            Download .txt
                        </a>
                    </div>
                    <div className="h-[600px] overflow-y-auto bg-black/40 p-8">
                        <pre className="text-muted-foreground text-[13px] font-mono leading-relaxed whitespace-pre-wrap">
                            {project.digest?.slice(0, 12000)}
                            {(project.digest?.length || 0) > 12000 && (
                                <span className="block mt-8 p-6 bg-primary/10 rounded-2xl border border-primary/20 border-dashed text-primary font-bold">
                                    Preview truncated — Download the full .txt file above.
                                </span>
                            )}
                        </pre>
                    </div>
                </div>
            ) : (
                <div className="glass-card p-12 text-center text-muted-foreground">
                    This archive was created before digest storage was enabled. Re-analyze the repository to save a full digest.
                </div>
            )}

            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Format: <span className="text-white font-bold">{project.exportFormat || 'text'}</span></span>
                <span>Repo: <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{project.repoUrl}</a></span>
            </div>
        </div>
    );
}
