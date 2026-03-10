'use client';

import { useState, useEffect } from 'react';
import { Save, Sparkles, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ExportSettings {
    format: 'markdown' | 'text' | 'json';
    promptTemplate: string;
}

const DEFAULT_SETTINGS: ExportSettings = {
    format: 'markdown',
    promptTemplate: "You are an expert software engineer. Review the following codebase. Analyze its architecture, highlight potential security vulnerabilities, and suggest performance optimizations.\n\nCodebase Digest:\n"
};

export default function SettingsPage() {
    const t = useTranslations('Settings');
    const tc = useTranslations('Common');
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
                <h1 className="text-3xl font-display font-bold text-white mb-2">{t('title')}</h1>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prompt Templates */}
                <div className="glass-card p-6 md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-display font-semibold text-white">{t('promptTitle')}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t('promptDesc')}
                    </p>
                    <textarea
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        rows={6}
                        value={settings.promptTemplate}
                        onChange={(e) => setSettings({ ...settings, promptTemplate: e.target.value })}
                        placeholder={t('promptPlaceholder')}
                    />
                </div>

                {/* Export Format */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-display font-semibold text-white">{t('formatTitle')}</h2>
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
                            <span className="text-white font-medium">{t('formatMarkdown')}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{t('formatMarkdownHint')}</span>
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
                            <span className="text-white font-medium">{t('formatText')}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{t('formatTextHint')}</span>
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
                            <span className="text-white font-medium">{t('formatJson')}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{t('formatJsonHint')}</span>
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
                            <>{tc('saved')}</>
                        ) : (
                            <><Save className="w-4 h-4" /> {t('saveSettings')}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
