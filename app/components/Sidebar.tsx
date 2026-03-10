'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, X, Trash2, FolderOpen } from 'lucide-react';

interface Project {
    id: string;
    url: string;
    timestamp: number;
    owner: string;
    repo: string;
}

export default function Sidebar({ onSelectProject }: { onSelectProject: (url: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/projects');
                if (res.ok) {
                    const data = await res.json();
                    if (data.projects && data.projects.length > 0) {
                        const formatted = data.projects.map((p: any) => ({
                            id: p.id,
                            url: p.repoUrl,
                            timestamp: new Date(p.timestamp).getTime(),
                            owner: p.owner,
                            repo: p.repoName
                        }));
                        setProjects(formatted);
                        localStorage.setItem('gitavale_projects', JSON.stringify(formatted));
                        return;
                    }
                }
            } catch (e) {
                console.error("Failed to fetch cloud projects", e);
            }

            const stored = localStorage.getItem('gitavale_projects');
            if (stored) {
                setProjects(JSON.parse(stored));
            }
        };

        fetchProjects();
    }, [isOpen]);

    const deleteProject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        localStorage.setItem('gitavale_projects', JSON.stringify(updated));
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed right-6 bottom-6 z-50 p-4 btn-glass hover:scale-110 transition-transform flex items-center gap-3 shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)] border border-primary/30 group"
                title="Project Archives"
            >
                <Archive className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                <span className="text-sm text-white font-bold hidden sm:block">My Archives</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="fixed left-4 right-4 sm:right-auto top-4 bottom-4 w-[calc(100vw-2rem)] sm:w-80 glass-panel shadow-2xl rounded-3xl z-[70] border border-white/10 flex flex-col overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                                <div className="flex items-center gap-3">
                                    <Archive className="h-5 w-5 text-primary" />
                                    <h2 className="font-display font-bold text-xl text-white">My Archives</h2>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="h-5 w-5 text-muted-foreground hover:text-white" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-black/40">
                                {projects.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                        <p className="text-muted-foreground text-sm">No projects yet</p>
                                    </div>
                                ) : (
                                    projects.map((project) => (
                                        <button
                                            key={project.id}
                                            onClick={() => {
                                                onSelectProject(project.url);
                                                setIsOpen(false);
                                            }}
                                            className="w-full text-left p-4 rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all group glass-panel"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-white truncate tracking-tight">{project.repo}</span>
                                                <button
                                                    onClick={(e) => deleteProject(project.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-muted-foreground transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">{project.owner}</div>
                                            <div className="text-[10px] text-primary/50 mt-2 font-mono">
                                                {new Date(project.timestamp).toLocaleDateString()}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="p-6 border-t border-white/10 bg-black/20 text-center">
                                <Link
                                    href="/dashboard/archives"
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs text-primary hover:underline font-bold tracking-widest uppercase"
                                >
                                    View Dashboard Archives
                                </Link>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

import Link from 'next/link';
