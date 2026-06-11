import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();

// GET /api/games - all games
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const games = await query('SELECT * FROM games ORDER BY match_date ASC');
    res.json(games);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/games/date/:date - games for a specific date (YYYY-MM-DD)
router.get('/date/:date', async (req: Request, res: Response): Promise<void> => {
  const { date } = req.params;
  try {
    const games = await query(
      'SELECT * FROM games WHERE DATE(match_date) = $1 ORDER BY match_date ASC',
      [date]
    );
    res.json(games);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/games/me - user info (kept for compatibility)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await queryOne<{ id: number; username: string; team_pick: string | null; created_at: string }>(
      'SELECT id, username, team_pick, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      teamPick: user.team_pick,
      createdAt: user.created_at,
      isAdmin: user.username === 'admin',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
