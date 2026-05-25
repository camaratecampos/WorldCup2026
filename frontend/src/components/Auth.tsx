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
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">⚽</div>
        <h1 className="text-3xl font-bold text-gold mb-1">Hikma</h1>
        <p className="text-white/70 text-sm">Copa do Mundo 2026 - Apostas</p>
      </div>

      {/* Card */}
      <div className="bg-white/10 rounded-2xl p-6 w-full max-w-sm backdrop-blur-sm border border-white/20">
        {/* Tabs */}
        <div className="flex rounded-xl bg-black/20 p-1 mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'login'
                ? 'bg-gold text-primary-dark'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'register'
                ? 'bg-gold text-primary-dark'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Registar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-xs mb-1 font-medium">Utilizador</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-gold text-sm"
              placeholder="O teu nome"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-white/80 text-xs mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-gold text-sm"
              placeholder="••••••"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-white/80 text-xs mb-1 font-medium">Confirmar Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-gold text-sm"
                placeholder="••••••"
                autoComplete="new-password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-primary-dark font-bold py-3 rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Aguarda...' : tab === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>
      </div>

      <p className="text-white/40 text-xs mt-6">Grupo Hikma • Copa do Mundo 2026</p>
    </div>
  );
}
