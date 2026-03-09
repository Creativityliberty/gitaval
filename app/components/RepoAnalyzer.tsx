'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, Loader2, FileCode, Check, Download, ChevronRight, ChevronDown, Rocket } from 'lucide-react';
import Sidebar from './Sidebar';
import ProgressBanner from './ProgressBanner';
import JSZip from 'jszip';

export default function RepoAnalyzer() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [treeOpen, setTreeOpen] = useState(true);

    const handleAnalyze = async (e?: React.FormEvent, manualUrl?: string) => {
        if (e) e.preventDefault();
        const targetUrl = manualUrl || url;
        if (!targetUrl) return;

        setLoading(true);
        setError('');
        setResult(null);
        setStatusMessage('INITIALIZING ANALYSIS...');

        try {
            setStatusMessage('FETCHING REPOSITORY METADATA...');
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: targetUrl }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to analyze repository');
            }

            setStatusMessage('PARSING FILE SYSTEM...');
            const data = await res.json();

            setStatusMessage('GENERATING LLM DIGEST...');
            setResult(data);
            saveToHistory(targetUrl, data.summary);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saveToHistory = (repoUrl: string, summary: any) => {
        const stored = localStorage.getItem('gitavale_projects');
        const projects = stored ? JSON.parse(stored) : [];
        const newProject = {
            id: Math.random().toString(36).substr(2, 9),
            url: repoUrl,
            timestamp: Date.now(),
            owner: summary.owner,
            repo: summary.repo
        };
        const updated = [newProject, ...projects.filter((p: { url: string; }) => p.url !== repoUrl)].slice(0, 10);
        localStorage.setItem('gitavale_projects', JSON.stringify(updated));
    };

    const handleCopy = () => {
        if (!result) return;
        const text = `${formatSummary(result.summary)}\n\n${result.tree}\n\n${result.content}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExportZip = async () => {
        if (!result) return;
        setStatusMessage('PREPARING ZIP ARCHIVE...');
        const zip = new JSZip();

        // Add summary and tree
        zip.file('SUMMARY.md', formatSummary(result.summary));
        zip.file('STRUCTURE.txt', result.tree);
        zip.file('FULL_DIGEST.txt', result.content);

        const content = await zip.generateAsync({ type: 'blob' });
        const element = document.createElement('a');
        element.href = URL.createObjectURL(content);
        element.download = `${result.summary.repo}-digest.zip`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setStatusMessage('');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatSummary = (summary: any) => {
        return `Repository: ${summary.owner}/${summary.repo}\nFiles analyzed: ${summary.filesAnalyzed}\nEstimated tokens: ${summary.estimatedTokens}`;
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8 relative">
            <ProgressBanner message={statusMessage} />
            <Sidebar onSelectProject={(selectedUrl) => {
                setUrl(selectedUrl);
                handleAnalyze(undefined, selectedUrl);
            }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center justify-center p-2 mb-6 bg-blue-50 rounded-2xl">
                    <Rocket className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-5xl md:text-6xl font-display font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 mb-4 tracking-tight">
                    Gitavale
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                    Turn any Git repository into a prompt-ready text digest for LLMs.
                </p>
            </motion.div>

            <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-3 border border-blue-50 mb-12 max-w-3xl mx-auto">
                <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-2">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-blue-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-5 border-none rounded-[1.8rem] bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-slate-400 text-lg"
                            placeholder="https://github.com/owner/repo"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !url}
                        className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[1.8rem] transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center justify-center min-w-[160px] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Analyze'}
                    </button>
                </form>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-red-50 text-red-600 rounded-3xl mb-8 text-center border border-red-100 font-medium"
                >
                    {error}
                </motion.div>
            )}

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Files Analyzed', value: result.summary.filesAnalyzed, color: 'text-blue-600' },
                                { label: 'Estimated Tokens', value: result.summary.estimatedTokens.toLocaleString(), color: 'text-indigo-600' },
                                { label: 'Context Size', value: `${(result.content.length / 1024).toFixed(1)} KB`, color: 'text-cyan-600' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</div>
                                    <div className={`text-3xl font-display font-extrabold ${stat.color}`}>{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Main Content Area */}
                        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/30 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-xl">
                                        <FileCode className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <span className="font-display font-bold text-xl text-slate-800 uppercase tracking-tight">Digest Preview</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleExportZip}
                                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 rounded-2xl text-sm font-bold transition-all"
                                    >
                                        <Download className="h-4 w-4" />
                                        ZIP Export
                                    </button>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col h-[700px]">
                                {/* Retractable Structure Header */}
                                <button
                                    onClick={() => setTreeOpen(!treeOpen)}
                                    className="flex items-center gap-2 px-8 py-4 bg-slate-50/50 border-b border-slate-100 hover:bg-slate-100 transition-colors"
                                >
                                    {treeOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Repository Structure</span>
                                </button>

                                <div className="flex flex-grow overflow-hidden">
                                    {/* File Tree Panel */}
                                    <AnimatePresence>
                                        {treeOpen && (
                                            <motion.div
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: '30%', opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                className="hidden md:block border-r border-slate-100 p-6 overflow-y-auto bg-slate-50/20 text-sm font-mono text-slate-600"
                                            >
                                                <pre className="whitespace-pre text-[12px] leading-relaxed">{result.tree}</pre>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Content Panel */}
                                    <div className={`flex-grow p-8 overflow-y-auto font-mono text-sm bg-white ${!treeOpen ? 'w-full' : 'md:w-[70%]'}`}>
                                        <pre className="text-slate-800 whitespace-pre-wrap font-bold mb-4">{formatSummary(result.summary)}</pre>
                                        <div className="my-6 border-b border-dashed border-slate-200"></div>
                                        <pre className="text-slate-600 leading-relaxed text-[13px]">{result.content.slice(0, 8000)}...

                                            {result.content.length > 8000 && (
                                                <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 border-dashed">
                                                    <span className="text-blue-600 font-bold block mb-1">Preview Truncated ⚡</span>
                                                    <span className="text-blue-400 text-xs">Copy or Export to ZIP to get the full digest.</span>
                                                </div>
                                            )}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
