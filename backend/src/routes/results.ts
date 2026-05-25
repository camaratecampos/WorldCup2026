import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../auth';
import { calculateBetPoints, Phase } from '../scoring';

const router = Router();

interface GameWithBet {
  id: number;
  phase: Phase;
  group_name: string | null;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  bet_home: number | null;
  bet_away: number | null;
  points: number | null;
}

// GET /api/results - games with results and bets for current user
router.get('/', authMiddleware, (req: AuthRequest, res: Response): void => {
  const games = db.prepare(`
    SELECT g.*,
           b.home_score as bet_home,
           b.away_score as bet_away
    FROM games g
    LEFT JOIN bets b ON b.game_id = g.id AND b.user_id = ?
    WHERE g.status = 'finished'
    ORDER BY g.match_date DESC
  `).all(req.user!.userId) as (Omit<GameWithBet, 'points'> & { bet_home: number | null; bet_away: number | null })[];

  const result: GameWithBet[] = games.map((g) => {
    let points: number | null = null;

    if (g.bet_home != null && g.bet_away != null && g.home_score != null && g.away_score != null) {
      points = calculateBetPoints(
        g.phase,
        g.bet_home,
        g.bet_away,
        g.home_score,
        g.away_score
      );
    }

    return { ...g, points };
  });

  res.json(result);
});

export default router;
