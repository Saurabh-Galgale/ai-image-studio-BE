import { db } from '../models/db';
import { randomUUID } from 'crypto';

export function createGenerationRecord(userId: string, prompt: string | undefined, style: string | undefined, inputPath: string, resultPath: string, status: string) {
  const id = randomUUID();
  const created_at = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO generations (id, user_id, prompt, style, input_image_path, result_image_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, userId, prompt || null, style || null, inputPath || null, resultPath || null, status, created_at);
  return { id, user_id: userId, prompt, style, input_image_path: inputPath, result_image_path: resultPath, status, created_at };
}

export function getGenerationsForUser(userId: string, limit = 5) {
  const stmt = db.prepare('SELECT id, user_id, prompt, style, input_image_path, result_image_path, status, created_at FROM generations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
  const rows = stmt.all(userId, limit);
  return rows;
}
