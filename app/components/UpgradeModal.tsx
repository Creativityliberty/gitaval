'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    reason: 'anon' | 'free_limit';
}

export default function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 glass-panel border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {reason === 'anon' ? (
                            <>
                                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 mb-6 mx-auto">
                                    <Sparkles className="h-7 w-7 text-primary" />
                                </div>
                                <h2 className="text-2xl font-display font-extrabold text-white text-center mb-3">
                                    You&apos;ve used your free preview
                                </h2>
                                <p className="text-muted-foreground text-center text-sm mb-8 leading-relaxed">
                                    Create a free account to unlock <span className="text-white font-bold">3 analyses per month</span> — no credit card required. Upgrade later for unlimited access.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Link href="/register" className="btn-primary w-full py-3.5 text-center text-base font-bold rounded-2xl block">
                                        Create Free Account →
                                    </Link>
                                    <Link href="/login" className="w-full py-3 text-center text-sm text-muted-foreground hover:text-white transition-colors">
                                        Already have an account? Sign in
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 mb-6 mx-auto">
                                    <Zap className="h-7 w-7 text-primary" />
                                </div>
                                <h2 className="text-2xl font-display font-extrabold text-white text-center mb-3">
                                    Monthly limit reached
                                </h2>
                                <p className="text-muted-foreground text-center text-sm mb-2 leading-relaxed">
                                    You&apos;ve used your <span className="text-white font-bold">3 free analyses</span> this month.
                                </p>
                                <p className="text-muted-foreground text-center text-sm mb-8">
                                    Upgrade to Pro for <span className="text-primary font-bold">unlimited analyses</span>, archive storage, and custom prompt templates.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <a href="/api/checkout" className="btn-primary w-full py-3.5 text-center text-base font-bold rounded-2xl block">
                                        ⚡ Upgrade to Pro — €5/month
                                    </a>
                                    <button onClick={onClose} className="w-full py-3 text-center text-sm text-muted-foreground hover:text-white transition-colors">
                                        Maybe later
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
