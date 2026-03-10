import RepoAnalyzer from './components/RepoAnalyzer';
import Link from 'next/link';
import { Terminal, Database, Shield, Zap, Code2, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Gitavale - Codebase to Prompt',
  description: 'Turn any Git repo into an LLM-ready digest.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/30 pb-20 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-grid z-0 opacity-20 pointer-events-none"></div>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen"></div>
      </div>

      {/* Floating Glass Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl glass-panel rounded-full px-6 py-4 flex items-center justify-between animate-reveal">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" />
          <span className="font-display font-extrabold text-white text-xl tracking-tight text-glow">
            Gitavale
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-muted-foreground hover:text-white font-medium transition-colors text-sm">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary text-sm py-2 px-5">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="relative z-10 pt-40 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-24 animate-reveal" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/20 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Nümtema Foundry 2026</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 leading-tight tracking-tight">
            Your Github Repo, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-300">
              compressed for AI.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-body">
            Convert entire codebases into a single, context-ready payload for LLMs in seconds. No setup required.
          </p>
        </section>

        {/* The Analyzer - Central Piece */}
        <section className="mb-32 animate-reveal" style={{ animationDelay: '0.2s' }}>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-[3rem] blur opacity-20"></div>
            <div className="relative">
              <RepoAnalyzer />
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="mb-32">
          <div className="text-center mb-16 animate-reveal" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              Everything you need. <span className="text-muted-foreground">Nothing you don&apos;t.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] animate-reveal" style={{ animationDelay: '0.4s' }}>
            {/* Large Card */}
            <div className="glass-card md:col-span-2 md:row-span-2 p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-500"></div>
              <Code2 className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-2xl font-display font-bold text-white mb-3">Intelligent Parsing</h3>
              <p className="text-muted-foreground font-body max-w-md">
                Our analyzer automatically ignores node_modules, build artifacts, and binaries, ensuring your LLM context window isn&apos;t wasted on garbage.
              </p>
              {/* Fake Code Block Visual */}
              <div className="mt-auto bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-xs text-muted-foreground">
                <div className="flex gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/50"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/50"></span>
                </div>
                <p><span className="text-primary">import</span> &#123; Parser &#125; <span className="text-primary">from</span> '@gitavale/core';</p>
                <p>const result = await Parser.analyze('https://github.com/...');</p>
              </div>
            </div>

            {/* Small Card 1 */}
            <div className="glass-card p-8 flex flex-col justify-between group">
              <div>
                <Zap className="w-8 h-8 text-cyan-400 mb-4" />
                <h3 className="text-xl font-display font-bold text-white mb-2">Token Estimation</h3>
                <p className="text-sm text-muted-foreground">Know exactly how much context you&apos;re consuming before pasting into ChatGPT or Claude.</p>
              </div>
            </div>

            {/* Small Card 2 */}
            <div className="glass-card p-8 flex flex-col justify-between group">
              <div>
                <Database className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-display font-bold text-white mb-2">ZIP Export</h3>
                <p className="text-sm text-muted-foreground">Download a neatly organized ZIP archive containing your codebase structure and full text digest.</p>
              </div>
            </div>

            {/* Wide Card */}
            <div className="glass-card md:col-span-3 p-8 flex flex-col md:flex-row items-center justify-between gap-8 group">
              <div>
                <Shield className="w-10 h-10 text-emerald-400 mb-4" />
                <h3 className="text-2xl font-display font-bold text-white mb-2">Enterprise Grade</h3>
                <p className="text-muted-foreground max-w-2xl">Secure backend processing, no code storage, and edge-native performance powered by Vercel.</p>
              </div>
              <div className="shrink-0">
                <Link href="/register" className="btn-glass px-8 py-4 text-white">
                  Start Analyzing
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <Terminal className="w-5 h-5 text-white" />
            <span className="font-display font-bold text-white tracking-widest text-sm uppercase">Gitavale</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2026 Nümtema AI Foundry. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
