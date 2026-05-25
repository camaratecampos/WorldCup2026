import { useEffect, useState, useCallback } from 'react';
import api from '../../api';
import { Game, Bet } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Flag } from '../ui/Flag';
import { showToast } from '../ui/Toast';
import { useAuth } from '../../context/AuthContext';

const PT_TZ = 'Europe/Lisbon';

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: PT_TZ });
}

function formatDateLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: PT_TZ });
}

// Returns YYYY-MM-DD in Portugal timezone
function getPortugalDate(dateStr: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: PT_TZ }).format(new Date(dateStr));
}

interface GameCardProps {
  game: Game;
  bet: Bet | undefined;
  onBetPlaced: () => void;
}

function GameCard({ game, bet, onBetPlaced }: GameCardProps) {
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
      showToast('Insere um resultado válido', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.placeBet(game.id, h, a);
      showToast('Aposta guardada!', 'success');
      setEditing(false);
      onBetPlaced();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao guardar aposta', 'error');
    } finally {
      setSaving(false);
    }
  };

  const phaseLabel: Record<string, string> = {
    group: `Grupo ${game.group_name}`,
    r32: 'Dezasseis avos',
    r16: 'Oitavos de Final',
    qf: 'Quartos de Final',
    sf: 'Meia Final',
    '3rd': '3º e 4º Lugar',
    final: 'Final',
  };

  return (
    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/50">{phaseLabel[game.phase] || game.phase}</span>
        <span className="text-xs text-white/50">{formatTime(game.match_date)} • {game.venue}</span>
      </div>

      <div className="flex items-center justify-between">
        {/* Home */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <Flag team={game.home_team} size="lg" />
          <span className="text-white text-xs font-medium text-center leading-tight">{game.home_team}</span>
        </div>

        {/* Score / Bet */}
        <div className="flex-1 flex flex-col items-center">
          {game.status === 'finished' ? (
            <div className="text-white font-bold text-xl">
              {game.home_score} - {game.away_score}
            </div>
          ) : (
            <span className="text-white/40 text-xs">vs</span>
          )}

          {/* Bet input / display */}
          {canBet && (!hasBet || editing) ? (
            <div className="mt-2 flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="20"
                value={homeInput}
                onChange={(e) => setHomeInput(e.target.value)}
                className="w-10 bg-primary-dark border border-white/20 rounded-lg text-center text-white text-sm py-1 focus:outline-none focus:border-gold"
                placeholder="0"
              />
              <span className="text-white/60">-</span>
              <input
                type="number"
                min="0"
                max="20"
                value={awayInput}
                onChange={(e) => setAwayInput(e.target.value)}
                className="w-10 bg-primary-dark border border-white/20 rounded-lg text-center text-white text-sm py-1 focus:outline-none focus:border-gold"
                placeholder="0"
              />
            </div>
          ) : hasBet && !editing ? (
            <div className="mt-2 text-center">
              <div className="text-gold text-sm font-bold">{bet!.home_score} - {bet!.away_score}</div>
              <div className="text-white/40 text-xs">A tua aposta</div>
            </div>
          ) : !hasBet && !canBet ? (
            <div className="mt-2 text-white/40 text-xs text-center">Sem aposta</div>
          ) : null}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <Flag team={game.away_team} size="lg" />
          <span className="text-white text-xs font-medium text-center leading-tight">{game.away_team}</span>
        </div>
      </div>

      {/* Action buttons */}
      {canBet && (!hasBet || editing) && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gold text-primary-dark font-bold py-2 rounded-xl text-sm disabled:opacity-50"
          >
            {saving ? 'A guardar...' : hasBet ? 'Actualizar' : 'Apostar'}
          </button>
          {editing && (
            <button
              onClick={() => { setEditing(false); setHomeInput(String(bet!.home_score)); setAwayInput(String(bet!.away_score)); }}
              className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm"
            >
              Cancelar
            </button>
          )}
        </div>
      )}

      {canBet && hasBet && !editing && (
        <button
          onClick={() => setEditing(true)}
          className="mt-3 w-full bg-white/10 text-white/70 text-xs py-1.5 rounded-xl hover:bg-white/20"
        >
          ✏️ Editar aposta
        </button>
      )}
    </div>
  );
}

