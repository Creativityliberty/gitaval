import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Check, Sparkles, Zap } from "lucide-react";

export default async function UpgradePage() {
    const session = await getServerSession(authOptions);

    let userPlan = "free";
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { plan: true }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userPlan = (user as any)?.plan || "free";
    }

    const isPro = userPlan === "pro";

    const freeFeatures = [
        "Repository analysis (public repos)",
        "LLM-ready text digest",
        "ZIP export",
        "Up to 3 analyses/day",
    ];

    const proFeatures = [
        "Everything in Free",
        "Unlimited analyses",
        "Saved Archives with full digest storage",
        "Custom Prompt Templates",
        "Priority processing",
        "API access (coming soon)",
    ];

    return (
        <div className="space-y-8 animate-reveal">
            <header className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/20 text-primary text-sm font-medium mb-6">
                    <Sparkles className="w-4 h-4" />
                    <span>Simple, transparent pricing</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight">
                    Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-300">Pro</span>
                </h1>
                <p className="text-muted-foreground mt-3 text-lg max-w-xl mx-auto">
                    Get unlimited analyses, archive storage, and custom prompt templates for just €5/month.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <div className="glass-card p-8 flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-xl font-display font-bold text-white mb-1">Free</h2>
                        <div className="flex items-end gap-1 mt-3">
                            <span className="text-5xl font-extrabold text-white">€0</span>
                            <span className="text-muted-foreground mb-2">/month</span>
                        </div>
                    </div>
                    <ul className="space-y-3 flex-grow mb-8">
                        {freeFeatures.map((f) => (
                            <li key={f} className="flex items-center gap-3 text-muted-foreground">
                                <Check className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                                <span className="text-sm">{f}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="w-full py-3 text-center rounded-xl border border-white/10 text-muted-foreground text-sm font-medium">
                        {isPro ? "Previous Plan" : "Current Plan"}
                    </div>
                </div>

                {/* Pro Plan */}
                <div className="relative glass-card p-8 flex flex-col border-primary/40">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-4 py-1 bg-gradient-to-r from-primary to-cyan-400 text-black text-xs font-extrabold uppercase rounded-full tracking-widest shadow-lg">
                            Best Value
                        </span>
                    </div>
                    <div className="absolute inset-0 rounded-[1.8rem] bg-gradient-to-br from-primary/10 to-cyan-500/5 pointer-events-none" />
                    <div className="mb-6 relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-display font-bold text-white">Pro</h2>
                            <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex items-end gap-1 mt-3">
                            <span className="text-5xl font-extrabold text-white text-glow">€5</span>
                            <span className="text-muted-foreground mb-2">/month</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Cancel anytime. Taxes handled by Polar.</p>
                    </div>
                    <ul className="space-y-3 flex-grow mb-8 relative z-10">
                        {proFeatures.map((f) => (
                            <li key={f} className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-sm text-white">{f}</span>
                            </li>
                        ))}
                    </ul>
                    {isPro ? (
                        <div className="w-full py-3.5 text-center rounded-xl bg-primary/20 border border-primary/30 text-primary font-bold text-sm">
                            ✅ You&apos;re on Pro — Enjoy!
                        </div>
                    ) : (
                        <a
                            href="/api/checkout"
                            className="btn-primary w-full py-3.5 text-center rounded-xl text-base font-bold block"
                        >
                            Upgrade to Pro →
                        </a>
                    )}
                </div>
            </div>

            <p className="text-center text-muted-foreground text-xs mt-8">
                Payments are processed securely by{" "}
                <a href="https://polar.sh" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Polar.sh
                </a>{" "}
                — Merchant of Record. EU VAT handled automatically.
            </p>
        </div>
    );
}
