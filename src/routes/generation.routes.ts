import express from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth } from '../middleware/auth.middleware';
import { postGenerationHandler, getGenerationsHandler } from '../controllers/generation.controller';
import dotenv from 'dotenv';

dotenv.config();
const uploadDir = process.env.UPLOAD_DIR || 'uploads';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG/PNG allowed'));
  },
});

export const generationsRouter = express.Router();

generationsRouter.get('/', requireAuth, getGenerationsHandler);
generationsRouter.post('/', requireAuth, upload.single('image'), postGenerationHandler);