// Admin result card
interface AdminCardProps {
  game: Game;
  onResultSet: () => void;
}

function AdminResultCard({ game, onResultSet }: AdminCardProps) {
  const [homeInput, setHomeInput] = useState(game.home_score != null ? String(game.home_score) : '');
  const [awayInput, setAwayInput] = useState(game.away_score != null ? String(game.away_score) : '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const h = parseInt(homeInput);
    const a = parseInt(awayInput);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      showToast('Resultado inválido', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.setResult(game.id, h, a);
      showToast('Resultado guardado!', 'success');
      onResultSet();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-orange-900/30 rounded-2xl p-4 border border-orange-500/30">
      <div className="text-orange-300 text-xs mb-2 font-semibold">ADMIN: Inserir Resultado</div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-white flex-1 flex items-center gap-1"><Flag team={game.home_team} size="sm" />{game.home_team}</span>
        <input
          type="number"
          min="0"
          value={homeInput}
          onChange={(e) => setHomeInput(e.target.value)}
          className="w-10 bg-primary-dark border border-orange-500/40 rounded-lg text-center text-white text-sm py-1"
        />
        <span className="text-white/60">-</span>
        <input
          type="number"
          min="0"
          value={awayInput}
          onChange={(e) => setAwayInput(e.target.value)}
          className="w-10 bg-primary-dark border border-orange-500/40 rounded-lg text-center text-white text-sm py-1"
        />
        <span className="text-sm text-white flex-1 text-right flex items-center justify-end gap-1">{game.away_team}<Flag team={game.away_team} size="sm" /></span>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-3 w-full bg-orange-500 text-white font-bold py-2 rounded-xl text-sm disabled:opacity-50"
      >
        {saving ? 'A guardar...' : game.status === 'finished' ? 'Actualizar Resultado' : 'Definir Resultado'}
      </button>
    </div>
  );
}

export function Bets() {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState<string[]>([]);
  const [adminMode, setAdminMode] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadGames = useCallback(async () => {
    setLoading(true);
    try {
      const [allGames, myBets] = await Promise.all([api.getGames(), api.getMyBets()]);
      setBets(myBets);

      // Group by Portugal timezone date
      const uniqueDates = Array.from(
        new Set(allGames.map((g) => getPortugalDate(g.match_date)))
      ).sort();
      setDates(uniqueDates);

      // Select today or first upcoming date (in Portugal timezone)
      const today = getPortugalDate(new Date().toISOString());
      const upcoming = uniqueDates.find((d) => d >= today) || uniqueDates[0] || today;
      if (!selectedDate) setSelectedDate(upcoming);

      setGames(allGames);
    } catch {
      showToast('Erro ao carregar jogos', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadGames();
  }, []);

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await api.syncESPN();
      showToast(`Sync OK: ${result.synced} jogos`, 'success');
      await loadGames();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro no sync', 'error');
    } finally {
      setSyncing(false);
    }
  }

  const gamesForDate = games.filter((g) => getPortugalDate(g.match_date) === selectedDate);
  const betMap = new Map(bets.map((b) => [b.game_id, b]));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Admin controls */}
      {user?.isAdmin && (
        <div className="bg-orange-900/30 rounded-2xl p-3 border border-orange-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-orange-300 text-sm font-semibold">Modo Admin</span>
            <button
              onClick={() => setAdminMode(!adminMode)}
              className={`px-4 py-1.5 rounded-xl text-sm font-bold ${adminMode ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/70'}`}
            >
              {adminMode ? 'Activo' : 'Inactivo'}
            </button>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-semibold py-2 rounded-xl disabled:opacity-50"
          >
            {syncing ? 'A sincronizar ESPN...' : '🔄 Sincronizar jogos / resultados (ESPN)'}
          </button>
        </div>
      )}

      {/* Date selector */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>
          {dates.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDate === d
                  ? 'bg-gold text-primary-dark'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {formatDateLabel(d + 'T12:00:00')}
            </button>
          ))}
        </div>
      </div>

      {/* Games */}
      {gamesForDate.length === 0 ? (
        <div className="text-center text-white/50 py-12">
          <div className="text-4xl mb-3">⚽</div>
          <p>Sem jogos nesta data</p>
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
