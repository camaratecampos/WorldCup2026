import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { queryOne } from '../db';
import { signToken } from '../auth';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  if (typeof username !== 'string' || username.length < 3) {
    res.status(400).json({ error: 'Username must be at least 3 characters' });
    return;
  }

  if (typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  try {
    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (existing) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }

    const hash = bcrypt.hashSync(password, 10);
    const newUser = await queryOne<{ id: number }>(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
      [username, hash]
    );
    const userId = newUser!.id;

    const token = signToken({ userId, username });
    res.json({ token, username, userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  try {
    const user = await queryOne<{ id: number; username: string; password_hash: string }>(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken({ userId: user.id, username: user.username });
    res.json({ token, username: user.username, userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
