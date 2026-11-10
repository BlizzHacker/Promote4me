import { Router } from 'express';
import { all } from '../db.js';
import { publicJob, hydrateJob } from '../utils.js';
import { publicPlans, paymentProviders, mapProviders } from '../constants.js';
import { AUTHENTIK_URL } from '../constants.js';

const router = Router();

// GET /api/health
router.get('/health', (req, res) => res.json({ ok: true, product: 'Promote4.me', version: '4.0.0' }));

// GET /api/public/plans
router.get('/public/plans', (req, res) => res.json({
  plans: publicPlans,
  providers: paymentProviders,
  mapProviders,
  authentikUrl: AUTHENTIK_URL
}));

// GET /api/public/map-jobs
router.get('/public/map-jobs', (req, res) => {
  const jobs = all(
    "SELECT id,title,type,source,address,lat,lng,trade,budget_cents,work_mode,visibility,status,created_at FROM jobs WHERE COALESCE(is_public,0)=1 OR COALESCE(visibility,'private')='public' ORDER BY created_at DESC LIMIT 300"
  );
  const normalized = jobs.map((job) => ({
    ...job,
    lat: Number(job.lat || 37.0842),
    lng: Number(job.lng || -94.5133),
    available: !['Delivered','Verified','Rejected','Cancelled'].includes(job.status || ''),
    taken: ['In Progress','Submitted','Delivered','Verified'].includes(job.status || ''),
    reward: Number(job.budget_cents || job.reward_cents || 0)
  }));
  res.json({
    ok: true,
    version: '2.9.1',
    counts: {
      total: normalized.length,
      available: normalized.filter((j) => j.available && !j.taken).length,
      taken: normalized.filter((j) => j.taken).length,
      online: normalized.filter((j) => j.work_mode === 'online').length,
      inPerson: normalized.filter((j) => (j.work_mode || 'in_person') !== 'online').length
    },
    jobs: normalized
  });
});

// GET /api/public/beta-status
router.get('/public/beta-status', (req, res) => res.json({
  ok: true,
  version: '2.9.0',
  goals: [
    'public map', 'available/taken jobs', 'in-person marketplace',
    'online work queue', 'integration API tests', 'role/security audit'
  ],
  integrations: [
    'Shopify App Starter', 'WooCommerce Plugin', 'DoorDash profile',
    'Grubhub profile', 'Uber Eats profile', 'Instacart profile',
    'Shipt profile', 'Roadie profile', 'Walmart Spark profile',
    'Amazon Flex profile', 'Custom Courier profile'
  ],
  securityRules: [
    'tenant isolation', 'demo safety', 'team-scoped approvals',
    'manager/admin approval only', 'public applicant isolation'
  ]
}));

// GET /api/public/jobs/:id
router.get('/public/jobs/:id', (req, res) => {
  const job = publicJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ job: hydrateJob(job) });
});

export default router;
