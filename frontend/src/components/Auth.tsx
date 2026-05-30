import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { theme } from '../theme';
import { showToast } from './ui/Toast';

export function Auth() {
  const { login, register } = useAuth();
  const { t } = useLang();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showToast(t('toast.fillFields'), 'error');
      return;
    }
    if (tab === 'register') {
      if (password.length < 6) {
        showToast(t('toast.passwordMin'), 'error');
        return;
      }
      if (password !== confirmPassword) {
        showToast(t('toast.passwordMismatch'), 'error');
        return;
      }
      if (!phone.trim() || phone.trim().length < 5) {
        showToast(t('toast.phoneInvalid'), 'error');
        return;
      }
    }
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(username, password);
        showToast(t('toast.welcome'), 'success');
      } else {
        await register(username, password, phone.trim());
        showToast(t('toast.registered'), 'success');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('toast.authError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background photo or gradient */}
      {theme.authPhoto ? (
        <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: `url('${theme.authPhoto}')` }} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light" />
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-primary/75 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚽</div>
          <h1 className="text-4xl font-black leading-none tracking-tight">
            <span className="text-hikma">{theme.logoText}</span>
          </h1>
          <p className="text-white/50 text-sm mt-2 font-medium">{t('auth.title')}</p>
        </div>

        {/* Glass card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl shadow-black/50">
          {/* Tabs */}
          <div className="flex rounded-xl bg-black/30 p-1 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === 'login' ? 'bg-gold text-primary-dark shadow-lg' : 'text-white/50 hover:text-white'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === 'register' ? 'bg-gold text-primary-dark shadow-lg' : 'text-white/50 hover:text-white'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-[10px] mb-1.5 font-bold uppercase tracking-widest">
                {t('auth.username')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-gold/60 focus:bg-white/15 transition-all text-sm font-medium"
                placeholder={t('auth.usernamePlaceholder')}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-white/50 text-[10px] mb-1.5 font-bold uppercase tracking-widest">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-gold/60 focus:bg-white/15 transition-all text-sm font-medium"
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-white/50 text-[10px] mb-1.5 font-bold uppercase tracking-widest">
                    {t('auth.confirmPassword')}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-gold/60 focus:bg-white/15 transition-all text-sm font-medium"
                    placeholder={t('auth.passwordPlaceholder')}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-[10px] mb-1.5 font-bold uppercase tracking-widest">
                    {t('auth.phone')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-gold/60 focus:bg-white/15 transition-all text-sm font-medium"
                    placeholder={t('auth.phonePlaceholder')}
                    autoComplete="tel"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-primary-dark font-black py-3.5 rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 text-sm shadow-lg shadow-gold/20 mt-2"
            >
              {loading ? t('auth.submitting') : tab === 'login' ? t('auth.loginButton') : t('auth.registerButton')}
            </button>
          </form>
        </div>

        <p className="text-white/25 text-xs text-center mt-6 font-medium">{theme.appFooter}</p>
      </div>
    </div>
  );
}
