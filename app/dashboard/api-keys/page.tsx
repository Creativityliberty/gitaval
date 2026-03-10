import { Key, Plus, Copy, Trash2, Eye } from "lucide-react";

export default function ApiKeysPage() {
    return (
        <div className="animate-reveal">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                        <Key className="h-8 w-8 text-primary" />
                        API Keys
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage keys to use Gitavale via the terminal or in your CI/CD pipelines.</p>
                </div>
                <button className="btn-primary rounded-xl flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Generate New Key
                </button>
            </header>

            <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-muted-foreground text-sm font-bold uppercase tracking-wider">
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Key Preview</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4">Last Used</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {/* Placeholder Key Row */}
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-medium text-white">GitHub Actions CI</div>
                                <div className="text-xs text-muted-foreground">Production environment</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-mono text-sm bg-black/40 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 text-cyan-400">
                                    gt_•••••••••••••••••••••
                                    <button className="hover:text-white transition-colors"><Eye className="h-3 w-3" /></button>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">Mar 10, 2026</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">1 hour ago</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-all">
                                        <Copy className="h-4 w-4" />
                                    </button>
                                    <button className="p-2 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        {/* Placeholder Key Row 2 */}
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-medium text-white">Local Terminal</div>
                                <div className="text-xs text-muted-foreground">Development</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-mono text-sm bg-black/40 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 text-cyan-400">
                                    gt_•••••••••••••••••••••
                                    <button className="hover:text-white transition-colors"><Eye className="h-3 w-3" /></button>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">Mar 01, 2026</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">Yesterday</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-all">
                                        <Copy className="h-4 w-4" />
                                    </button>
                                    <button className="p-2 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-8 p-6 glass-panel rounded-[2rem] border border-primary/20 bg-primary/5">
                <h3 className="font-display font-bold text-white mb-2 flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" /> API Usage Example
                </h3>
                <pre className="mt-4 p-4 bg-black/50 border border-white/5 rounded-xl font-mono text-sm text-cyan-300 overflow-x-auto">
                    <code>
                        {`curl -X POST https://api.gitavale.com/v1/analyze \\
  -H "Authorization: Bearer gt_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://github.com/owner/repo"}'`}
                    </code>
                </pre>
            </div>
        </div>
    );
}
