import { Router, Response } from 'express';
import { query, queryOne, execute } from '../db';
import { authMiddleware, AuthRequest } from '../auth';
import { calculateBetPoints, Phase } from '../scoring';

const router = Router();

// POST /api/bets - place or update a bet
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { gameId, homeScore, awayScore } = req.body;

  if (gameId == null || homeScore == null || awayScore == null) {
    res.status(400).json({ error: 'gameId, homeScore, and awayScore are required' });
    return;
  }

  if (typeof homeScore !== 'number' || typeof awayScore !== 'number') {
    res.status(400).json({ error: 'Scores must be numbers' });
    return;
  }

  if (homeScore < 0 || awayScore < 0) {
    res.status(400).json({ error: 'Scores cannot be negative' });
    return;
  }

  try {
    const game = await queryOne<{ id: number; phase: string; match_date: string; status: string }>(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    );

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    const now = new Date();
    const matchDate = new Date(game.match_date);

    if (now >= matchDate) {
      res.status(400).json({ error: 'Cannot place bet after game has started' });
      return;
    }

    // Upsert bet
    await execute(
      `INSERT INTO bets (user_id, game_id, home_score, away_score, placed_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, game_id) DO UPDATE SET
         home_score = EXCLUDED.home_score,
         away_score = EXCLUDED.away_score,
         placed_at = NOW()`,
      [req.user!.userId, gameId, homeScore, awayScore]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bets/my - user's bets
router.get('/my', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bets = await query(
      `SELECT b.*, g.phase, g.group_name, g.home_team, g.away_team, g.match_date, g.venue,
              g.home_score as actual_home, g.away_score as actual_away, g.status
       FROM bets b
       JOIN games g ON b.game_id = g.id
       WHERE b.user_id = $1
       ORDER BY g.match_date ASC`,
      [req.user!.userId]
    );

    res.json(bets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Suppress unused import warning
void calculateBetPoints;
void ('' as unknown as Phase);

export default router;
