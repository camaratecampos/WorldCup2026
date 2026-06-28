import { useState } from 'react';
import api from '../../api';
import { GamePrediction } from '../../types';
import { useLang } from '../../context/LanguageContext';

function getTrend(h: number, a: number): 'H' | 'D' | 'A' {
  return h > a ? 'H' : h < a ? 'A' : 'D';
}

interface Props {
  gameId: number;
  /** Actual scores — only provided once the game is finished */
  actualHome?: number | null;
  actualAway?: number | null;
  finished?: boolean;
  /** Whether the game has kicked off — predictions stay hidden until it has */
  started?: boolean;
}

export function PredictionsPanel({ gameId, actualHome, actualAway, finished, started = true }: Props) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [predictions, setPredictions] = useState<GamePrediction[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Before kickoff, other players' predictions are hidden so nobody can copy.
  if (!started) {
    return (
      <div className="mt-3 pt-2.5 border-t border-white/10">
        <div className="flex items-center gap-1.5 text-white/30 text-xs">
          <span>🔒</span>
          <span>{t('predictions.locked')}</span>
        </div>
      </div>
    );
  }

  const toggle = async () => {
    if (!open && predictions === null) {
      setLoading(true);
      try {
        const data = await api.getGamePredictions(gameId);
        setPredictions(data);
      } catch {
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    }
    setOpen(o => !o);
  };

  const count = predictions?.length ?? null;

  return (
    <div className="mt-3 pt-2.5 border-t border-white/10">
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 text-white/40 hover:text-white/60 text-xs transition-colors"
      >
        <span>👥</span>
        <span>
          {count !== null
            ? open ? t('predictions.hide') : `${count} ${t('predictions.show').toLowerCase()}`
            : t('predictions.show')}
        </span>
        <span className="text-white/25">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-2">
          {loading ? (
            <div className="text-white/30 text-xs py-1">...</div>
          ) : !predictions || predictions.length === 0 ? (
            <p className="text-white/30 text-xs py-1">{t('predictions.empty')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {predictions.map((p) => {
                let rowClass = 'text-white/55';
                if (finished && actualHome != null && actualAway != null) {
                  const isExact = p.home_score === actualHome && p.away_score === actualAway;
                  const correctTrend = getTrend(p.home_score, p.away_score) === getTrend(actualHome, actualAway);
                  if (isExact) rowClass = 'text-green-400';
                  else if (correctTrend) rowClass = 'text-yellow-400';
                  else rowClass = 'text-white/30';
                }
                return (
                  <div key={p.username} className={`flex items-center justify-between text-xs ${rowClass}`}>
                    <span className="truncate mr-1">{p.username}</span>
                    <span className="font-bold tabular-nums shrink-0">{p.home_score}–{p.away_score}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
