import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'express-async-errors';
import path from 'path';
import { authRouter } from './routes/auth.routes';
import { generationsRouter } from './routes/generation.routes';
import { errorHandler } from './middleware/error.middleware';
import { ensureUploadDir } from './utils/fs';
import dotenv from 'dotenv';

dotenv.config();

ensureUploadDir();

export const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// serve uploaded files
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

app.use('/auth', authRouter);
app.use('/generations', generationsRouter);

app.get('/', (req, res) => res.json({ ok: true, message: 'AI Studio Mock API' }));

// error middleware
app.use(errorHandler);
