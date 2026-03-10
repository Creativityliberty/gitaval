'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Lock, Camera, Check, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setAvatar(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (newPassword && newPassword !== confirmPassword) {
            setStatus({ type: 'error', msg: 'Passwords do not match' });
            return;
        }
        setLoading(true);
        setStatus(null);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name || undefined, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined, avatar: avatar || undefined }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Update failed');
            setStatus({ type: 'success', msg: 'Profile updated successfully!' });
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (e) {
            setStatus({ type: 'error', msg: e instanceof Error ? e.message : 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-reveal">
            <div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">Profile</h1>
                <p className="text-muted-foreground">Update your name, password, and avatar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Avatar Card */}
                <div className="glass-card p-8 flex flex-col items-center gap-4">
                    <div
                        onClick={() => fileRef.current?.click()}
                        className="relative h-24 w-24 rounded-3xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center cursor-pointer hover:border-primary/60 transition-colors overflow-hidden group"
                    >
                        {avatar
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                            : <User className="h-10 w-10 text-primary/50" />
                        }
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    <p className="text-xs text-muted-foreground text-center">Click to upload avatar<br />PNG, JPG, GIF up to 2MB</p>
                    <button onClick={() => fileRef.current?.click()} className="btn-glass text-sm px-4 py-2">
                        Change Photo
                    </button>
                </div>

                {/* Info & Password */}
                <div className="md:col-span-2 space-y-4">
                    <div className="glass-card p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-primary" />
                            <h2 className="text-lg font-display font-bold text-white">Display Name</h2>
                        </div>
                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                        />
                    </div>

                    <div className="glass-card p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="h-4 w-4 text-primary" />
                            <h2 className="text-lg font-display font-bold text-white">Change Password</h2>
                        </div>
                        <input
                            type="password"
                            placeholder="Current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                        />
                        <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                        />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                        />
                    </div>
                </div>
            </div>

            {status && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-medium
                        ${status.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                >
                    {status.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {status.msg}
                </motion.div>
            )}

            <div className="flex justify-end">
                <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {loading ? 'Saving…' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
