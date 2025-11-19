import fs from 'fs';
import path from 'path';

export function ensureUploadDir(): void {
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  const p = path.resolve(uploadDir);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}
