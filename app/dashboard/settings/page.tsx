'use client';

import { useState, useEffect } from 'react';
import { Save, Sparkles, FileText } from 'lucide-react';

interface ExportSettings {
    format: 'markdown' | 'text' | 'json';
    promptTemplate: string;
}

const DEFAULT_SETTINGS: ExportSettings = {
    format: 'markdown',
    promptTemplate: "You are an expert software engineer. Review the following codebase. Analyze its architecture, highlight potential security vulnerabilities, and suggest performance optimizations.\n\nCodebase Digest:\n"
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<ExportSettings>(DEFAULT_SETTINGS);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('gitavale_settings');
        if (stored) {
            try {
                setSettings(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('gitavale_settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6 animate-reveal">
            <div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">Export Settings</h1>
                <p className="text-muted-foreground">Configure how Gitavale formats your codebase digests and define custom prompts for LLMs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prompt Templates */}
                <div className="glass-card p-6 md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-display font-semibold text-white">Prompt Template</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        This text will be automatically prepended to the top of your generated repository digests. Use this to instruct your LLM on what to do with the code.
                    </p>
                    <textarea
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        rows={6}
                        value={settings.promptTemplate}
                        onChange={(e) => setSettings({ ...settings, promptTemplate: e.target.value })}
                        placeholder="E.g., Please review this codebase for bugs..."
                    />
                </div>

                {/* Export Format */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-display font-semibold text-white">Default Export Format</h2>
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                            <input
                                type="radio"
                                name="format"
                                value="markdown"
                                checked={settings.format === 'markdown'}
                                onChange={() => setSettings({ ...settings, format: 'markdown' })}
                                className="accent-primary"
                            />
                            <span className="text-white font-medium">Markdown (.md)</span>
                            <span className="text-xs text-muted-foreground ml-auto">Recommended for UI</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                            <input
                                type="radio"
                                name="format"
                                value="text"
                                checked={settings.format === 'text'}
                                onChange={() => setSettings({ ...settings, format: 'text' })}
                                className="accent-primary"
                            />
                            <span className="text-white font-medium">Plain Text (.txt)</span>
                            <span className="text-xs text-muted-foreground ml-auto">Best for raw tokens</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
                            <input
                                type="radio"
                                name="format"
                                value="json"
                                checked={settings.format === 'json'}
                                onChange={() => setSettings({ ...settings, format: 'json' })}
                                className="accent-primary"
                            />
                            <span className="text-white font-medium">JSON (.json)</span>
                            <span className="text-xs text-muted-foreground ml-auto">For Agent API</span>
                        </label>
                    </div>
                </div>

                {/* Save Section */}
                <div className="md:col-span-2 flex justify-end mt-4">
                    <button
                        onClick={handleSave}
                        className="btn-primary flex items-center gap-2"
                    >
                        {saved ? (
                            <>Saved!</>
                        ) : (
                            <><Save className="w-4 h-4" /> Save Settings</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
