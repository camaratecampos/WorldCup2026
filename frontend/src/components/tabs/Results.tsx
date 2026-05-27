import { useEffect, useState } from 'react';
import api from '../../api';
import { GameWithBet, TeamStats } from '../../types';
import { Flag } from '../ui/Flag';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useLang } from '../../context/LanguageContext';

type SubTab = 'games' | 'groups' | 'third';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Lisbon' });
}

function getTrend(home: number, away: number): 'H' | 'D' | 'A' {
  if (home > away) return 'H';
  if (home === away) return 'D';
  return 'A';
}

function ResultCard({ game }: { game: GameWithBet }) {
  const { t } = useLang();
  const hasResult = game.home_score != null && game.away_score != null;
  const hasBet = game.bet_home != null && game.bet_away != null;
  const points = game.points;

  let cardBg = 'bg-white/10';
  let pointsDisplay = null;

  if (hasResult && hasBet) {
    if (points != null && points > 0) {
      const betTrend = getTrend(game.bet_home!, game.bet_away!);
      const actualTrend = getTrend(game.home_score!, game.away_score!);
      const isExact = game.bet_home === game.home_score && game.bet_away === game.away_score;
      if (isExact) {
        cardBg = 'bg-green-900/40 border-green-500/40';
      } else if (betTrend === actualTrend) {
        cardBg = 'bg-yellow-900/30 border-yellow-500/30';
      }
      pointsDisplay = (
        <span className={`font-bold text-sm ${isExact ? 'text-green-400' : 'text-yellow-400'}`}>
          +{points}pt
        </span>
      );
    } else {
      cardBg = 'bg-red-900/20 border-red-500/20';
      pointsDisplay = <span className="font-bold text-sm text-red-400">0pt</span>;
    }
  } else if (hasResult && !hasBet) {
    cardBg = 'bg-white/5 border-white/5';
    pointsDisplay = <span className="text-white/40 text-xs">{t('results.noBet')}</span>;
  }

  const phaseLabel = (() => {
    if (game.phase === 'group') return t('results.phase.group', { name: game.group_name || '' });
    const map: Record<string, string> = {
      r32: t('results.phase.r32'), r16: t('results.phase.r16'),
      qf: t('results.phase.qf'), sf: t('results.phase.sf'),
      '3rd': t('results.phase.3rd'), final: t('results.phase.final'),
    };
    return map[game.phase] || game.phase;
  })();

  return (
    <div className={`rounded-2xl p-4 border ${cardBg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/50">{phaseLabel} • {formatDate(game.match_date)}</span>
        {pointsDisplay}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Flag team={game.home_team} size="sm" />
          <span className="text-white text-sm font-medium truncate">{game.home_team}</span>
        </div>
        <div className="flex flex-col items-center px-3">
          <div className="text-white font-bold text-lg">
            {game.home_score} - {game.away_score}
          </div>
          {hasBet && (
            <div className="text-white/50 text-xs">
              {t('results.bet')} {game.bet_home} - {game.bet_away}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="text-white text-sm font-medium truncate text-right">{game.away_team}</span>
          <Flag team={game.away_team} size="sm" />
        </div>
      </div>
    </div>
  );
}

function GroupTable({ group, teams }: { group: string; teams: TeamStats[] }) {
  const { t } = useLang();
  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden border border-white/10">
      <div className="bg-primary-light px-4 py-2">
        <span className="text-gold font-bold text-sm">{t('results.phase.group', { name: group })}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-3 py-2 text-white/50 font-medium">{t('results.col.team')}</th>
              <th className="text-center px-2 py-2 text-white/50 font-medium">{t('results.col.p')}</th>
              <th className="text-center px-2 py-2 text-white/50 font-medium">{t('results.col.w')}</th>
              <th className="text-center px-2 py-2 text-white/50 font-medium">{t('results.col.d')}</th>
              <th className="text-center px-2 py-2 text-white/50 font-medium">{t('results.col.l')}</th>
              <th className="text-center px-2 py-2 text-white/50 font-medium">{t('results.col.gf')}</th>
              <th className="text-center px-2 py-2 text-white/50 font-medium">{t('results.col.ga')}</th>
              <th className="text-center px-2 py-2 text-white/50 font-medium">{t('results.col.gd')}</th>
              <th className="text-center px-2 py-2 text-white/50 font-medium">{t('results.col.pts')}</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => (
              <tr key={team.team} className={`border-b border-white/5 ${idx < 2 ? 'bg-green-900/20' : idx === 2 ? 'bg-yellow-900/10' : ''}`}>
                <td className="px-3 py-2 text-white font-medium flex items-center gap-1.5">
                  <Flag team={team.team} size="sm" />
                  <span className="truncate max-w-[80px]">{team.team}</span>
                </td>
                <td className="text-center px-2 py-2 text-white/70">{team.played}</td>
                <td className="text-center px-2 py-2 text-white/70">{team.won}</td>
                <td className="text-center px-2 py-2 text-white/70">{team.drawn}</td>
                <td className="text-center px-2 py-2 text-white/70">{team.lost}</td>
                <td className="text-center px-2 py-2 text-white/70">{team.gf}</td>
                <td className="text-center px-2 py-2 text-white/70">{team.ga}</td>
                <td className="text-center px-2 py-2 text-white/70">{team.gd >= 0 ? `+${team.gd}` : team.gd}</td>
                <td className="text-center px-2 py-2 text-gold font-bold">{team.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ThirdPlaceTable({ teams }: { teams: (TeamStats & { group: string })[] }) {
  const { t } = useLang();
  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden border border-white/10">
      <div className="bg-primary-light px-4 py-2">
        <span className="text-gold font-bold text-sm">{t('results.third.title')}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-center px-2 py-2 text-white/50">#</th>
              <th className="text-left px-3 py-2 text-white/50 font-medium">{t('results.col.team')}</th>
              <th className="text-center px-2 py-2 text-white/50 font-medium">{t('results.col.grp')}</th>
              <th className="text-center px-2 py-2 text-white/50 font-medium">{t('results.col.p')}</th>
              <th className="text-center px-2 py-2 text-white/50 font-medium">{t('results.col.gd')}</th>
              <th className="text-center px-2 py-2 text-white/50 font-medium">{t('results.col.gf')}</th>
              <th className="text-center px-2 py-2 text-white/50 font-medium">{t('results.col.pts')}</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => (
              <tr key={`${team.group}-${team.team}`} className={`border-b border-white/5 ${idx < 8 ? 'bg-green-900/20' : ''}`}>
                <td className="text-center px-2 py-2 text-white/50">{idx + 1}</td>
                <td className="px-3 py-2 text-white font-medium flex items-center gap-1.5">
                  <Flag team={team.team} size="sm" />
                  <span className="truncate max-w-[80px]">{team.team}</span>
                </td>
                <td className="text-center px-2 py-2 text-white/50">{team.group}</td>
                <td className="text-center px-2 py-2 text-white/70">{team.played}</td>
                <td className="text-center px-2 py-2 text-white/70">{team.gd >= 0 ? `+${team.gd}` : team.gd}</td>
                <td className="text-center px-2 py-2 text-white/70">{team.gf}</td>
                <td className="text-center px-2 py-2 text-gold font-bold">{team.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 text-xs text-white/40 flex items-center gap-2">
        <span className="w-3 h-3 rounded bg-green-900/40 inline-block"></span>
        <span>{t('results.third.advance')}</span>
      </div>
    </div>
  );
}

export function Results() {
  const { t } = useLang();
  const [subTab, setSubTab] = useState<SubTab>('games');
  const [results, setResults] = useState<GameWithBet[]>([]);
  const [groups, setGroups] = useState<Record<string, TeamStats[]>>({});
  const [thirdPlace, setThirdPlace] = useState<(TeamStats & { group: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [r, g, th] = await Promise.all([api.getResults(), api.getGroups(), api.getThirdPlace()]);
      setResults(r); setGroups(g); setThirdPlace(th);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'games', label: t('results.tab.games') },
    { id: 'groups', label: t('results.tab.groups') },
    { id: 'third', label: t('results.tab.third') },
  ];

  return (
    <div className="space-y-4 pb-4">
      <div className="flex rounded-xl bg-black/20 p-1">
        {subTabs.map((tab) => (
          <button key={tab.id} onClick={() => setSubTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${subTab === tab.id ? 'bg-gold text-primary-dark' : 'text-white/70 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          {subTab === 'games' && (
            <div className="space-y-3">
              {results.length === 0 ? (
                <div className="text-center text-white/50 py-12"><div className="text-4xl mb-3">⚽</div><p>{t('results.noResults')}</p></div>
              ) : results.map((game) => <ResultCard key={game.id} game={game} />)}
            </div>
          )}

          {subTab === 'groups' && (
            <div className="space-y-4">
              {Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([grp, teams]) => (
                <GroupTable key={grp} group={grp} teams={teams} />
              ))}
              {Object.keys(groups).length === 0 && (
                <div className="text-center text-white/50 py-12"><p>{t('results.awaitGroups')}</p></div>
              )}
              <div className="flex gap-4 text-xs text-white/50 px-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-green-900/40 inline-block"></span>{t('results.legend.qualify')}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-yellow-900/30 inline-block"></span>{t('results.legend.possible')}
                </div>
              </div>
            </div>
          )}

          {subTab === 'third' && (
            <div className="space-y-4">
              <ThirdPlaceTable teams={thirdPlace} />
              {thirdPlace.length === 0 && (
                <div className="text-center text-white/50 py-12"><p>{t('results.awaitThird')}</p></div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
