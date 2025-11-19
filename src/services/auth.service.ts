import { db } from '../models/db';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ? Number(process.env.BCRYPT_SALT_ROUNDS) : 10;

export async function createUser(email: string, password: string, name?: string) {
  const id = randomUUID();
  const created_at = new Date().toISOString();
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const stmt = db.prepare('INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)');
  stmt.run(id, email, password_hash, name || null, created_at);
  return { id, email, name, created_at };
}

export function findUserByEmail(email: string) {
  const stmt = db.prepare('SELECT id, email, name, created_at, password_hash FROM users WHERE email = ?');
  return stmt.get(email) as (undefined | { id: string; email: string; name?: string; created_at: string; password_hash: string });
}
