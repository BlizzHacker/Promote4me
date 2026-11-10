import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import { UPLOAD_DIR } from './db.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${nanoid(8)}${path.extname(file.originalname || '.jpg')}`),
});

export const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });
