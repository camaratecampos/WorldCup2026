import { Router, Response, Request } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();

// GET /api/admin/check - check if user is admin
router.get('/check', authMiddleware, (req: AuthRequest, res: Response): void => {
  res.json({ isAdmin: req.user?.username === 'admin' });
});

// POST /api/admin/result - set game result (any logged in user for simplicity)
router.post('/result', authMiddleware, (req: AuthRequest, res: Response): void => {
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

  db.prepare(
    "UPDATE games SET home_score = ?, away_score = ?, status = 'finished' WHERE id = ?"
  ).run(homeScore, awayScore, gameId);

  res.json({ success: true, gameId, homeScore, awayScore });
});

// GET /api/admin/games - all games for admin (to set results)
router.get('/games', authMiddleware, (req: AuthRequest, res: Response): void => {
  if (req.user?.username !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  const games = db.prepare('SELECT * FROM games ORDER BY match_date ASC').all();
  res.json(games);
});

export default router;
