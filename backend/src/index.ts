import express from 'express';
import cors from 'cors';
import './db'; // Initialize database
import authRouter from './routes/auth';
import gamesRouter from './routes/games';
import betsRouter from './routes/bets';
import standingsRouter from './routes/standings';
import adminRouter from './routes/admin';
import resultsRouter from './routes/results';
import groupsRouter from './routes/groups';
import { authMiddleware, AuthRequest } from './auth';
import { Response } from 'express';
import db from './db';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/games', gamesRouter);
app.use('/api/bets', betsRouter);
app.use('/api/standings', standingsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/results', resultsRouter);
app.use('/api/groups', groupsRouter);

// GET /api/me
app.get('/api/me', authMiddleware, (req: AuthRequest, res: Response): void => {
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

// POST /api/team-pick
app.post('/api/team-pick', authMiddleware, (req: AuthRequest, res: Response): void => {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
