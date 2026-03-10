'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, Loader2, FileCode, Check, Download, ChevronRight, ChevronDown } from 'lucide-react';
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

            let finalContent = data.content; // Assuming data.content is the digest
            let currentPrompt = "";
            let currentFormat = "markdown";

            // Try formatting with custom prompt template
            try {
                const storedSettings = localStorage.getItem('gitavale_settings');
                if (storedSettings) {
                    const settings = JSON.parse(storedSettings);
                    currentFormat = settings.format || "markdown";
                    if (settings.promptTemplate && settings.format !== 'json') {
                        currentPrompt = settings.promptTemplate;
                        finalContent = settings.promptTemplate + "\n\n" + finalContent;
                    }
                }
            } catch (e) {
                console.error("Failed to inject prompt template", e);
            }

            // Update the result object with the potentially modified content
            const updatedResult = { ...data, content: finalContent };

            setStatusMessage('GENERATING LLM DIGEST...');
            setResult(updatedResult);
            saveToHistory(targetUrl, data.summary, currentFormat, currentPrompt, finalContent); // Use original summary for history
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saveToHistory = async (repoUrl: string, summary: any, exportFormat: string, promptTemplate: string, digest: string) => {
        // Save to local storage for guests
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

        // Attempt to save to database (will be ignored if not logged in)
        try {
            await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoUrl,
                    owner: summary.owner,
                    repoName: summary.repo,
                    fileCount: summary.filesAnalyzed,
                    tokenCount: summary.estimatedTokens || 0,
                    exportFormat,
                    promptTemplate,
                    digest
                })
            });
        } catch (e) {
            console.error("Failed to save to cloud history", e);
        }
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

        let exportData = result.content; // Use result.content which might already have the template
        try {
            const storedSettings = localStorage.getItem('gitavale_settings');
            if (storedSettings) {
                const settings = JSON.parse(storedSettings);
                if (settings.promptTemplate && settings.format !== 'json') {
                    // Already injected during analysis if generated freshly, 
                    // but handle zip payload dynamically.
                    // Check if the template is already prepended to avoid duplication
                    exportData = result.content.startsWith(settings.promptTemplate) ? result.content : (settings.promptTemplate + "\n\n" + result.content);
                }
            }
        } catch (e) {
            console.error("Failed to inject prompt template for ZIP", e);
        }

        zip.file('FULL_DIGEST.txt', exportData); // Use exportData for the digest file
        // Assuming metadata is part of result.summary or needs to be constructed
        const metadata = {
            owner: result.summary.owner,
            repo: result.summary.repo,
            filesAnalyzed: result.summary.filesAnalyzed,
            estimatedTokens: result.summary.estimatedTokens,
            timestamp: new Date().toISOString()
        };
        zip.file('metadata.json', JSON.stringify(metadata, null, 2));


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

            <div className="glass-panel backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-3 mb-12 max-w-3xl mx-auto border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
                <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-2 relative z-10">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-primary/70" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-5 border border-white/5 rounded-[1.8rem] bg-black/40 focus:bg-black/60 focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder-muted-foreground text-lg outline-none"
                            placeholder="https://github.com/owner/repo"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !url}
                        className="btn-primary rounded-[1.8rem] flex items-center justify-center min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                        {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Analyze'}
                    </button>
                </form>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-red-950/50 text-red-400 rounded-3xl mb-8 text-center border border-red-500/20 font-medium glass-panel"
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
                                { label: 'Files Analyzed', value: result.summary.filesAnalyzed, color: 'text-primary' },
                                { label: 'Estimated Tokens', value: result.summary.estimatedTokens.toLocaleString(), color: 'text-cyan-400' },
                                { label: 'Context Size', value: `${(result.content.length / 1024).toFixed(1)} KB`, color: 'text-blue-400' }
                            ].map((stat, i) => (
                                <div key={i} className="glass-card p-8">
                                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">{stat.label}</div>
                                    <div className={`text-4xl font-display font-extrabold ${stat.color} text-glow`}>{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Main Content Area */}
                        <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/10">
                            <div className="flex flex-col md:flex-row items-center justify-between px-8 py-6 border-b border-white/10 bg-black/20 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/20 rounded-xl border border-primary/30">
                                        <FileCode className="h-6 w-6 text-primary" />
                                    </div>
                                    <span className="font-display font-bold text-xl text-white uppercase tracking-tight">Digest Preview</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleExportZip}
                                        className="btn-glass flex items-center gap-2 text-sm text-white"
                                    >
                                        <Download className="h-4 w-4" />
                                        ZIP Export
                                    </button>
                                    <button
                                        onClick={handleCopy}
                                        className="btn-primary text-sm flex items-center gap-2"
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col h-[700px] bg-black/40">
                                {/* Retractable Structure Header */}
                                <button
                                    onClick={() => setTreeOpen(!treeOpen)}
                                    className="flex items-center gap-2 px-8 py-4 border-b border-white/10 hover:bg-white/5 transition-colors"
                                >
                                    {treeOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Repository Structure</span>
                                </button>

                                <div className="flex flex-grow overflow-hidden relative">
                                    {/* File Tree Panel */}
                                    <AnimatePresence>
                                        {treeOpen && (
                                            <motion.div
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: '30%', opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                className="hidden md:block border-r border-white/10 p-6 overflow-y-auto bg-black/20 text-sm font-mono text-muted-foreground"
                                            >
                                                <pre className="whitespace-pre text-[12px] leading-relaxed">{result.tree}</pre>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Content Panel */}
                                    <div className={`flex-grow p-8 overflow-y-auto font-mono text-sm ${!treeOpen ? 'w-full' : 'md:w-[70%]'}`}>
                                        <pre className="text-white whitespace-pre-wrap font-bold mb-4">{formatSummary(result.summary)}</pre>
                                        <div className="my-6 border-b border-dashed border-white/20"></div>
                                        <pre className="text-muted-foreground leading-relaxed text-[13px]">{result.content.slice(0, 8000)}...

                                            {result.content.length > 8000 && (
                                                <div className="mt-8 p-6 bg-primary/10 rounded-2xl border border-primary/20 border-dashed">
                                                    <span className="text-primary font-bold block mb-1">Preview Truncated ⚡</span>
                                                    <span className="text-cyan-400/70 text-xs">Copy or Export to ZIP to get the full digest.</span>
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
