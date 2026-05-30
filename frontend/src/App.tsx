import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useLang } from './context/LanguageContext';
import { theme } from './theme';
import { Auth } from './components/Auth';
import { Home } from './components/tabs/Home';
import { Rules } from './components/tabs/Rules';
import { Bets } from './components/tabs/Bets';
import { Results } from './components/tabs/Results';
import { Standings } from './components/tabs/Standings';
import { PhoneGate } from './components/PhoneGate';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ToastContainer } from './components/ui/Toast';

type Tab = 'home' | 'rules' | 'bets' | 'results' | 'standings';

function App() {
  const { user, loading, logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'home', label: t('tabs.home'), icon: '🏠' },
    { id: 'rules', label: t('tabs.rules'), icon: '📋' },
    { id: 'bets', label: t('tabs.bets'), icon: '⚽' },
    { id: 'results', label: t('tabs.results'), icon: '📊' },
    { id: 'standings', label: t('tabs.standings'), icon: '🏆' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl">⚽</div>
          <LoadingSpinner size="lg" />
          <p className="text-white/30 text-xs font-medium tracking-widest uppercase">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <ToastContainer />
        <Auth />
      </>
    );
  }

  if (theme.requirePhone && !user.phone) {
    return (
      <>
        <ToastContainer />
        <PhoneGate />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-white flex flex-col">
      <ToastContainer />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-primary-dark/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">⚽</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-lg leading-none text-hikma">{theme.logoText}</span>
            <span className="text-white/35 text-xs font-medium">{t('app.subtitle')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {theme.multiLang && (
            <>
              <button
                onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
                className="text-white/40 text-xs font-bold hover:text-white/70 transition-colors px-2 py-1 rounded-lg hover:bg-white/10 tracking-wide"
              >
                {lang === 'pt' ? 'EN' : 'PT'}
              </button>
              <span className="text-white/20 text-xs">|</span>
            </>
          )}
          <span className="text-white/55 text-sm font-medium">{user.username}</span>
          <button
            onClick={logout}
            className="text-white/35 text-xs hover:text-white/70 transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
          >
            {t('app.logout')}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24 max-w-2xl mx-auto w-full">
        {activeTab === 'home' && <Home />}
        {activeTab === 'rules' && <Rules />}
        {activeTab === 'bets' && <Bets />}
        {activeTab === 'results' && <Results />}
        {activeTab === 'standings' && <Standings />}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-primary-dark/80 backdrop-blur-xl border-t border-white/10 flex z-10 safe-area-inset-bottom">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all relative ${
              activeTab === tab.id ? 'text-gold' : 'text-white/35 hover:text-white/70'
            }`}
          >
            {activeTab === tab.id && (
              <div className="absolute top-0 inset-x-4 h-0.5 bg-gold rounded-full" />
            )}
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-[10px] font-semibold leading-tight">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
