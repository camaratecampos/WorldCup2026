import { teamsByGroup } from '../../utils/flags';
import { Flag } from '../ui/Flag';

export function Rules() {
  return (
    <div className="space-y-4 pb-4">
      {/* Photo header */}
      <div className="relative h-40 rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hikma-factory.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h2 className="text-white font-black text-xl leading-tight">Regras do Jogo</h2>
          <p className="text-white/45 text-xs font-medium mt-0.5">Lê antes de apostar</p>
        </div>
      </div>

      {/* Tournament info */}
      <div className="bg-white/8 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
        <h2 className="text-lg font-black text-gold mb-1">Copa do Mundo 2026</h2>
        <p className="text-white/50 text-sm font-medium">EUA, Canadá e México • 11 Jun – 19 Jul 2026</p>

        <div className="mt-4 space-y-2 text-sm text-white/70">
          <p>🌍 <strong className="text-white font-semibold">48 equipas</strong> • 12 grupos de 4</p>
          <p>⚽ <strong className="text-white font-semibold">104 jogos</strong> no total</p>
          <p>📍 <strong className="text-white font-semibold">16 estádios</strong> em 3 países</p>
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <h3 className="font-bold text-white mb-3 text-sm">Formato</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Fase de Grupos', val: '72 jogos' },
              { label: 'Dezasseis avos (R32)', val: '16 jogos' },
              { label: 'Oitavos (R16)', val: '8 jogos' },
              { label: 'Quartos de Final', val: '4 jogos' },
              { label: 'Meias Finais', val: '2 jogos' },
              { label: '3º e 4º Lugar', val: '1 jogo' },
              { label: 'Final', val: '1 jogo' },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between items-center py-1">
                <span className="text-white/55">{label}</span>
                <span className="text-white font-semibold text-xs bg-white/10 px-2.5 py-1 rounded-full">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scoring rules */}
      <div className="bg-white/8 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
        <h2 className="text-lg font-black text-gold mb-4">Pontuação</h2>

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/15">
                <th className="text-left py-2 px-1 text-white/40 font-semibold text-xs uppercase tracking-wide">Fase</th>
                <th className="text-center py-2 px-1 text-white/40 font-semibold text-xs uppercase tracking-wide">Tendência</th>
                <th className="text-center py-2 px-1 text-white/40 font-semibold text-xs uppercase tracking-wide">+ Exacto</th>
              </tr>
            </thead>
            <tbody>
              {[
                { phase: 'Grupos', trend: 4, exact: 2 },
                { phase: 'R32', trend: 6, exact: 2 },
                { phase: 'Oitavos', trend: 8, exact: 2 },
                { phase: 'Quartos', trend: 10, exact: 2 },
                { phase: 'Meias / 3º-4º', trend: 13, exact: 2 },
                { phase: 'Final', trend: 15, exact: 2 },
              ].map((row) => (
                <tr key={row.phase} className="border-b border-white/8">
                  <td className="py-3 px-1 text-white font-semibold text-sm">{row.phase}</td>
                  <td className="py-3 px-1 text-center">
                    <span className="bg-yellow-500/20 text-yellow-300 font-black text-sm px-2.5 py-1 rounded-full">
                      {row.trend}pt
                    </span>
                  </td>
                  <td className="py-3 px-1 text-center">
                    <span className="bg-green-500/20 text-green-300 font-black text-sm px-2.5 py-1 rounded-full">
                      +{row.exact}pt
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-1.5 text-xs text-white/40">
          <p><span className="text-white/60 font-semibold">Tendência</span> — acertar em quem ganha, empate ou quem perde</p>
          <p><span className="text-white/60 font-semibold">Exacto</span> — bónus extra por acertar no resultado exacto</p>
        </div>
      </div>

      {/* Team pick rules */}
      <div className="bg-white/8 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
        <h2 className="text-lg font-black text-gold mb-4">Aposta na Equipa</h2>
        <p className="text-white/55 text-sm mb-4 leading-relaxed">
          Antes do início do torneio, cada participante escolhe uma equipa vencedora.
          Não é possível alterar após o início do torneio.
        </p>

        <div className="space-y-2">
          {[
            { label: 'Alcança as Meias e Perde', pts: 12, icon: '🥈' },
            { label: 'Alcança a Final e Perde', pts: 20, icon: '🥈' },
            { label: 'Vence o Torneio', pts: 30, icon: '🏆' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/8">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{row.icon}</span>
                <span className="text-white text-sm font-medium">{row.label}</span>
              </div>
              <span className="text-gold font-black text-base">{row.pts}pt</span>
            </div>
          ))}
        </div>
      </div>

      {/* Groups */}
      <div className="bg-white/8 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
        <h2 className="text-lg font-black text-gold mb-4">Os 12 Grupos</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(teamsByGroup)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([group, teams]) => (
              <div key={group} className="bg-white/5 rounded-xl p-3 border border-white/8">
                <div className="text-gold font-black text-xs mb-2.5 uppercase tracking-wide">Grupo {group}</div>
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
