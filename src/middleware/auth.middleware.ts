import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwt.service';
import { db } from '../models/db';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: { code: 'UNAUTHORIZED', message: 'Missing Authorization header' } });
  }
  const token = auth.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
  }
  // attach user id and email
  req.user = { id: payload.sub, email: payload.email };
  return next();
}
