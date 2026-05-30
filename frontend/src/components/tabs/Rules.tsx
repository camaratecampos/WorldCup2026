import { teamsByGroup } from '../../utils/flags';
import { Flag } from '../ui/Flag';
import { useLang } from '../../context/LanguageContext';
import { theme } from '../../theme';

export function Rules() {
  const { t } = useLang();

  const formatRows = [
    { key: 'rules.phase.group', games: 72 },
    { key: 'rules.phase.r32', games: 16 },
    { key: 'rules.phase.r16', games: 8 },
    { key: 'rules.phase.qf', games: 4 },
    { key: 'rules.phase.sf', games: 2 },
    { key: 'rules.phase.3rd', games: 1 },
    { key: 'rules.phase.final', games: 1 },
  ] as const;

  const scoringRows = [
    { phaseKey: 'rules.phase.group', trend: 4, exact: 2 },
    { phaseKey: 'rules.phase.r32', trend: 6, exact: 2 },
    { phaseKey: 'rules.phase.r16', trend: 8, exact: 2 },
    { phaseKey: 'rules.phase.qf', trend: 10, exact: 2 },
    { phaseKey: 'rules.phase.sf', trend: 13, exact: 2 },
    { phaseKey: 'rules.phase.final', trend: 15, exact: 2 },
  ] as const;

  return (
    <div className="space-y-4 pb-4">
      {/* Photo / gradient header */}
      <div className="relative h-40 rounded-2xl overflow-hidden">
        {theme.rulesPhoto ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${theme.rulesPhoto}')` }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h2 className="text-white font-black text-xl leading-tight">{t('rules.photo.title')}</h2>
          <p className="text-white/45 text-xs font-medium mt-0.5">{t('rules.photo.subtitle')}</p>
        </div>
      </div>

      {/* Tournament info */}
      <div className="bg-white/8 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
        <h2 className="text-lg font-black text-gold mb-1">{t('rules.tournament.title')}</h2>
        <p className="text-white/50 text-sm font-medium">{t('rules.tournament.subtitle')}</p>
        <div className="mt-4 space-y-2 text-sm text-white/70">
          <p>🌍 <strong className="text-white font-semibold">{t('rules.tournament.teams')}</strong></p>
          <p>⚽ <strong className="text-white font-semibold">{t('rules.tournament.games')}</strong></p>
          <p>📍 <strong className="text-white font-semibold">{t('rules.tournament.stadiums')}</strong></p>
        </div>
        <div className="mt-4 border-t border-white/10 pt-4">
          <h3 className="font-bold text-white mb-3 text-sm">{t('rules.format.title')}</h3>
          <div className="space-y-2 text-sm">
            {formatRows.map(({ key, games }) => (
              <div key={key} className="flex justify-between items-center py-1">
                <span className="text-white/55">{t(key)}</span>
                <span className="text-white font-semibold text-xs bg-white/10 px-2.5 py-1 rounded-full">
                  {games} {t('rules.phase.games')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Betting rules */}
      <div className="bg-white/8 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
        <h2 className="text-lg font-black text-gold mb-4">{t('rules.betting.title')}</h2>
        <div className="space-y-3">
          <div className="flex gap-3 items-start bg-white/5 rounded-xl p-3 border border-white/8">
            <span className="text-xl mt-0.5">🔒</span>
            <div>
              <div className="text-white font-semibold text-sm">{t('rules.betting.lock.title')}</div>
              <div className="text-white/50 text-xs mt-0.5 leading-relaxed">{t('rules.betting.lock.desc')}</div>
            </div>
          </div>
          <div className="flex gap-3 items-start bg-white/5 rounded-xl p-3 border border-white/8">
            <span className="text-xl mt-0.5">⏱️</span>
            <div>
              <div className="text-white font-semibold text-sm">{t('rules.betting.et.title')}</div>
              <div className="text-white/50 text-xs mt-0.5 leading-relaxed">{t('rules.betting.et.desc')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoring rules */}
      <div className="bg-white/8 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
        <h2 className="text-lg font-black text-gold mb-4">{t('rules.scoring.title')}</h2>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/15">
                <th className="text-left py-2 px-1 text-white/40 font-semibold text-xs uppercase tracking-wide">{t('rules.scoring.phase')}</th>
                <th className="text-center py-2 px-1 text-white/40 font-semibold text-xs uppercase tracking-wide">{t('rules.scoring.trend')}</th>
                <th className="text-center py-2 px-1 text-white/40 font-semibold text-xs uppercase tracking-wide">{t('rules.scoring.exact')}</th>
              </tr>
            </thead>
            <tbody>
              {scoringRows.map((row) => (
                <tr key={row.phaseKey} className="border-b border-white/8">
                  <td className="py-3 px-1 text-white font-semibold text-sm">{t(row.phaseKey)}</td>
                  <td className="py-3 px-1 text-center">
                    <span className="bg-yellow-500/20 text-yellow-300 font-black text-sm px-2.5 py-1 rounded-full">{row.trend}pt</span>
                  </td>
                  <td className="py-3 px-1 text-center">
                    <span className="bg-green-500/20 text-green-300 font-black text-sm px-2.5 py-1 rounded-full">+{row.exact}pt</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-1.5 text-xs text-white/40">
          <p>{t('rules.scoring.trendNote')}</p>
          <p>{t('rules.scoring.exactNote')}</p>
        </div>
      </div>

      {/* Team pick rules */}
      <div className="bg-white/8 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
        <h2 className="text-lg font-black text-gold mb-4">{t('rules.teampick.title')}</h2>
        <p className="text-white/55 text-sm mb-4 leading-relaxed">{t('rules.teampick.desc')}</p>
        <div className="space-y-2">
          {([
            { key: 'rules.teampick.semi', pts: 12, icon: '🥈' },
            { key: 'rules.teampick.final', pts: 20, icon: '🥈' },
            { key: 'rules.teampick.winner', pts: 30, icon: '🏆' },
          ] as const).map((row) => (
            <div key={row.key} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/8">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{row.icon}</span>
                <span className="text-white text-sm font-medium">{t(row.key)}</span>
              </div>
              <span className="text-gold font-black text-base">{row.pts}pt</span>
            </div>
          ))}
        </div>
      </div>

      {/* Groups */}
      <div className="bg-white/8 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
        <h2 className="text-lg font-black text-gold mb-4">{t('rules.groups.title')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(teamsByGroup).sort(([a], [b]) => a.localeCompare(b)).map(([group, teams]) => (
            <div key={group} className="bg-white/5 rounded-xl p-3 border border-white/8">
              <div className="text-gold font-black text-xs mb-2.5 uppercase tracking-wide">
                {t('results.phase.group', { name: group })}
              </div>
              <div className="space-y-2">
                {teams.map((team) => (
                  <div key={team} className="flex items-center gap-2">
                    <Flag team={team} size="sm" />
                    <span className="text-white/75 text-xs font-medium truncate">{team}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
