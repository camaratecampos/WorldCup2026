import { useEffect, useState } from 'react';
import api from '../../api';
import { StandingEntry } from '../../types';
import { Flag } from '../ui/Flag';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';

export function Standings() {
  const { user } = useAuth();
  const { t } = useLang();
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStandings()
      .then(setStandings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white/10 rounded-2xl overflow-hidden border border-white/10">
        <div className="bg-primary-light px-4 py-3 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h2 className="text-gold font-bold">{t('standings.title')}</h2>
        </div>

        <div className="divide-y divide-white/5">
          {standings.map((entry) => {
            const isMe = entry.username === user?.username;
            const medalEmoji =
              entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;

            return (
              <div
                key={entry.userId}
                className={`px-4 py-3 flex items-center gap-3 ${
                  isMe ? 'bg-gold/10 border-l-2 border-gold' : ''
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {medalEmoji ? (
                    <span className="text-xl">{medalEmoji}</span>
                  ) : (
                    <span className="text-white/50 font-bold text-sm">{entry.rank}</span>
                  )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold truncate ${isMe ? 'text-gold' : 'text-white'}`}>
                      {entry.username}
                    </span>
                    {isMe && <span className="text-xs text-gold/70">{t('standings.me')}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-white/40">{entry.gamesBet} {t('standings.bets')}</span>
                    {entry.teamPick && (
                      <span className="text-xs text-white/50 flex items-center gap-1">
                        <Flag team={entry.teamPick} size="sm" />
                        <span>{entry.teamPick}</span>
                      </span>
                    )}
                    {entry.teamPickBonus > 0 && (
                      <span className="text-xs text-gold/70 font-semibold">
                        +{entry.teamPickBonus}{t('standings.teamBonus')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${isMe ? 'text-gold' : 'text-white'}`}>
                    {entry.totalPoints}
                  </div>
                  <div className="text-xs text-white/40">{t('standings.points')}</div>
                </div>
              </div>
            );
          })}
        </div>

        {standings.length === 0 && (
          <div className="text-center text-white/50 py-12">
            <div className="text-4xl mb-3">⚽</div>
            <p>{t('standings.empty')}</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white/5 rounded-2xl p-4 text-xs text-white/50 space-y-1">
        <p><span className="text-white/70 font-semibold">{t('standings.legend.points')}</span></p>
        <p><span className="text-white/70 font-semibold">{t('standings.legend.bets')}</span></p>
      </div>
    </div>
  );
}
