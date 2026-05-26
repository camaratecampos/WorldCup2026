import express from 'express';
import cors from 'cors';
import { queryOne, execute } from './db';
import authRouter from './routes/auth';
import gamesRouter from './routes/games';
import betsRouter from './routes/bets';
import standingsRouter from './routes/standings';
import adminRouter from './routes/admin';
import resultsRouter from './routes/results';
import groupsRouter from './routes/groups';
import { authMiddleware, AuthRequest, signToken } from './auth';
import { Response } from 'express';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/games', gamesRouter);
app.use('/api/bets', betsRouter);
app.use('/api/standings', standingsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/results', resultsRouter);
app.use('/api/groups', groupsRouter);

app.get('/api/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await queryOne<{ id: number; username: string; team_pick: string | null; created_at: string }>(
      'SELECT id, username, team_pick, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
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

// PUT /api/me/username - user renames themselves
app.put('/api/me/username', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { username: newUsername } = req.body;
  if (!newUsername || typeof newUsername !== 'string' || newUsername.trim().length < 3) {
    res.status(400).json({ error: 'O nome deve ter pelo menos 3 caracteres' });
    return;
  }
  const trimmed = newUsername.trim();
  if (trimmed.toLowerCase() === 'admin') {
    res.status(400).json({ error: 'Nome não permitido' });
    return;
  }
  try {
    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2',
      [trimmed, req.user!.userId]
    );
    if (existing) {
      res.status(409).json({ error: 'Nome já está em uso' });
      return;
    }
    await execute('UPDATE users SET username = $1 WHERE id = $2', [trimmed, req.user!.userId]);
    const token = signToken({ userId: req.user!.userId, username: trimmed });
    res.json({ token, username: trimmed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/team-pick', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { team } = req.body;
  if (!team) { res.status(400).json({ error: 'Team is required' }); return; }

  const now = new Date();
  const tournamentStart = new Date('2026-06-11T00:00:00');
  if (now >= tournamentStart) {
    res.status(400).json({ error: 'Tournament has already started. Team pick is locked.' });
    return;
  }

  try {
    const { execute } = await import('./db');
    await execute('UPDATE users SET team_pick = $1 WHERE id = $2', [team, req.user!.userId]);
    res.json({ success: true, team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
