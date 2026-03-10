'use client';

import { useState } from 'react';
import { useRouter, Link } from '../../../navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
    const router = useRouter();
    const t = useTranslations('Auth');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Something went wrong');
            }

            // Automatically redirect to login after successful registration
            router.push('/login?registered=true');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background grid grid-cols-1 md:grid-cols-2 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 bg-grid z-0 opacity-10 pointer-events-none"></div>

            {/* Left Form View */}
            <div className="flex items-center justify-center p-8 relative z-10 glass-panel border-r border-white/5 mx-4 my-4 md:m-0 rounded-[2.5rem] md:rounded-none md:border-r">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <Link href="/" className="inline-block p-2 bg-primary/20 rounded-xl mb-8 border border-primary/30 text-primary hover:bg-primary/30 transition-colors">
                            <span className="font-display font-extrabold tracking-widest text-sm">G I T A V A L E</span>
                        </Link>
                        <h1 className="text-4xl font-display font-extrabold text-white tracking-tight">{t('createAccount')}</h1>
                        <p className="text-muted-foreground mt-2 font-body">Join the next generation of CI/CD parsing.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="p-4 bg-red-950/50 text-red-400 rounded-2xl text-sm font-medium border border-red-500/20">{error}</div>}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/50 transition-all font-body text-white outline-none"
                                placeholder="Jane Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white">{t('email')}</label>
                            <input
                                type="email"
                                required
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/50 transition-all font-body text-white outline-none"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white">{t('password')}</label>
                            <input
                                type="password"
                                required
                                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/50 transition-all font-body text-white outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 btn-primary rounded-2xl flex items-center justify-center gap-2 group text-lg"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t('signup')}
                            {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-muted-foreground font-body">
                        {t('hasAccount')}{' '}
                        <Link href="/login" className="text-primary font-bold hover:underline">
                            {t('login')}
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Image/Brand View */}
            <div className="hidden md:flex relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tl from-cyan-900/60 to-blue-900/40"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>
                <div className="relative z-10 text-center text-white">
                    <h2 className="text-5xl font-display font-extrabold mb-6 text-balance leading-tight text-glow">
                        Stop copy-pasting.<br />
                        Start prompting.<br />
                        Build faster.
                    </h2>
                </div>
            </div>
        </div>
    );
}
