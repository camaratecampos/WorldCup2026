import { Router, Request, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../auth';

const router = Router();

// GET /api/games - all games
router.get('/', (req: Request, res: Response): void => {
  const games = db.prepare('SELECT * FROM games ORDER BY match_date ASC').all();
  res.json(games);
});

// GET /api/games/date/:date - games for a specific date (YYYY-MM-DD)
router.get('/date/:date', (req: Request, res: Response): void => {
  const { date } = req.params;
  const games = db
    .prepare("SELECT * FROM games WHERE date(match_date) = ? ORDER BY match_date ASC")
    .all(date);
  res.json(games);
});

// GET /api/me - user info
router.get('/me', authMiddleware, (req: AuthRequest, res: Response): void => {
  const user = db
    .prepare('SELECT id, username, team_pick, created_at FROM users WHERE id = ?')
    .get(req.user!.userId) as { id: number; username: string; team_pick: string | null; created_at: string } | undefined;

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
});

// POST /api/team-pick - set team pick (only before tournament starts Jun 11)
router.post('/team-pick', authMiddleware, (req: AuthRequest, res: Response): void => {
  const { team } = req.body;

  if (!team) {
    res.status(400).json({ error: 'Team is required' });
    return;
  }

  const now = new Date();
  const tournamentStart = new Date('2026-06-11T00:00:00');
  if (now >= tournamentStart) {
    res.status(400).json({ error: 'Tournament has already started. Team pick is locked.' });
    return;
  }

  db.prepare('UPDATE users SET team_pick = ? WHERE id = ?').run(team, req.user!.userId);
  res.json({ success: true, team });
});

export default router;
