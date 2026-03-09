'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
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
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            {/* Left Form View */}
            <div className="flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">Create Account</h1>
                        <p className="text-slate-500 mt-2 font-body">Join the next generation of CI/CD parsing.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">{error}</div>}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-body text-slate-900"
                                placeholder="Jane Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-body text-slate-900"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-body text-slate-900"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-slate-900/30 transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign Up'}
                            {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 font-body">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 font-bold hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Image/Brand View */}
            <div className="hidden md:flex bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-indigo-900/60 to-blue-900/40 backdrop-blur-3xl"></div>
                <div className="relative z-10 text-center text-white">
                    <div className="inline-flex items-center justify-center p-3 mb-8 bg-blue-50/10 rounded-2xl backdrop-blur border border-white/10">
                        <span className="font-display font-bold tracking-widest text-indigo-200">N Ü M T E M A</span>
                    </div>
                    <h2 className="text-5xl font-display font-extrabold mb-6 text-balance leading-tight">
                        Stop copy-pasting.<br />
                        Start prompting.<br />
                        Build faster.
                    </h2>
                </div>
            </div>
        </div>
    );
}
