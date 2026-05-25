import { Router, Response } from 'express';
import { query, queryOne, execute } from '../db';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();

// GET /api/admin/check - check if user is admin
router.get('/check', authMiddleware, (req: AuthRequest, res: Response): void => {
  res.json({ isAdmin: req.user?.username === 'admin' });
});

// POST /api/admin/result - set game result (admin only)
router.post('/result', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
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

    await execute(
      "UPDATE games SET home_score = $1, away_score = $2, status = 'finished' WHERE id = $3",
      [homeScore, awayScore, gameId]
    );

    res.json({ success: true, gameId, homeScore, awayScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/games - all games for admin (to set results)
router.get('/games', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user?.username !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  try {
    const games = await query('SELECT * FROM games ORDER BY match_date ASC');
    res.json(games);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
