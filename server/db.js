import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = process.env.P4ME_DATA_DIR || path.join(__dirname, '..', 'data');
export const UPLOAD_DIR = process.env.P4ME_UPLOAD_DIR || path.join(DATA_DIR, 'uploads');
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, 'promote4me.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

import { migrate as runMigrations } from './migrations/001_initial.js';
import { migrateCommander } from './migrations/002_social_commander.js';

export function migrate() {
  runMigrations();
  migrateCommander();
}

export function now() { return new Date().toISOString(); }
export function row(sql, params = []) { return db.prepare(sql).get(params); }
export function all(sql, params = []) { return db.prepare(sql).all(params); }
export function run(sql, params = []) { return db.prepare(sql).run(params); }
