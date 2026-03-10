import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="animate-reveal">
            <header className="mb-8">
                <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                    <Settings className="h-8 w-8 text-primary" />
                    Settings & Preferences
                </h1>
                <p className="text-muted-foreground mt-2">Manage your account, export preferences, and digest templates.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Section */}
                <div className="glass-panel rounded-[2rem] p-8">
                    <h2 className="text-xl font-display font-bold text-white mb-6">Profile Settings</h2>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground">Display Name</label>
                            <input type="text" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 text-white outline-none" defaultValue="User" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground">Email Address</label>
                            <input type="email" disabled className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-muted-foreground cursor-not-allowed" defaultValue="user@example.com" />
                        </div>
                    </form>
                </div>

                {/* Export Preferences */}
                <div className="glass-panel rounded-[2rem] p-8">
                    <h2 className="text-xl font-display font-bold text-white mb-6">Digest Format</h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-white">Include File Tree</h3>
                                <p className="text-sm text-muted-foreground mt-1">Append the directory structure at the top of the digest.</p>
                            </div>
                            <button className="w-12 h-6 bg-primary rounded-full relative transition-colors">
                                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-white">XML Tag Encodings</h3>
                                <p className="text-sm text-muted-foreground mt-1">Wrap files in Claude-friendly &lt;file&gt; tags.</p>
                            </div>
                            <button className="w-12 h-6 bg-primary rounded-full relative transition-colors">
                                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                    <button className="btn-primary rounded-xl flex items-center gap-2">
                        <Save className="h-4 w-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
