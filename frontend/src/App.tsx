import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { Home } from './components/tabs/Home';
import { Rules } from './components/tabs/Rules';
import { Bets } from './components/tabs/Bets';
import { Results } from './components/tabs/Results';
import { Standings } from './components/tabs/Standings';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ToastContainer } from './components/ui/Toast';

type Tab = 'home' | 'rules' | 'bets' | 'results' | 'standings';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Início', icon: '🏠' },
  { id: 'rules', label: 'Regras', icon: '📋' },
  { id: 'bets', label: 'Apostas', icon: '⚽' },
  { id: 'results', label: 'Resultados', icon: '📊' },
  { id: 'standings', label: 'Classificação', icon: '🏆' },
];

function App() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚽</div>
          <LoadingSpinner size="lg" />
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

  return (
    <div className="min-h-screen bg-primary text-white flex flex-col">
      <ToastContainer />

      {/* Header */}
      <header className="bg-primary-dark border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <div>
            <h1 className="text-gold font-bold text-sm leading-tight">Hikma</h1>
            <p className="text-white/50 text-xs leading-tight">Copa 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-sm">{user.username}</span>
          <button
            onClick={logout}
            className="text-white/50 text-xs hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
          >
            Sair
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
      <nav className="fixed bottom-0 left-0 right-0 bg-primary-dark border-t border-white/10 flex z-10 safe-area-inset-bottom">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              activeTab === tab.id ? 'text-gold' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="text-xs leading-tight">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
