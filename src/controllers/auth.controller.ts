import { Request, Response } from 'express';
import { z } from 'zod';
import { createUser, findUserByEmail } from '../services/auth.service';
import bcrypt from 'bcrypt';
import { signToken } from '../services/jwt.service';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signupHandler(req: Request, res: Response) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.errors },
    });
  }
  const { email, password, name } = parsed.data;

  const existing = findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: { code: 'USER_EXISTS', message: 'User already exists' } });
  }

  const user = await createUser(email, password, name);
  const token = signToken({ sub: user.id, email: user.email });
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
}

export async function loginHandler(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.errors },
    });
  }
  const { email, password } = parsed.data;
  const user = findUserByEmail(email);
  if (!user) {
    return res
      .status(401)
      .json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res
      .status(401)
      .json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
  }
  const token = signToken({ sub: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}
