import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { row } from './db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_PROMOTE4ME_LOCAL_DEV_SECRET';

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signUser(user) {
  return jwt.sign({ id: user.id, tenant_id: user.tenant_id, role: user.role, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  if (!['super_admin', 'admin', 'manager'].includes(req.user?.role)) return res.status(403).json({ error: 'Admin access required' });
  next();
}

export function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ error: 'Super admin access required' });
  next();
}

export function publicId(prefix) {
  return `${prefix}-${nanoid(10)}`;
}

export function getCurrentUser(id) {
  return row('SELECT id, tenant_id, username, email, role, full_name, phone, photo_url, status FROM users WHERE id = ?', [id]);
}
