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
import cronRouter from './routes/cron';
import { authMiddleware, AuthRequest, signToken } from './auth';
import { Response } from 'express';
import { TOURNAMENT_START } from '../../shared/tournament';

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
app.use('/api/cron', cronRouter);

app.get('/api/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await queryOne<{ id: number; username: string; team_pick: string | null; created_at: string; phone: string | null; force_password_reset: boolean }>(
      'SELECT id, username, team_pick, created_at, phone, force_password_reset FROM users WHERE id = $1',
      [req.user!.userId]
    );
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({
      id: user.id,
      username: user.username,
      teamPick: user.team_pick,
      createdAt: user.created_at,
      isAdmin: user.username === 'admin',
      phone: user.phone,
      forceReset: user.force_password_reset ?? false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/me/password - user sets a new password (clears force_password_reset flag)
app.put('/api/me/password', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { password } = req.body;
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }
  try {
    const bcrypt = await import('bcryptjs');
    const hash = bcrypt.hashSync(password, 10);
    await execute(
      'UPDATE users SET password_hash = $1, force_password_reset = FALSE WHERE id = $2',
      [hash, req.user!.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/me/phone - user sets their phone number
app.put('/api/me/phone', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { phone } = req.body;
  if (!phone || typeof phone !== 'string' || phone.trim().length < 5) {
    res.status(400).json({ error: 'Phone number must be at least 5 characters' });
    return;
  }
  try {
    await execute('UPDATE users SET phone = $1 WHERE id = $2', [phone.trim(), req.user!.userId]);
    res.json({ success: true });
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
  if (now >= TOURNAMENT_START) {
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
