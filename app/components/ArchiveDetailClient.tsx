'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Sparkles, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    project: {
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
}

export default function ArchiveDetailClient({ project }: Props) {
    const [copied, setCopied] = useState(false);
    const hasDigest = !!project.digest;

    const handleCopy = async () => {
        if (!project.digest) return;
        await navigator.clipboard.writeText(project.digest);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-reveal">
            <header className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/archives" className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-muted-foreground hover:text-white transition-colors shrink-0">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="min-w-0">
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight truncate">
                            {project.owner}/<span className="text-primary text-glow">{project.repoName}</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-xs md:text-sm">
                            Analyzed on {new Date(project.timestamp).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:ml-auto">
                    <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-muted-foreground">
                        {project.fileCount} files
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-primary/70">
                        {(project.tokenCount || 0).toLocaleString()} tokens
                    </div>
                </div>
            </header>

            {project.promptTemplate && (
                <div className="glass-card p-5 md:p-6 border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Prompt Template Used</span>
                    </div>
                    <p className="text-muted-foreground text-[13px] font-mono whitespace-pre-wrap leading-relaxed opacity-80">{project.promptTemplate}</p>
                </div>
            )}

            {hasDigest ? (
                <div className="glass-panel rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/10 flex flex-col">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 md:px-8 py-4 md:py-5 border-b border-white/10 bg-black/20 gap-4">
                        <span className="font-display font-bold text-white uppercase tracking-wider text-xs md:text-sm flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            Stored Digest
                        </span>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleCopy}
                                className="btn-glass flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs text-white px-4 py-2.5 rounded-xl"
                            >
                                <AnimatePresence mode="wait">
                                    {copied ? (
                                        <motion.div key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
                                            <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                                        </motion.div>
                                    ) : (
                                        <motion.div key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
                                            <Copy className="h-3.5 w-3.5" /> Copy Digest
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                            <a
                                href={`/api/projects/${project.id}/download`}
                                className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs px-4 py-2.5 rounded-xl"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Download .txt
                            </a>
                        </div>
                    </div>
                    <div className="h-[500px] md:h-[600px] overflow-y-auto bg-black/40 p-6 md:p-8 scrollbar-thin scrollbar-thumb-white/10">
                        <pre className="text-muted-foreground text-[12px] md:text-[13px] font-mono leading-relaxed whitespace-pre-wrap">
                            {project.digest?.slice(0, 15000)}
                            {(project.digest?.length || 0) > 15000 && (
                                <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20 border-dashed text-primary text-sm font-bold text-center">
                                    <p>Full digest is {(project.digest?.length || 0).toLocaleString()} characters long.</p>
                                    <p className="opacity-70 font-medium text-xs mt-1">Preview truncated for performance. Please download the full file for the complete codebase.</p>
                                    <a
                                        href={`/api/projects/${project.id}/download`}
                                        className="inline-flex items-center gap-2 mt-4 text-xs underline hover:text-white transition-colors"
                                    >
                                        <Download className="h-3 w-3" /> Download full .txt
                                    </a>
                                </div>
                            )}
                        </pre>
                    </div>
                </div>
            ) : (
                <div className="glass-card p-12 text-center text-muted-foreground rounded-[2.5rem]">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                        <Archive className="h-6 w-6 opacity-30" />
                    </div>
                    <p>This archive doesn't have a stored digest.</p>
                    <p className="text-xs mt-1 opacity-60">Re-analyze the repository to save a full digest.</p>
                </div>
            )}

            <footer className="flex flex-col sm:flex-row justify-between items-center py-4 border-t border-white/5 gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Original Source</span>
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white transition-colors text-xs font-mono truncate max-w-[200px] md:max-w-none">
                        {project.repoUrl}
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Format</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-bold">{project.exportFormat || 'markdown'}</span>
                </div>
            </footer>
        </div>
    );
}
