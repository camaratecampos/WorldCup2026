import { Router, Request, Response } from 'express';
import { query } from '../db';
import { calculateBetPoints, calculateTeamPickPoints, Phase, getTrend } from '../scoring';

const router = Router();

interface UserRow {
  id: number;
  username: string;
  team_pick: string | null;
}

interface BetRow {
  user_id: number;
  game_id: number;
  home_score: number;
  away_score: number;
  phase: Phase;
  actual_home: number | null;
  actual_away: number | null;
  status: string;
}

interface GameRow {
  id: number;
  phase: Phase;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
}

// Build a team → bonus lookup in one pass so standings doesn't query per user
async function computeTeamPickBonusMap(): Promise<Map<string, number>> {
  const bonus = new Map<string, number>();

  const knockoutGames = await query<GameRow>(
    "SELECT * FROM games WHERE phase IN ('sf', 'final') AND status = 'finished'"
  );

  for (const game of knockoutGames) {
    if (game.home_score == null || game.away_score == null) continue;
    const trend = getTrend(game.home_score, game.away_score);
    if (trend === 'D') continue; // knockout games can't end in a draw (penalties decide)
    const winner = trend === 'H' ? game.home_team : game.away_team;
    const loser = trend === 'H' ? game.away_team : game.home_team;

    if (game.phase === 'final') {
      bonus.set(winner, calculateTeamPickPoints('winner'));
      bonus.set(loser, calculateTeamPickPoints('final_lost'));
    } else {
      bonus.set(loser, calculateTeamPickPoints('semi_lost'));
    }
  }

  return bonus;
}

// GET /api/standings - participant leaderboard
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await query<UserRow>('SELECT id, username, team_pick FROM users');

    const bets = await query<BetRow>(`
      SELECT b.user_id, b.game_id, b.home_score, b.away_score,
             g.phase, g.home_score as actual_home, g.away_score as actual_away, g.status
      FROM bets b
      JOIN games g ON b.game_id = g.id
    `);

    // Group bets by user
    const betsByUser: Record<number, BetRow[]> = {};
    for (const bet of bets) {
      if (!betsByUser[bet.user_id]) betsByUser[bet.user_id] = [];
      betsByUser[bet.user_id].push(bet);
    }

    const bonusMap = await computeTeamPickBonusMap();

    const standings = users.map((user) => {
      const userBets = betsByUser[user.id] || [];
      let betPoints = 0;
      let gamesBet = 0;
      let gamesWithPoints = 0;

      for (const bet of userBets) {
        gamesBet++;
        if (bet.status === 'finished' && bet.actual_home != null && bet.actual_away != null) {
          const pts = calculateBetPoints(
            bet.phase,
            bet.home_score,
            bet.away_score,
            bet.actual_home,
            bet.actual_away
          );
          betPoints += pts;
          if (pts > 0) gamesWithPoints++;
        }
      }

      const teamPickBonus = user.team_pick ? (bonusMap.get(user.team_pick) ?? 0) : 0;
      const totalPoints = betPoints + teamPickBonus;

      return {
        userId: user.id,
        username: user.username,
        teamPick: user.team_pick,
        totalPoints,
        betPoints,
        teamPickBonus,
        gamesBet,
        gamesWithPoints,
      };
    });

    standings.sort((a, b) => b.totalPoints - a.totalPoints);

    // Add rank
    const ranked = standings.map((s, i) => ({ ...s, rank: i + 1 }));

    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/standings/results - games with results and bets for current user
router.get('/results', (_req: Request, res: Response): void => {
  // This is handled separately - just re-export or handle inline
  res.json([]);
});

export default router;
