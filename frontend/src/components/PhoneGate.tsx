import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { showToast } from './ui/Toast';
import api from '../api';

export function PhoneGate() {
  const { refreshUser, logout } = useAuth();
  const { t } = useLang();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!phone.trim() || phone.trim().length < 5) {
      showToast(t('toast.phoneInvalid'), 'error');
      return;
    }
    setSaving(true);
    try {
      await api.setPhone(phone.trim());
      await refreshUser();
      showToast(t('toast.phoneSaved'), 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('toast.phoneError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📱</div>
          <h2 className="text-white font-black text-xl">{t('phone.title')}</h2>
          <p className="text-white/50 text-sm mt-2 leading-relaxed">{t('phone.desc')}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl space-y-4">
          <div>
            <label className="block text-white/50 text-[10px] mb-1.5 font-bold uppercase tracking-widest">
              {t('phone.label')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-gold/60 focus:bg-white/15 transition-all text-sm font-medium"
              placeholder={t('phone.placeholder')}
              autoComplete="tel"
              autoFocus
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gold text-primary-dark font-black py-3.5 rounded-xl disabled:opacity-50 text-sm shadow-lg shadow-gold/20 hover:bg-gold-light transition-all"
          >
            {saving ? t('phone.saving') : t('phone.confirm')}
          </button>
          <button
            onClick={logout}
            className="w-full text-white/30 text-xs hover:text-white/60 transition-colors py-1"
          >
            {t('app.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
