import { useEffect, useState, useCallback } from 'react';
import api from '../../api';
import { Game, Bet } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Flag } from '../ui/Flag';
import { showToast } from '../ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';

const PT_TZ = 'Europe/Lisbon';

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: PT_TZ });
}

function formatDateLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: PT_TZ });
}

function getPortugalDate(dateStr: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: PT_TZ }).format(new Date(dateStr));
}

interface GameCardProps {
  game: Game;
  bet: Bet | undefined;
  onBetPlaced: () => void;
}

function GameCard({ game, bet, onBetPlaced }: GameCardProps) {
  const { t } = useLang();
  const now = new Date();
  const matchDate = new Date(game.match_date);
  const canBet = now < matchDate && game.status === 'scheduled';

  const [homeInput, setHomeInput] = useState(bet ? String(bet.home_score) : '');
  const [awayInput, setAwayInput] = useState(bet ? String(bet.away_score) : '');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const hasBet = !!bet;

  const handleSave = async () => {
    const h = parseInt(homeInput);
    const a = parseInt(awayInput);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      showToast(t('toast.invalidBet'), 'error');
      return;
    }
    setSaving(true);
    try {
      await api.placeBet(game.id, h, a);
      showToast(t('toast.betSaved'), 'success');
      setEditing(false);
      onBetPlaced();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('toast.betError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const phaseLabel = (() => {
    if (game.phase === 'group') return t('bets.phase.group', { name: game.group_name || '' });
    const map: Record<string, string> = {
      r32: t('bets.phase.r32'), r16: t('bets.phase.r16'),
      qf: t('bets.phase.qf'), sf: t('bets.phase.sf'),
      '3rd': t('bets.phase.3rd'), final: t('bets.phase.final'),
    };
    return map[game.phase] || game.phase;
  })();

  return (
    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/50">{phaseLabel}</span>
        <span className="text-xs text-white/50">{formatTime(game.match_date)} • {game.venue}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1 flex-1">
          <Flag team={game.home_team} size="lg" />
          <span className="text-white text-xs font-medium text-center leading-tight">{game.home_team}</span>
        </div>

        <div className="flex-1 flex flex-col items-center">
          {game.status === 'finished' ? (
            <div className="text-white font-bold text-xl">{game.home_score} - {game.away_score}</div>
          ) : (
            <span className="text-white/40 text-xs">{t('bets.vs')}</span>
          )}

          {canBet && (!hasBet || editing) ? (
            <div className="mt-2 flex items-center gap-1">
              <input type="number" min="0" max="20" value={homeInput} onChange={(e) => setHomeInput(e.target.value)}
                className="w-10 bg-primary-dark border border-white/20 rounded-lg text-center text-white text-sm py-1 focus:outline-none focus:border-gold"
                placeholder="0" />
              <span className="text-white/60">-</span>
              <input type="number" min="0" max="20" value={awayInput} onChange={(e) => setAwayInput(e.target.value)}
                className="w-10 bg-primary-dark border border-white/20 rounded-lg text-center text-white text-sm py-1 focus:outline-none focus:border-gold"
                placeholder="0" />
            </div>
          ) : hasBet && !editing ? (
            <div className="mt-2 text-center">
              <div className="text-gold text-sm font-bold">{bet!.home_score} - {bet!.away_score}</div>
              <div className="text-white/40 text-xs">{t('bets.yourBet')}</div>
            </div>
          ) : !hasBet && !canBet ? (
            <div className="mt-2 text-white/40 text-xs text-center">{t('bets.noBet')}</div>
          ) : null}
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          <Flag team={game.away_team} size="lg" />
          <span className="text-white text-xs font-medium text-center leading-tight">{game.away_team}</span>
        </div>
      </div>

      {canBet && (!hasBet || editing) && (
        <div className="mt-3 flex gap-2">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-gold text-primary-dark font-bold py-2 rounded-xl text-sm disabled:opacity-50">
            {saving ? t('bets.saving') : hasBet ? t('bets.update') : t('bets.place')}
          </button>
          {editing && (
            <button onClick={() => { setEditing(false); setHomeInput(String(bet!.home_score)); setAwayInput(String(bet!.away_score)); }}
              className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm">
              {t('bets.cancel')}
            </button>
          )}
        </div>
      )}

      {canBet && hasBet && !editing && (
        <button onClick={() => setEditing(true)}
          className="mt-3 w-full bg-white/10 text-white/70 text-xs py-1.5 rounded-xl hover:bg-white/20">
          {t('bets.edit')}
        </button>
      )}
    </div>
  );
}

interface AdminCardProps {
  game: Game;
  onResultSet: () => void;
}

