import { Router, Response } from 'express';
import { query, queryOne, execute } from '../db';
import { authMiddleware, AuthRequest } from '../auth';
import { syncFromESPN } from '../sync';

const router = Router();

function requireAdmin(req: AuthRequest, res: Response): boolean {
  if (req.user?.username !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return false;
  }
  return true;
}

// GET /api/admin/check
router.get('/check', authMiddleware, (req: AuthRequest, res: Response): void => {
  res.json({ isAdmin: req.user?.username === 'admin' });
});

// POST /api/admin/result - set game result
router.post('/result', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireAdmin(req, res)) return;

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
    const game = await queryOne<{ id: number }>('SELECT id FROM games WHERE id = $1', [gameId]);
    if (!game) { res.status(404).json({ error: 'Game not found' }); return; }

    await execute(
      "UPDATE games SET home_score=$1, away_score=$2, status='finished' WHERE id=$3",
      [homeScore, awayScore, gameId]
    );
    res.json({ success: true, gameId, homeScore, awayScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/games
router.get('/games', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const games = await query('SELECT * FROM games ORDER BY match_date ASC');
    res.json(games);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/sync - sync games and results from ESPN
router.post('/sync', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const result = await syncFromESPN();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/users - list all users
router.get('/users', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const users = await query<{ id: number; username: string; phone: string | null }>(
      'SELECT id, username, phone FROM users ORDER BY id ASC'
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/users/:userId/username - admin renames any user
router.put('/users/:userId/username', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const userId = parseInt(req.params.userId, 10);
  const { username: newUsername } = req.body;

  if (!newUsername || typeof newUsername !== 'string' || newUsername.trim().length < 3) {
    res.status(400).json({ error: 'O nome deve ter pelo menos 3 caracteres' });
    return;
  }
  const trimmed = newUsername.trim();

  try {
    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2',
      [trimmed, userId]
    );
    if (existing) {
      res.status(409).json({ error: 'Nome já está em uso' });
      return;
    }
    await execute('UPDATE users SET username = $1 WHERE id = $2', [trimmed, userId]);
    res.json({ success: true, userId, username: trimmed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:userId - delete user and all their bets
router.delete('/users/:userId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const userId = parseInt(req.params.userId, 10);
  try {
    const user = await queryOne<{ username: string }>('SELECT username FROM users WHERE id = $1', [userId]);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    if (user.username === 'admin') { res.status(400).json({ error: 'Cannot delete admin' }); return; }
    await execute('DELETE FROM bets WHERE user_id = $1', [userId]);
    await execute('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/users/:userId/password - reset a user's password
router.put('/users/:userId/password', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const userId = parseInt(req.params.userId, 10);
  const { password } = req.body;
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }
  try {
    const user = await queryOne<{ id: number }>('SELECT id FROM users WHERE id = $1', [userId]);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const bcrypt = await import('bcryptjs');
    const hash = bcrypt.hashSync(password, 10);
    await execute('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
