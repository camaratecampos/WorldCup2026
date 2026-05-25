export function Rules() {
  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
        <h2 className="text-xl font-bold text-gold mb-1">Copa do Mundo 2026</h2>
        <p className="text-white/70 text-sm">Estados Unidos, Canadá e México • 11 Jun – 22 Jul 2026</p>

        <div className="mt-4 space-y-2 text-sm text-white/80">
          <p>🌍 <strong className="text-white">48 equipas</strong> • 12 grupos de 4</p>
          <p>⚽ <strong className="text-white">104 jogos</strong> no total</p>
          <p>📍 <strong className="text-white">16 estádios</strong> em 3 países</p>
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <h3 className="font-semibold text-white mb-2">Formato</h3>
          <div className="space-y-1 text-sm text-white/70">
            <div className="flex justify-between">
              <span>Fase de Grupos</span>
              <span className="text-white">72 jogos</span>
            </div>
            <div className="flex justify-between">
              <span>Dezasseis avos (R32)</span>
              <span className="text-white">16 jogos</span>
            </div>
            <div className="flex justify-between">
              <span>Oitavos (R16)</span>
              <span className="text-white">8 jogos</span>
            </div>
            <div className="flex justify-between">
              <span>Quartos de Final</span>
              <span className="text-white">4 jogos</span>
            </div>
            <div className="flex justify-between">
              <span>Meias Finais</span>
              <span className="text-white">2 jogos</span>
            </div>
            <div className="flex justify-between">
              <span>3º e 4º Lugar</span>
              <span className="text-white">1 jogo</span>
            </div>
            <div className="flex justify-between">
              <span>Final</span>
              <span className="text-white">1 jogo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scoring rules */}
      <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
        <h2 className="text-xl font-bold text-gold mb-4">Regras de Pontuação</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-2 text-white/60 font-medium">Fase</th>
                <th className="text-center py-2 text-white/60 font-medium">Tendência</th>
                <th className="text-center py-2 text-white/60 font-medium">+ Exacto</th>
              </tr>
            </thead>
            <tbody>
              {[
                { phase: 'Fase de Grupos', trend: 4, exact: 2 },
                { phase: 'Dezasseis (R32)', trend: 6, exact: 2 },
                { phase: 'Oitavos (R16)', trend: 8, exact: 2 },
                { phase: 'Quartos', trend: 10, exact: 2 },
                { phase: 'Meias e 3º/4º', trend: 13, exact: 2 },
                { phase: 'Final', trend: 15, exact: 2 },
              ].map((row) => (
                <tr key={row.phase} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-3 text-white font-medium">{row.phase}</td>
                  <td className="py-3 text-center">
                    <span className="bg-yellow-500/20 text-yellow-300 font-bold px-2 py-0.5 rounded-full">
                      {row.trend}pt
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="bg-green-500/20 text-green-300 font-bold px-2 py-0.5 rounded-full">
                      +{row.exact}pt
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-white/50">
          <p>• <strong className="text-white/70">Tendência</strong>: acertar em quem ganha, empate ou quem perde</p>
          <p className="mt-1">• <strong className="text-white/70">Exacto</strong>: bónus extra por acertar no resultado exacto</p>
        </div>
      </div>

      {/* Team pick rules */}
      <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
        <h2 className="text-xl font-bold text-gold mb-4">Aposta na Equipa</h2>
        <p className="text-white/70 text-sm mb-4">
          Antes do início do torneio, cada participante escolhe uma equipa vencedora.
          Não é possível alterar após o início do torneio.
        </p>

        <div className="space-y-3">
          {[
            { label: 'Alcança as Meias e Perde', pts: 12, icon: '🥈' },
            { label: 'Alcança a Final e Perde', pts: 20, icon: '🥈' },
            { label: 'Vence o Torneio', pts: 30, icon: '🏆' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between bg-black/20 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{row.icon}</span>
                <span className="text-white text-sm">{row.label}</span>
              </div>
              <span className="text-gold font-bold">{row.pts}pt</span>
            </div>
          ))}
        </div>
      </div>

      {/* Groups info */}
      <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
        <h2 className="text-xl font-bold text-gold mb-4">Os 12 Grupos</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { g: 'A', teams: ['🇲🇽 México', '🇺🇸 EUA', '🇨🇦 Canadá', '🇵🇦 Panamá'] },
            { g: 'B', teams: ['🇩🇪 Alemanha', '🇯🇵 Japão', '🇨🇱 Chile', '🇿🇦 África do Sul'] },
            { g: 'C', teams: ['🇪🇸 Espanha', '🇧🇷 Brasil', '🇨🇮 Costa do Marfim', '🇷🇸 Sérvia'] },
            { g: 'D', teams: ['🇫🇷 França', '🇦🇷 Argentina', '🇳🇿 Nova Zelândia', '🇲🇦 Marrocos'] },
            { g: 'E', teams: ['🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra', '🇨🇴 Colômbia', '🇺🇦 Ucrânia', '🇸🇳 Senegal'] },
            { g: 'F', teams: ['🇵🇹 Portugal', '🇳🇱 Holanda', '🇪🇨 Equador', '🇸🇦 Arábia Saudita'] },
            { g: 'G', teams: ['🇧🇪 Bélgica', '🇺🇾 Uruguai', '🇩🇿 Argélia', '🇳🇬 Nigéria'] },
            { g: 'H', teams: ['🇮🇹 Itália', '🇦🇺 Austrália', '🇰🇷 Coreia do Sul', '🇮🇷 Irão'] },
            { g: 'I', teams: ['🇭🇷 Croácia', '🇪🇬 Egito', '🇨🇭 Suíça', '🇹🇭 Tailândia'] },
            { g: 'J', teams: ['🇹🇷 Turquia', '🇩🇰 Dinamarca', '🇨🇲 Camarões', '🇭🇳 Honduras'] },
            { g: 'K', teams: ['🇦🇹 Áustria', '🇵🇾 Paraguai', '🇬🇭 Gana', '🇸🇻 El Salvador'] },
            { g: 'L', teams: ['🇵🇱 Polónia', '🇵🇪 Peru', '🇨🇩 RD Congo', '🇹🇳 Tunísia'] },
          ].map(({ g, teams }) => (
            <div key={g} className="bg-black/20 rounded-xl p-3">
              <div className="text-gold font-bold mb-2">Grupo {g}</div>
              <div className="space-y-1">
                {teams.map((t) => (
                  <div key={t} className="text-white/80 text-xs">{t}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
