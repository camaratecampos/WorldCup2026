import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../auth';
import { calculateBetPoints, Phase } from '../scoring';

const router = Router();

// POST /api/bets - place or update a bet
router.post('/', authMiddleware, (req: AuthRequest, res: Response): void => {
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

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId) as
    | { id: number; phase: string; match_date: string; status: string }
    | undefined;

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
  db.prepare(`
    INSERT INTO bets (user_id, game_id, home_score, away_score, placed_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, game_id) DO UPDATE SET
      home_score = excluded.home_score,
      away_score = excluded.away_score,
      placed_at = excluded.placed_at
  `).run(req.user!.userId, gameId, homeScore, awayScore);

  res.json({ success: true });
});

// GET /api/bets/my - user's bets
router.get('/my', authMiddleware, (req: AuthRequest, res: Response): void => {
  const bets = db.prepare(`
    SELECT b.*, g.phase, g.group_name, g.home_team, g.away_team, g.match_date, g.venue,
           g.home_score as actual_home, g.away_score as actual_away, g.status
    FROM bets b
    JOIN games g ON b.game_id = g.id
    WHERE b.user_id = ?
    ORDER BY g.match_date ASC
  `).all(req.user!.userId);

  res.json(bets);
});

export default router;
