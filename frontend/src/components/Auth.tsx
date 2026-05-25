import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { showToast } from './ui/Toast';

export function Auth() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Preenche todos os campos', 'error');
      return;
    }
    if (tab === 'register') {
      if (password.length < 6) {
        showToast('Password deve ter pelo menos 6 caracteres', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showToast('Passwords não coincidem', 'error');
        return;
      }
    }
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(username, password);
        showToast('Bem-vindo!', 'success');
      } else {
        await register(username, password);
        showToast('Conta criada com sucesso!', 'success');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao autenticar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url('/hikma-cleanroom.jpg')" }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-primary/75 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚽</div>
          <h1 className="text-4xl font-black leading-none tracking-tight">
            <span className="text-hikma">hikma</span><span className="text-hikma">.</span>
          </h1>
          <p className="text-white/50 text-sm mt-2 font-medium">Copa do Mundo 2026 • Apostas</p>
        </div>

        {/* Glass card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl shadow-black/50">
          {/* Tabs */}
          <div className="flex rounded-xl bg-black/30 p-1 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === 'login'
                  ? 'bg-gold text-primary-dark shadow-lg'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === 'register'
                  ? 'bg-gold text-primary-dark shadow-lg'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Registar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-[10px] mb-1.5 font-bold uppercase tracking-widest">
                Utilizador
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-gold/60 focus:bg-white/15 transition-all text-sm font-medium"
                placeholder="O teu nome"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-white/50 text-[10px] mb-1.5 font-bold uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-gold/60 focus:bg-white/15 transition-all text-sm font-medium"
                placeholder="••••••"
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-white/50 text-[10px] mb-1.5 font-bold uppercase tracking-widest">
                  Confirmar Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-gold/60 focus:bg-white/15 transition-all text-sm font-medium"
                  placeholder="••••••"
                  autoComplete="new-password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-primary-dark font-black py-3.5 rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 text-sm shadow-lg shadow-gold/20 mt-2"
            >
              {loading ? 'Aguarda...' : tab === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>
        </div>

        <p className="text-white/25 text-xs text-center mt-6 font-medium">
          Grupo Hikma • Copa do Mundo 2026
        </p>
      </div>
    </div>
  );
}
