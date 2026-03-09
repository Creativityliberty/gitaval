'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Trash2, FolderOpen, Database } from 'lucide-react';

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
        const stored = localStorage.getItem('gitavale_projects');
        if (stored) {
            setProjects(JSON.parse(stored));
        }
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
                className="fixed left-6 top-6 z-50 p-3 bg-white shadow-xl rounded-full border border-blue-100 hover:scale-110 transition-transform md:translate-x-0"
            >
                <History className="h-6 w-6 text-blue-600" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="fixed left-4 top-4 bottom-4 w-80 bg-white shadow-2xl rounded-3xl z-[70] border border-blue-50 flex flex-col overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Database className="h-5 w-5 text-blue-600" />
                                    <h2 className="font-display font-bold text-xl text-slate-800">Projects</h2>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                    <X className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-4 space-y-3">
                                {projects.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FolderOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 text-sm">No projects yet</p>
                                    </div>
                                ) : (
                                    projects.map((project) => (
                                        <button
                                            key={project.id}
                                            onClick={() => {
                                                onSelectProject(project.url);
                                                setIsOpen(false);
                                            }}
                                            className="w-full text-left p-4 rounded-2xl border border-slate-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-semibold text-slate-700 truncate">{project.repo}</span>
                                                <button
                                                    onClick={(e) => deleteProject(project.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="text-xs text-slate-400 truncate">{project.owner}</div>
                                            <div className="text-[10px] text-slate-300 mt-2">
                                                {new Date(project.timestamp).toLocaleDateString()}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    WebStorage Multi-Tenant Active
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
