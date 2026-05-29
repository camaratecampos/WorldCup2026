import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import api from '../../api';
import { Game, StandingEntry } from '../../types';
import { allTeams } from '../../utils/flags';
import { Flag } from '../ui/Flag';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { showToast } from '../ui/Toast';

// Opening game: Mexico vs South Africa, June 11 2026 at 20:00 Portugal time (19:00 UTC)
const TOURNAMENT_START = new Date('2026-06-11T19:00:00Z');

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Lisbon',
  });
}

function Countdown() {
  const { t } = useLang();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    function tick() {
      const diff = TOURNAMENT_START.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) return null;

  const Cell = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-primary-dark rounded-xl w-14 h-14 flex items-center justify-center text-2xl font-bold text-gold tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-white/50 text-xs mt-1">{label}</span>
    </div>
  );

  return (
    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
      <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
        <span>⏳</span> {t('home.countdown.title')}
      </h3>
      <div className="flex justify-around">
        <Cell value={timeLeft.days} label={t('home.countdown.days')} />
        <Cell value={timeLeft.hours} label={t('home.countdown.hours')} />
        <Cell value={timeLeft.minutes} label={t('home.countdown.minutes')} />
        <Cell value={timeLeft.seconds} label={t('home.countdown.seconds')} />
      </div>
      <p className="text-center text-white/40 text-xs mt-3">{t('home.countdown.until')}</p>
    </div>
  );
}

