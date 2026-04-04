// Sync route - data synchronization endpoints

import { Router } from 'express';

const router = Router();

// Sync diary entries
router.post('/diary', async (req: any, res: any) => {
  try {
    const { entries } = req.body;
    // TODO: Save to Supabase
    res.json({ synced: entries?.length || 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sync daily stats
router.post('/stats', async (req: any, res: any) => {
  try {
    const { stats } = req.body;
    // TODO: Save to Supabase
    res.json({ synced: stats?.length || 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Pull data from cloud
router.get('/pull', async (req: any, res: any) => {
  try {
    // TODO: Read from Supabase
    res.json({ diary_entries: [], daily_stats: [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
