'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            setError(res.error);
            setLoading(false);
        } else {
            router.push('/dashboard');
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
                        <h1 className="text-4xl font-display font-extrabold text-white tracking-tight">Welcome back</h1>
                        <p className="text-muted-foreground mt-2 font-body">Sign in to your Nümtema Foundry account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="p-4 bg-red-950/50 text-red-400 rounded-2xl text-sm font-medium border border-red-500/20">{error}</div>}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white">Email Address</label>
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
                            <label className="text-sm font-bold text-white">Password</label>
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
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Log In'}
                            {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-muted-foreground font-body">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-primary font-bold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Image/Brand View */}
            <div className="hidden md:flex relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-indigo-900/20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
                <div className="relative z-10 text-center text-white">
                    <h2 className="text-5xl font-display font-extrabold mb-6 text-balance leading-tight text-glow">
                        Your Codebase.<br />
                        AI Ready.<br />
                        In Seconds.
                    </h2>
                    <p className="text-blue-200 text-lg font-body max-w-sm mx-auto">
                        Experience the industry&apos;s fastest repository-to-prompt engine.
                    </p>
                </div>
            </div>
        </div>
    );
}
