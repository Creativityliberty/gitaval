import RepoAnalyzer from "../../components/RepoAnalyzer";
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
    const t = useTranslations('Dashboard');

    return (
        <>
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('description')}</p>
                </div>
            </header>

            <div className="glass-panel rounded-[2.5rem] p-1 border border-white/5 relative">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                    <RepoAnalyzer />
                </div>
            </div>
        </>
    );
}
