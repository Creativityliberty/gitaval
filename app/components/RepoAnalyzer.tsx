'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, Loader2, FileCode, Check } from 'lucide-react';

export default function RepoAnalyzer() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to analyze repository');
            }

            const data = await res.json();
            setResult(data);
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError('An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        const text = `${formatSummary(result.summary)}\n\n${result.tree}\n\n${result.content}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatSummary = (summary: any) => {
        return `Repository: ${summary.owner}/${summary.repo}\nFiles analyzed: ${summary.filesAnalyzed}\nEstimated tokens: ${summary.estimatedTokens}`;
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
                    Gitavale
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Turn any Git repository into a prompt-ready text digest for LLMs.
                </p>
            </motion.div>

            <div className="bg-white shadow-xl rounded-2xl p-2 border border-blue-100 mb-8">
                <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-2">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-4 border-none rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 placeholder-gray-400 text-lg"
                            placeholder="https://github.com/owner/repo"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !url}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Analyze'}
                    </button>
                </form>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-red-50 text-red-600 rounded-xl mb-8 text-center"
                >
                    {error}
                </motion.div>
            )}

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="text-sm text-slate-500 mb-1">Files Analyzed</div>
                                <div className="text-2xl font-bold text-slate-900">{result.summary.filesAnalyzed}</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="text-sm text-slate-500 mb-1">Estimated Tokens</div>
                                <div className="text-2xl font-bold text-slate-900">{result.summary.estimatedTokens.toLocaleString()}</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="text-sm text-slate-500 mb-1">Context Size</div>
                                <div className="text-2xl font-bold text-slate-900">{(result.content.length / 1024).toFixed(1)} KB</div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <FileCode className="h-5 w-5 text-blue-600" />
                                    <span className="font-semibold text-slate-700">Digest Preview</span>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                                </button>
                            </div>

                            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 h-[600px]">
                                {/* File Tree Panel */}
                                <div className="md:col-span-1 p-4 overflow-y-auto bg-slate-50/30 text-sm font-mono text-slate-600">
                                    <h3 className="font-semibold text-slate-900 mb-3 sticky top-0 bg-transparent">Structure</h3>
                                    <pre className="whitespace-pre">{result.tree}</pre>
                                </div>

                                {/* Content Panel */}
                                <div className="md:col-span-2 p-4 overflow-y-auto font-mono text-sm bg-white">
                                    <pre className="text-slate-800 whitespace-pre-wrap">{formatSummary(result.summary)}</pre>
                                    <div className="my-4 border-b border-dashed border-slate-200"></div>
                                    <pre className="text-slate-600">{result.content.slice(0, 5000)}...

                                        {result.content.length > 5000 && <span className="text-blue-500 italic block mt-4">[Content truncated for preview. Copy to get full digest]</span>}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
