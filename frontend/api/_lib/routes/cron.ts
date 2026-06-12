import { Router, Request, Response } from 'express';
import { syncFromESPN } from '../sync';

const router = Router();

// GET /api/cron/sync - called by Vercel Cron every 30 minutes
// Vercel automatically adds Authorization: Bearer <CRON_SECRET> to cron requests
router.get('/sync', async (req: Request, res: Response): Promise<void> => {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${secret}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  try {
    const result = await syncFromESPN();
    console.log(`[cron] ESPN sync complete: ${result.synced} games synced, ${result.errors.length} errors`);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[cron] ESPN sync failed:', err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;