function AdminResultCard({ game, onResultSet }: AdminCardProps) {
  const { t } = useLang();
  const [homeInput, setHomeInput] = useState(game.home_score != null ? String(game.home_score) : '');
  const [awayInput, setAwayInput] = useState(game.away_score != null ? String(game.away_score) : '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const h = parseInt(homeInput);
    const a = parseInt(awayInput);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      showToast(t('toast.resultError'), 'error');
      return;
    }
    setSaving(true);
    try {
      await api.setResult(game.id, h, a);
      showToast(t('toast.resultSaved'), 'success');
      onResultSet();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('toast.betError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-orange-900/30 rounded-2xl p-4 border border-orange-500/30">
      <div className="text-orange-300 text-xs mb-2 font-semibold">{t('bets.admin.setResult')}</div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-white flex-1 flex items-center gap-1"><Flag team={game.home_team} size="sm" />{game.home_team}</span>
        <input type="number" min="0" value={homeInput} onChange={(e) => setHomeInput(e.target.value)}
          className="w-10 bg-primary-dark border border-orange-500/40 rounded-lg text-center text-white text-sm py-1" />
        <span className="text-white/60">-</span>
        <input type="number" min="0" value={awayInput} onChange={(e) => setAwayInput(e.target.value)}
          className="w-10 bg-primary-dark border border-orange-500/40 rounded-lg text-center text-white text-sm py-1" />
        <span className="text-sm text-white flex-1 text-right flex items-center justify-end gap-1">{game.away_team}<Flag team={game.away_team} size="sm" /></span>
      </div>
      <button onClick={handleSave} disabled={saving}
        className="mt-3 w-full bg-orange-500 text-white font-bold py-2 rounded-xl text-sm disabled:opacity-50">
        {saving ? t('bets.saving') : game.status === 'finished' ? t('bets.admin.updateResult') : t('bets.admin.defineResult')}
      </button>
    </div>
  );
}

export function Bets() {
  const { user } = useAuth();
  const { t } = useLang();
  const [games, setGames] = useState<Game[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<string[]>([]);
  const [adminMode, setAdminMode] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [users, setUsers] = useState<{ id: number; username: string; phone: string | null }[]>([]);
  const [renamingUserId, setRenamingUserId] = useState<number | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [renamingSaving, setRenamingSaving] = useState(false);

  const loadGames = useCallback(async () => {
    setLoading(true);
    try {
      const [allGames, myBets] = await Promise.all([api.getGames(), api.getMyBets()]);
      setBets(myBets);
      const uniqueDates = Array.from(new Set(allGames.map((g) => getPortugalDate(g.match_date)))).sort();
      setDates(uniqueDates);
      const today = getPortugalDate(new Date().toISOString());
      const upcoming = uniqueDates.find((d) => d >= today) || uniqueDates[0] || today;
      if (!selectedDate) setSelectedDate(upcoming);
      setGames(allGames);
    } catch {
      showToast(t('toast.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { loadGames(); }, []);

  useEffect(() => {
    if (adminMode && users.length === 0) {
      api.adminGetUsers().then(setUsers).catch(() => {});
    }
  }, [adminMode]);

  async function handleAdminRename(userId: number) {
    if (!renameInput.trim()) return;
    setRenamingSaving(true);
    try {
      await api.adminRenameUser(userId, renameInput.trim());
      showToast(t('toast.nameSaved'), 'success');
      const updated = await api.adminGetUsers();
      setUsers(updated);
      setRenamingUserId(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('toast.nameError'), 'error');
    } finally {
      setRenamingSaving(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await api.syncESPN();
      showToast(t('toast.syncOk', { n: result.synced }), 'success');
      await loadGames();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('toast.syncError'), 'error');
    } finally {
      setSyncing(false);
    }
  }

  const gamesForDate = games.filter((g) => getPortugalDate(g.match_date) === selectedDate);
  const betMap = new Map(bets.map((b) => [b.game_id, b]));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Admin controls */}
      {user?.isAdmin && (
        <div className="bg-orange-900/30 rounded-2xl p-3 border border-orange-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-orange-300 text-sm font-semibold">{t('bets.admin.title')}</span>
            <button onClick={() => setAdminMode(!adminMode)}
              className={`px-4 py-1.5 rounded-xl text-sm font-bold ${adminMode ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/70'}`}>
              {adminMode ? t('bets.admin.active') : t('bets.admin.inactive')}
            </button>
          </div>
          <button onClick={handleSync} disabled={syncing}
            className="w-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-semibold py-2 rounded-xl disabled:opacity-50">
            {syncing ? t('bets.admin.syncing') : t('bets.admin.sync')}
          </button>

          {adminMode && (
            <div className="border-t border-orange-500/20 pt-2">
              <div className="text-orange-300 text-xs font-bold mb-2">{t('bets.admin.users')}</div>
              <div className="space-y-1.5">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-2">
                    {renamingUserId === u.id ? (
                      <>
                        <input type="text" value={renameInput} onChange={(e) => setRenameInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAdminRename(u.id)}
                          className="flex-1 bg-primary-dark border border-orange-500/40 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-orange-400"
                          placeholder={u.username} autoFocus />
                        <button onClick={() => handleAdminRename(u.id)} disabled={renamingSaving}
                          className="text-orange-300 text-xs font-black disabled:opacity-50">
                          {renamingSaving ? '...' : 'OK'}
                        </button>
                        <button onClick={() => setRenamingUserId(null)} className="text-white/40 text-xs">✕</button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <span className="text-white/80 text-xs font-medium">{u.username}</span>
                          {u.phone && <span className="ml-2 text-white/40 text-xs">{u.phone}</span>}
                        </div>
                        <button onClick={() => { setRenamingUserId(u.id); setRenameInput(''); }}
                          className="text-orange-400/60 hover:text-orange-300 text-xs transition-colors">✏️</button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Date selector */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>
          {dates.map((d) => (
            <button key={d} onClick={() => setSelectedDate(d)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${selectedDate === d ? 'bg-gold text-primary-dark' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
              {formatDateLabel(d + 'T12:00:00')}
            </button>
          ))}
        </div>
      </div>

      {/* Games */}
      {gamesForDate.length === 0 ? (
        <div className="text-center text-white/50 py-12">
          <div className="text-4xl mb-3">⚽</div>
          <p>{t('bets.noGames')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gamesForDate.map((game) => (
            <div key={game.id}>
              {adminMode ? (
                <AdminResultCard game={game} onResultSet={loadGames} />
              ) : (
                <GameCard game={game} bet={betMap.get(game.id)} onBetPlaced={loadGames} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
