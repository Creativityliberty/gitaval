import RepoAnalyzer from './components/RepoAnalyzer';
import Link from 'next/link';

export const metadata = {
  title: 'Gitavale - Codebase to Prompt',
  description: 'Turn any Git repo into an LLM-ready digest.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white selection:bg-blue-100 font-body pb-32">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      {/* Navigation Layer */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="font-display font-extrabold text-blue-600 text-2xl tracking-tight">Gitavale</div>
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-bold transition-colors">Log in</Link>
          <Link href="/register" className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">Sign up</Link>
        </div>
      </nav>

      <div className="relative pt-10">
        <RepoAnalyzer />
      </div>

      <footer className="fixed bottom-0 w-full py-6 text-center text-slate-400 text-sm bg-white/80 backdrop-blur-sm border-t border-slate-100 z-40">
        <p>© 2026 Gitavale - Nümtema AI Foundry</p>
      </footer>
    </main>
  );
}
