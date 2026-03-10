'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Copy, Trash2, Check, AlertCircle, Terminal, Lock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiKey {
    id: string;
    name: string;
    keyPrefix: string;
    createdAt: string;
    lastUsedAt: string | null;
}

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPro, setIsPro] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/api-keys');
            if (res.status === 403) { setIsPro(false); setLoading(false); return; }
            if (res.ok) {
                const data = await res.json();
                setKeys(data.keys || []);
                setIsPro(true);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newKeyName.trim()) return;
        setCreating(true);
        setError('');
        try {
            const res = await fetch('/api/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed to create key'); setCreating(false); return; }
            setCreatedKey(data.key);
            setNewKeyName('');
            setShowCreate(false);
            fetchKeys();
        } catch { setError('Network error'); }
        setCreating(false);
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });
        setKeys(keys.filter(k => k.id !== id));
    };

    const copyKey = async (key: string) => {
        await navigator.clipboard.writeText(key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isPro && !loading) {
        return (
            <div className="space-y-6 animate-reveal">
                <header>
                    <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
                        <Key className="h-8 w-8 text-primary" /> API Keys
                    </h1>
                    <p className="text-muted-foreground">Use Gitavale programmatically from your terminal or CI/CD.</p>
                </header>
                <div className="glass-card p-12 text-center flex flex-col items-center gap-6">
                    <div className="h-16 w-16 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-bold text-white mb-2">API Access — Pro Only</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">Generate API keys to analyze repos programmatically, integrate with CI/CD, or build your own tools on top of Gitavale.</p>
                    </div>
                    <a href="/api/checkout" className="btn-primary flex items-center gap-2">
                        <Zap className="h-4 w-4" /> Upgrade to Pro — €5/month
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-reveal">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
                        <Key className="h-8 w-8 text-primary" /> API Keys
                    </h1>
                    <p className="text-muted-foreground">Manage keys to use Gitavale via terminal or CI/CD pipelines.</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary rounded-xl flex items-center gap-2 whitespace-nowrap">
                    <Plus className="h-4 w-4" /> Generate New Key
                </button>
            </header>

            {/* Shown once after creation */}
            <AnimatePresence>
                {createdKey && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="glass-card p-6 border-emerald-500/30 bg-emerald-500/5">
                        <p className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                            <Check className="h-4 w-4" /> Key created — copy it now, it won&apos;t be shown again!
                        </p>
                        <div className="flex items-center gap-3">
                            <code className="flex-1 font-mono text-sm bg-black/60 px-4 py-3 rounded-xl text-cyan-300 overflow-x-auto">
                                {createdKey}
                            </code>
                            <button onClick={() => copyKey(createdKey)} className="btn-glass px-4 py-3 flex items-center gap-2 text-sm shrink-0">
                                {copied ? <><Check className="h-4 w-4 text-emerald-400" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
                            </button>
                        </div>
                        <button onClick={() => setCreatedKey(null)} className="mt-3 text-xs text-muted-foreground hover:text-white transition-colors">
                            I&apos;ve saved my key ✓ Dismiss
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="glass-card p-6 border-primary/20 space-y-4">
                        <h3 className="font-display font-bold text-white">New API Key</h3>
                        {error && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>}
                        <input
                            type="text"
                            placeholder='e.g. "GitHub Actions CI"'
                            value={newKeyName}
                            onChange={e => setNewKeyName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button onClick={handleCreate} disabled={creating || !newKeyName} className="btn-primary flex items-center gap-2 text-sm">
                                <Key className="h-4 w-4" />{creating ? 'Generating…' : 'Generate Key'}
                            </button>
                            <button onClick={() => { setShowCreate(false); setError(''); }} className="btn-glass text-sm">Cancel</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Keys list */}
            <div className="space-y-4">
                {loading ? (
                    <div className="glass-panel p-12 text-center text-muted-foreground rounded-[2rem]">Loading keys…</div>
                ) : keys.length === 0 ? (
                    <div className="glass-panel p-12 text-center text-muted-foreground rounded-[2rem]">No API keys yet. Generate your first key above.</div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block glass-panel rounded-[2rem] overflow-hidden border border-white/10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Key</th>
                                        <th className="px-6 py-4">Created</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {keys.map(k => (
                                        <tr key={k.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-white">{k.name}</td>
                                            <td className="px-6 py-4">
                                                <code className="font-mono text-sm bg-black/40 px-3 py-1.5 rounded-lg text-cyan-400">
                                                    {k.keyPrefix}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(k.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDelete(k.id)} className="p-2 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                            {keys.map(k => (
                                <div key={k.id} className="glass-card p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-white mb-1">{k.name}</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Created {new Date(k.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <button onClick={() => handleDelete(k.id)} className="p-2.5 text-red-500/70 bg-red-500/5 rounded-xl border border-red-500/10">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-black/40 rounded-xl border border-white/5">
                                        <Key className="h-3.5 w-3.5 text-primary opacity-50" />
                                        <code className="font-mono text-xs text-cyan-400 truncate flex-1">
                                            {k.keyPrefix}
                                        </code>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Usage example */}
            <div className="glass-panel rounded-[2rem] border border-primary/20 bg-primary/5 p-6">
                <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" /> API Usage
                </h3>
                <pre className="p-4 bg-black/50 border border-white/5 rounded-xl font-mono text-sm text-cyan-300 overflow-x-auto">
                    <code>{`# Analyze a repository
curl -X POST https://gitaval.vercel.app/api/v1/analyze \\
  -H "Authorization: Bearer gta_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://github.com/owner/repo"}'

# List your archives
curl https://gitaval.vercel.app/api/v1/archives \\
  -H "Authorization: Bearer gta_your_key_here"

# Get a specific archive with full digest
curl https://gitaval.vercel.app/api/v1/archives/:id \\
  -H "Authorization: Bearer gta_your_key_here"`}</code>
                </pre>
            </div>
        </div>
    );
}