export function Home() {
  const { user, refreshUser } = useAuth();
  const { t } = useLang();
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamPickOpen, setTeamPickOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [savingTeamPick, setSavingTeamPick] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const now = new Date();
  const canPickTeam = now < TOURNAMENT_START;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [standingsData, gamesData, betsData] = await Promise.all([
        api.getStandings(),
        api.getGames(),
        api.getMyBets(),
      ]);
      setStandings(standingsData);
      const betGameIds = new Set(betsData.map((b) => b.game_id));

      const in7days = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
      const upcoming = gamesData
        .filter((g) => new Date(g.match_date) > now && new Date(g.match_date) < in7days && g.status === 'scheduled' && !betGameIds.has(g.id))
        .slice(0, 3);
      setUpcomingGames(upcoming);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleRename() {
    if (!newName.trim()) return;
    setSavingName(true);
    try {
      const result = await api.renameMe(newName.trim());
      localStorage.setItem('token', result.token);
      await refreshUser();
      setEditingName(false);
      showToast(t('toast.nameSaved'), 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('toast.nameError'), 'error');
    } finally {
      setSavingName(false);
    }
  }

  async function handleTeamPick() {
    if (!selectedTeam) {
      showToast(t('toast.chooseTeam'), 'error');
      return;
    }
    setSavingTeamPick(true);
    try {
      await api.setTeamPick(selectedTeam);
      await refreshUser();
      setTeamPickOpen(false);
      showToast(t('toast.teamPicked', { team: selectedTeam }), 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('toast.teamError'), 'error');
    } finally {
      setSavingTeamPick(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const myRank = standings.find((s) => s.username === user?.username);
  const top5 = standings.slice(0, 5);

  return (
    <div className="space-y-4 pb-4">
      {/* Hero photo */}
      <div className="relative h-44 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hikma-lab.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/50 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <div className="text-[10px] font-black text-hikma uppercase tracking-widest mb-1">Copa Hikma 2026</div>
          <p className="text-white/55 text-xs font-medium">May the best predictor win</p>
        </div>
      </div>

      {/* Welcome header */}
      <div className="bg-gradient-to-br from-primary-light to-primary rounded-2xl p-5 text-white border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">{t('home.hello')}</p>
            {editingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  className="bg-white/20 border border-white/40 rounded-lg px-2 py-1 text-white text-sm w-32 focus:outline-none focus:border-gold"
                  placeholder={user?.username}
                  autoFocus
                />
                <button onClick={handleRename} disabled={savingName} className="text-gold text-xs font-black disabled:opacity-50">
                  {savingName ? '...' : 'OK'}
                </button>
                <button onClick={() => setEditingName(false)} className="text-white/40 text-xs">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{user?.username}</h2>
                <button
                  onClick={() => { setNewName(''); setEditingName(true); }}
                  className="text-white/30 hover:text-white/60 transition-colors text-sm"
                  title={t('home.editName')}
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gold">{myRank?.totalPoints ?? 0}</div>
            <div className="text-xs text-white/70">{t('home.points')}</div>
          </div>
        </div>
        {myRank && (
          <div className="mt-3 flex items-center gap-2">
            <span className="bg-gold text-primary-dark text-xs font-bold px-2 py-0.5 rounded-full">
              #{myRank.rank}
            </span>
            <span className="text-xs text-white/70">{t('home.ranking')}</span>
          </div>
        )}
      </div>

      {/* Countdown */}
      <Countdown />

      {/* Team pick */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <span>🏆</span> {t('home.teamPick.title')}
        </h3>
        {canPickTeam ? (
          !teamPickOpen ? (
            user?.teamPick ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flag team={user.teamPick} size="lg" />
                  <div>
                    <div className="font-semibold text-white">{user.teamPick}</div>
                    <div className="text-xs text-white/50">{t('home.teamPick.canChange')}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedTeam(user.teamPick!); setTeamPickOpen(true); }}
                  className="bg-white/10 text-white/70 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-white/20 transition-colors"
                >
                  {t('home.teamPick.change')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setTeamPickOpen(true)}
                className="bg-gold text-primary-dark font-bold px-4 py-2 rounded-xl text-sm hover:bg-gold-light transition-colors"
              >
                {t('home.teamPick.choose')}
              </button>
            )
          ) : (
            <div className="space-y-3">
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-primary border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold"
              >
                <option value="">{t('home.teamPick.placeholder')}</option>
                {allTeams.map((tm) => (
                  <option key={tm} value={tm}>{tm}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button onClick={handleTeamPick} disabled={savingTeamPick}
                  className="bg-gold text-primary-dark font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50">
                  {savingTeamPick ? t('home.teamPick.saving') : t('home.teamPick.confirm')}
                </button>
                <button onClick={() => setTeamPickOpen(false)}
                  className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm">
                  {t('home.teamPick.cancel')}
                </button>
              </div>
            </div>
          )
        ) : (
          user?.teamPick ? (
            <div className="flex items-center gap-3">
              <Flag team={user.teamPick} size="lg" />
              <div>
                <div className="font-semibold text-white">{user.teamPick}</div>
                <div className="text-xs text-white/50">{t('home.teamPick.locked')}</div>
              </div>
            </div>
          ) : (
            <p className="text-white/60 text-sm">{t('home.teamPick.started')}</p>
          )
        )}
      </div>

      {/* Próximas Apostas */}
      {upcomingGames.length > 0 && (
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <span>⏰</span> {t('home.upcoming.title')}
          </h3>
          <div className="space-y-2">
            {upcomingGames.map((game) => (
              <div key={game.id} className="bg-black/20 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flag team={game.home_team} size="sm" />
                  <span className="text-white/60 text-xs">vs</span>
                  <Flag team={game.away_team} size="sm" />
                </div>
                <div className="text-right">
                  <div className="text-white text-xs">{game.home_team} vs {game.away_team}</div>
                  <div className="text-white/60 text-xs">{formatDate(game.match_date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mini Leaderboard */}
      <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <span>🥇</span> {t('home.standings.title')}
        </h3>
        <div className="space-y-2">
          {top5.map((entry) => (
            <div key={entry.userId}
              className={`flex items-center justify-between py-2 px-3 rounded-xl ${entry.username === user?.username ? 'bg-gold/20 border border-gold/40' : 'bg-black/20'}`}>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold w-5 text-center ${entry.rank === 1 ? 'text-gold' : entry.rank === 2 ? 'text-gray-300' : entry.rank === 3 ? 'text-amber-600' : 'text-white/60'}`}>
                  {entry.rank}
                </span>
                <span className="text-white text-sm font-medium">{entry.username}</span>
                {entry.teamPick && <Flag team={entry.teamPick} size="sm" />}
              </div>
              <span className="text-gold font-bold text-sm">{entry.totalPoints}pt</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
