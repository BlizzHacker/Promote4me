import { Router } from 'express';
import { all, run, now } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

// POST /api/admin/cleanup-inactive
router.post('/cleanup-inactive', requireAuth, requireRole('super_admin'), (req, res) => {
  const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const stale = all(
    "SELECT id FROM tenants WHERE status='active' AND COALESCE(last_active_at, created_at) < ? AND plan='free'",
    [cutoff]
  );
  for (const t of stale) {
    run(
      "UPDATE tenants SET status='inactive_pending_delete', delete_after_inactive_at=? WHERE id=?",
      [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), t.id]
    );
  }
  res.json({ marked: stale.length, message: 'Free inactive tenants marked for deletion grace period.' });
});

export default router;
