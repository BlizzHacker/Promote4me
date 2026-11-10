/**
 * CrypticRealm Developer Blog Routes
 * 
 * Public API for the CrypticRealm dev blog — no auth required.
 * GET /api/blog/posts returns all published posts sorted by date desc.
 * Query params: ?limit=N (default: all)
 */
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

const POSTS_PATH = path.join(__dirname, '..', 'data', 'blog-posts.json');

function loadPosts() {
  try {
    const raw = fs.readFileSync(POSTS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// GET /api/blog/posts
router.get('/blog/posts', (req, res) => {
  let posts = loadPosts();

  // Sort newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Optional limit
  const limit = parseInt(req.query.limit, 10);
  if (limit > 0) {
    posts = posts.slice(0, limit);
  }

  res.json({ ok: true, posts, count: posts.length });
});

export default router;
