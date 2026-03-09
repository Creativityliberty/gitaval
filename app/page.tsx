import RepoAnalyzer from './components/RepoAnalyzer';

export const metadata = {
  title: 'Gitavale - Codebase to Prompt',
  description: 'Turn any Git repo into an LLM-ready digest.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white selection:bg-blue-100">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative pt-20 pb-32">
        <RepoAnalyzer />
      </div>

      <footer className="fixed bottom-0 w-full py-6 text-center text-slate-400 text-sm bg-white/80 backdrop-blur-sm border-t border-slate-100">
        <p>© 2026 Gitavale - Nümtema AI Foundry</p>
      </footer>
    </main>
  );
}
